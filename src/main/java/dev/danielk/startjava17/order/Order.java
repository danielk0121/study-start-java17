package dev.danielk.startjava17.order;

import java.time.LocalDateTime;

public record Order(
        Long id,
        Long memberId,
        Long productId,
        int quantity,
        OrderStatus status,
        LocalDateTime createdAt
) {
    public Order {
        if (memberId == null)  throw new IllegalArgumentException("회원 ID는 필수입니다.");
        if (productId == null) throw new IllegalArgumentException("상품 ID는 필수입니다.");
        if (quantity <= 0)     throw new IllegalArgumentException("수량은 1 이상이어야 합니다.");
    }

    public static Order create(Long memberId, Long productId, int quantity) {
        return new Order(null, memberId, productId, quantity, OrderStatus.PENDING, LocalDateTime.now());
    }

    public Order cancel() {
        if (status == OrderStatus.CANCELLED) throw new IllegalStateException("이미 취소된 주문입니다.");
        return new Order(id, memberId, productId, quantity, OrderStatus.CANCELLED, createdAt);
    }
}
