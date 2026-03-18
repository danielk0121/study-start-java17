package dev.danielk.orderservice.order;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import javax.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * JPA 영속성 전용 엔티티 — 도메인 record(Order)와 분리
 */
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "orders")
@EntityListeners(AuditingEntityListener.class)
public class OrderEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "member_id", nullable = false)
    private Long memberId;

    @Column(name = "shipping_address", nullable = false)
    private String shippingAddress;

    @Column(name = "shipping_zip_code", nullable = false)
    private String shippingZipCode;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<OrderItemEntity> items = new ArrayList<>();

    public OrderEntity(Long id, Long memberId, OrderStatus status, String shippingAddress, String shippingZipCode, LocalDateTime createdAt) {
        this.id = id;
        this.memberId = memberId;
        this.status = status;
        this.shippingAddress = shippingAddress;
        this.shippingZipCode = shippingZipCode;
        this.createdAt = createdAt;
    }

    public static OrderEntity from(Order order) {
        var entity = new OrderEntity(order.id(), order.memberId(), order.status(), order.shippingAddress(), order.shippingZipCode(), order.createdAt());
        for (var item : order.items()) {
            entity.items.add(new OrderItemEntity(entity, item.productId(), item.quantity()));
        }
        return entity;
    }

    public Order toDomain() {
        var domainItems = items.stream()
                .map(OrderItemEntity::toDomain)
                .toList();
        return new Order(id, memberId, domainItems, status, shippingAddress, shippingZipCode, createdAt, updatedAt);
    }
}
