package dev.danielk.orderservice.order;

/**
 * 주문 항목 — 한 주문에 담긴 상품 1건
 * Order : OrderItem = 1 : N
 */
public record OrderItem(
        Long productId,
        int quantity
) {
    public OrderItem {
        if (productId == null) throw new IllegalArgumentException("상품 ID는 필수입니다.");
        if (quantity <= 0)     throw new IllegalArgumentException("수량은 1 이상이어야 합니다.");
    }
}
