package dev.danielk.startjava17.stats;

import dev.danielk.startjava17.config.CacheNames;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class StatsService {

    private final StatsQueryRepository repository;

    public StatsService(StatsQueryRepository repository) {
        this.repository = repository;
    }

    @Cacheable(value = CacheNames.STATS_ORDER_MONTHLY, key = "#month ?: 'all'")
    public List<OrderMonthlyStats> getOrderMonthlyStats(String month) {
        return repository.findOrderMonthlyStats(month);
    }

    @Cacheable(value = CacheNames.STATS_ORDER_DAILY, key = "#month")
    public List<OrderDailyStats> getOrderDailyStats(String month) {
        return repository.findOrderDailyStats(month);
    }

    @Cacheable(value = CacheNames.STATS_PRODUCT_MONTHLY, key = "#month")
    public List<ProductMonthlySales> getProductMonthlySales(String month) {
        return repository.findProductMonthlySales(month);
    }

    @Cacheable(value = CacheNames.STATS_ORDER_DAILY, key = "'dayOfWeek'")
    public List<OrderDailyStats> getOrderDayOfWeekStats() {
        return repository.findOrderDayOfWeekStats();
    }
}
