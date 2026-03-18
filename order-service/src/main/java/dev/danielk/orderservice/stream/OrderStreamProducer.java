package dev.danielk.orderservice.stream;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.connection.stream.ObjectRecord;
import org.springframework.data.redis.connection.stream.StreamRecords;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;

@Slf4j
@RequiredArgsConstructor
@Service
public class OrderStreamProducer {

    private final RedisTemplate<String, String> redisTemplate;
    private static final String STREAM_KEY = "order-stream";

    /**
     * Map 기반 발행 (XADD)
     */
    public void sendEvent(OrderEvent event) {
        log.info("Sending order event: {}", event);

        Map<String, String> payload = Map.of(
                "orderId",         String.valueOf(event.orderId()),
                "memberId",        String.valueOf(event.memberId()),
                "shippingAddress", event.shippingAddress(),
                "shippingZipCode", event.shippingZipCode(),
                "orderedAt",       event.orderedAt().toString()
        );

        redisTemplate.opsForStream().add(STREAM_KEY, payload);
    }

    /**
     * Object 기반 발행 (JSON)
     */
    public void sendObjectEvent(OrderEvent event) {
        ObjectRecord<String, OrderEvent> record = StreamRecords.newRecord()
                .in(STREAM_KEY)
                .ofObject(event);

        redisTemplate.opsForStream().add(record);
    }
}
