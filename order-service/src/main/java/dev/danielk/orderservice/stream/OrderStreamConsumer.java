package dev.danielk.orderservice.stream;

import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.connection.stream.MapRecord;
import org.springframework.data.redis.stream.StreamListener;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;

@Slf4j
@Service
public class OrderStreamConsumer implements StreamListener<String, MapRecord<String, String, String>> {

    @Override
    public void onMessage(MapRecord<String, String, String> message) {
        log.info("Received order message ID: {}", message.getId());

        Map<String, String> payload = message.getValue();
        log.info("Message payload: {}", payload);

        // Map -> OrderEvent 변환
        try {
            Long orderId = Long.parseLong(payload.get("orderId"));
            Long memberId = Long.parseLong(payload.get("memberId"));
            String address = payload.get("shippingAddress");
            String zipCode = payload.get("shippingZipCode");
            LocalDateTime orderedAt = LocalDateTime.parse(payload.get("orderedAt"));

            var event = new OrderEvent(orderId, memberId, address, zipCode, orderedAt);
            log.info("Successfully deserialized event: {}", event);

            // 비즈니스 로직 처리 (예: 결제 서비스 연동, 통계 데이터 갱신 등)
            processEvent(event);

        } catch (Exception e) {
            log.error("Failed to process order message", e);
        }
    }

    private void processEvent(OrderEvent event) {
        log.info("Processing business logic for order: {}", event.orderId());
    }
}
