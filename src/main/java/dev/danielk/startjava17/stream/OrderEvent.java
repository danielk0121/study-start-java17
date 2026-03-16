package dev.danielk.startjava17.stream;

import java.time.LocalDateTime;

/**
 * Java 17 Record — Lombok @Value/@Data 없이 불변 도메인 모델 표현
 * Redis Stream에 실을 주문 이벤트
 */
public record OrderEvent(
        String orderId,
        String product,
        int quantity,
        LocalDateTime createdAt
) {
    // 팩토리 메서드: createdAt 기본값 주입
    public static OrderEvent of(String orderId, String product, int quantity) {
        return new OrderEvent(orderId, product, quantity, LocalDateTime.now());
    }
}
