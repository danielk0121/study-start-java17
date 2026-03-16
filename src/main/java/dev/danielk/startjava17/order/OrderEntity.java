package dev.danielk.startjava17.order;

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
@Entity
@Table(name = "orders")
@EntityListeners(AuditingEntityListener.class)
public class OrderEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "member_id", nullable = false)
    private Long memberId;

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

    protected OrderEntity() {}

    public OrderEntity(Long id, Long memberId, OrderStatus status, LocalDateTime createdAt) {
        this.id = id;
        this.memberId = memberId;
        this.status = status;
        this.createdAt = createdAt;
    }

    public static OrderEntity from(Order order) {
        OrderEntity entity = new OrderEntity(order.id(), order.memberId(), order.status(), order.createdAt());
        for (OrderItem item : order.items()) {
            entity.items.add(new OrderItemEntity(entity, item.productId(), item.quantity()));
        }
        return entity;
    }

    public Order toDomain() {
        List<OrderItem> domainItems = items.stream()
                .map(OrderItemEntity::toDomain)
                .toList();
        return new Order(id, memberId, domainItems, status, createdAt, updatedAt);
    }

    public Long getId()                     { return id; }
    public Long getMemberId()               { return memberId; }
    public OrderStatus getStatus()          { return status; }
    public LocalDateTime getCreatedAt()     { return createdAt; }
    public LocalDateTime getUpdatedAt()     { return updatedAt; }
    public List<OrderItemEntity> getItems() { return items; }
}
