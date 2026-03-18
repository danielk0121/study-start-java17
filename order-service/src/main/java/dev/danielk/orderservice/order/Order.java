package dev.danielk.orderservice.order;

import java.time.LocalDateTime;
import java.util.List;

public record Order(
        Long id,
        Long memberId,
        List<OrderItem> items,
        OrderStatus status,
        String shippingAddress,
        String shippingZipCode,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public Order {
        if (memberId == null)                        throw new IllegalArgumentException("회원 ID는 필수입니다.");
        if (items == null || items.isEmpty())        throw new IllegalArgumentException("주문 항목은 1개 이상이어야 합니다.");
        if (shippingAddress == null)                 throw new IllegalArgumentException("배송지 주소는 필수입니다.");
        if (shippingZipCode == null)                 throw new IllegalArgumentException("우편번호는 필수입니다.");
    }

    public static Order create(Long memberId, List<OrderItem> items, String shippingAddress, String shippingZipCode) {
        return new Order(null, memberId, items, OrderStatus.PENDING, shippingAddress, shippingZipCode, LocalDateTime.now(), null);
    }

    public Order cancel() {
        if (status == OrderStatus.CANCELLED) throw new IllegalStateException("이미 취소된 주문입니다.");
        return new Order(id, memberId, items, OrderStatus.CANCELLED, shippingAddress, shippingZipCode, createdAt, LocalDateTime.now());
    }
}
