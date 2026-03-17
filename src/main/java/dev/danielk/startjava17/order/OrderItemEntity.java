package dev.danielk.startjava17.order;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import javax.persistence.*;

/**
 * JPA 영속성 전용 엔티티 — 도메인 record(OrderItem)와 분리
 */
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "order_items")
public class OrderItemEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private OrderEntity order;

    @Column(name = "product_id", nullable = false)
    private Long productId;

    @Column(nullable = false)
    private int quantity;

    public OrderItemEntity(OrderEntity order, Long productId, int quantity) {
        this.order = order;
        this.productId = productId;
        this.quantity = quantity;
    }

    public OrderItem toDomain() {
        return new OrderItem(productId, quantity);
    }
}
