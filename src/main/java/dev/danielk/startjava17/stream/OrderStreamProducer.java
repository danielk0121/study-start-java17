package dev.danielk.startjava17.stream;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.connection.stream.MapRecord;
import org.springframework.data.redis.connection.stream.RecordId;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.util.Map;

/**
 * Redis Streams 프로듀서
 * 카프카의 KafkaTemplate.send()에 대응 → opsForStream().add()
 *
 * Redis Stream 메시지 구조:
 *   - key   : 스트림 이름 (카프카 토픽)
 *   - value : Map<String, String> 페이로드 (카프카 메시지 value)
 *   - id    : Redis가 자동 생성하는 타임스탬프 기반 ID (카프카 offset에 대응)
 */
@Component
public class OrderStreamProducer {

    private final StringRedisTemplate redisTemplate;
    private final String streamKey;

    public OrderStreamProducer(
            StringRedisTemplate redisTemplate,
            @Value("${redis.stream.key}") String streamKey
    ) {
        this.redisTemplate = redisTemplate;
        this.streamKey = streamKey;
    }

    public RecordId publish(OrderEvent event) {
        // MapRecord: 카프카 ProducerRecord에 대응
        // Redis Streams는 스키마 없이 Map<String, String>으로 직렬화
        var payload = Map.of(
                "orderId",   event.orderId(),
                "product",   event.product(),
                "quantity",  String.valueOf(event.quantity()),
                "createdAt", event.createdAt().toString()
        );
        var record = MapRecord.create(streamKey, payload);
        var recordId = redisTemplate.opsForStream().add(record);
        System.out.printf("[Producer] 발행 완료 | id=%s | %s%n", recordId, event);
        return recordId;
    }
}
