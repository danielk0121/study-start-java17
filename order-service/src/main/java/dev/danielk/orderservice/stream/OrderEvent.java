package dev.danielk.orderservice.stream;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Java 17 Record — Redis Stream에 실을 주문 이벤트
 */
public record OrderEvent(
        Long orderId,
        Long memberId,
        String shippingAddress,
        String shippingZipCode,
        LocalDateTime orderedAt
) {
    public static OrderEvent of(Long orderId, Long memberId, String shippingAddress, String shippingZipCode) {
        return new OrderEvent(orderId, memberId, shippingAddress, shippingZipCode, LocalDateTime.now());
    }
}
