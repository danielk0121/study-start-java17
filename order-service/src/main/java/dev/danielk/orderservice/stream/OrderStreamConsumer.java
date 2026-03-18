package dev.danielk.orderservice.stream;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.connection.stream.MapRecord;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.stream.StreamListener;
import org.springframework.stereotype.Component;

/**
 * Redis Streams 컨슈머
 * 카프카의 @KafkaListener 에 대응 → StreamListener 인터페이스 구현
 *
 * 컨슈머 그룹 동작 방식:
 *   - 같은 그룹 내 여러 컨슈머는 메시지를 분산 처리 (카프카 파티션 분배와 동일한 개념)
 *   - XACK 호출 전까지 메시지는 PEL(Pending Entry List)에 남아 있음
 *   - 카프카의 commitSync()/commitAsync()에 대응
 */
@Component
public class OrderStreamConsumer implements StreamListener<String, MapRecord<String, String, String>> {

    private final StringRedisTemplate redisTemplate;
    private final String streamKey;
    private final String consumerGroup;

    public OrderStreamConsumer(
            StringRedisTemplate redisTemplate,
            @Value("${redis.stream.key}") String streamKey,
            @Value("${redis.stream.consumer-group}") String consumerGroup
    ) {
        this.redisTemplate = redisTemplate;
        this.streamKey = streamKey;
        this.consumerGroup = consumerGroup;
    }

    @Override
    public void onMessage(MapRecord<String, String, String> record) {
        var payload = record.getValue();

        // Java 17 sealed class / switch expression 활용 포인트
        // 여기서는 단순 Map 파싱 후 record 변환
        var quantity = Integer.parseInt(payload.get("quantity"));
        var createdAt = java.time.LocalDateTime.parse(payload.get("createdAt"));
        var event = new OrderEvent(payload.get("orderId"), payload.get("product"), quantity, createdAt);

        System.out.printf("[Consumer] 수신 | id=%s | %s%n", record.getId(), event);

        // 처리 완료 후 ACK — 카프카의 commitOffset()에 대응
        // ACK 하지 않으면 재시작 시 같은 메시지를 다시 수신 (at-least-once 보장)
        redisTemplate.opsForStream().acknowledge(streamKey, consumerGroup, record.getId());
        System.out.printf("[Consumer] ACK  | id=%s%n", record.getId());
    }
}
