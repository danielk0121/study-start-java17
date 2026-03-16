package dev.danielk.startjava17.stats;

import com.querydsl.core.types.Projections;
import com.querydsl.core.types.dsl.CaseBuilder;
import com.querydsl.core.types.dsl.Expressions;
import com.querydsl.core.types.dsl.StringTemplate;
import com.querydsl.jpa.impl.JPAQueryFactory;
import dev.danielk.startjava17.order.OrderStatus;
import dev.danielk.startjava17.order.QOrderEntity;
import dev.danielk.startjava17.order.QOrderItemEntity;
import dev.danielk.startjava17.product.QProductEntity;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public class StatsQueryRepository {

    private final JPAQueryFactory queryFactory;

    private static final QOrderEntity order = QOrderEntity.orderEntity;
    private static final QOrderItemEntity orderItem = QOrderItemEntity.orderItemEntity;
    private static final QProductEntity product = QProductEntity.productEntity;

    public StatsQueryRepository(JPAQueryFactory queryFactory) {
        this.queryFactory = queryFactory;
    }

    // 월별 주문 통계 (전체 또는 특정 월)
    public List<OrderMonthlyStats> findOrderMonthlyStats(String month) {
        StringTemplate orderMonth = Expressions.stringTemplate("DATE_FORMAT({0}, '%Y-%m')", order.createdAt);

        var confirmed = new CaseBuilder().when(order.status.eq(OrderStatus.CONFIRMED)).then(1L).otherwise(0L).sum();
        var pending   = new CaseBuilder().when(order.status.eq(OrderStatus.PENDING)).then(1L).otherwise(0L).sum();
        var cancelled = new CaseBuilder().when(order.status.eq(OrderStatus.CANCELLED)).then(1L).otherwise(0L).sum();

        var query = queryFactory
                .select(Projections.constructor(OrderMonthlyStats.class,
                        orderMonth,
                        order.id.count(),
                        confirmed,
                        pending,
                        cancelled,
                        Expressions.numberTemplate(Double.class,
                                "ROUND({0} * 100.0 / {1}, 1)",
                                cancelled, order.id.count())
                ))
                .from(order)
                .groupBy(orderMonth);

        if (month != null && !month.isBlank()) {
            query.where(orderMonth.eq(month));
        }

        return query.orderBy(orderMonth.asc()).fetch();
    }

    // 일별 주문 통계 (특정 월 필수)
    public List<OrderDailyStats> findOrderDailyStats(String month) {
        StringTemplate orderMonthExpr = Expressions.stringTemplate("DATE_FORMAT({0}, '%Y-%m')", order.createdAt);
        StringTemplate orderDateExpr  = Expressions.stringTemplate("DATE({0})", order.createdAt);
        StringTemplate dayOfWeekExpr  = Expressions.stringTemplate("DAYOFWEEK({0})", order.createdAt);

        var confirmed = new CaseBuilder().when(order.status.eq(OrderStatus.CONFIRMED)).then(1L).otherwise(0L).sum();
        var pending   = new CaseBuilder().when(order.status.eq(OrderStatus.PENDING)).then(1L).otherwise(0L).sum();
        var cancelled = new CaseBuilder().when(order.status.eq(OrderStatus.CANCELLED)).then(1L).otherwise(0L).sum();

        return queryFactory
                .select(Projections.constructor(OrderDailyStats.class,
                        orderDateExpr.as("orderDate"),
                        orderMonthExpr,
                        dayOfWeekExpr.castToNum(Integer.class),
                        order.id.count(),
                        confirmed,
                        pending,
                        cancelled
                ))
                .from(order)
                .where(orderMonthExpr.eq(month))
                .groupBy(orderDateExpr, orderMonthExpr, dayOfWeekExpr)
                .orderBy(orderDateExpr.asc())
                .fetch();
    }

    // 월별 상품 판매 통계 (CONFIRMED 기준, 특정 월 필수)
    public List<ProductMonthlySales> findProductMonthlySales(String month) {
        StringTemplate orderMonthExpr = Expressions.stringTemplate("DATE_FORMAT({0}, '%Y-%m')", order.createdAt);

        return queryFactory
                .select(Projections.constructor(ProductMonthlySales.class,
                        orderMonthExpr,
                        product.id,
                        product.name,
                        product.category.stringValue(),
                        orderItem.quantity.sum().longValue(),
                        order.id.countDistinct()
                ))
                .from(order)
                .join(orderItem).on(orderItem.order.id.eq(order.id))
                .join(product).on(product.id.eq(orderItem.productId))
                .where(
                        order.status.eq(OrderStatus.CONFIRMED),
                        orderMonthExpr.eq(month)
                )
                .groupBy(orderMonthExpr, product.id, product.name, product.category)
                .orderBy(orderItem.quantity.sum().desc())
                .fetch();
    }

    // 요일별 주문 패턴 집계 (전체 기간)
    public List<OrderDailyStats> findOrderDayOfWeekStats() {
        StringTemplate orderMonthExpr = Expressions.stringTemplate("DATE_FORMAT({0}, '%Y-%m')", order.createdAt);
        StringTemplate orderDateExpr  = Expressions.stringTemplate("DATE({0})", order.createdAt);
        StringTemplate dayOfWeekExpr  = Expressions.stringTemplate("DAYOFWEEK({0})", order.createdAt);

        var confirmed = new CaseBuilder().when(order.status.eq(OrderStatus.CONFIRMED)).then(1L).otherwise(0L).sum();
        var pending   = new CaseBuilder().when(order.status.eq(OrderStatus.PENDING)).then(1L).otherwise(0L).sum();
        var cancelled = new CaseBuilder().when(order.status.eq(OrderStatus.CANCELLED)).then(1L).otherwise(0L).sum();

        return queryFactory
                .select(Projections.constructor(OrderDailyStats.class,
                        orderDateExpr.as("orderDate"),
                        orderMonthExpr,
                        dayOfWeekExpr.castToNum(Integer.class),
                        order.id.count(),
                        confirmed,
                        pending,
                        cancelled
                ))
                .from(order)
                .groupBy(orderDateExpr, orderMonthExpr, dayOfWeekExpr)
                .orderBy(dayOfWeekExpr.castToNum(Integer.class).asc())
                .fetch();
    }
}
