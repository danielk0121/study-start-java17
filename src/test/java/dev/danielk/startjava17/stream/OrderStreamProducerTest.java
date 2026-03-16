package dev.danielk.startjava17.stream;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.redis.connection.stream.RecordId;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Redis Streams 통합 테스트
 * 실제 Redis가 localhost:6379에 실행 중이어야 함
 */
@Tag("docker-redis")
@SpringBootTest
class OrderStreamProducerTest {

    @Autowired
    OrderStreamProducer producer;

    @Test
    @DisplayName("주문 이벤트를 Redis Stream에 발행하면 RecordId를 반환한다")
    void publish_returnsRecordId() {
        OrderEvent event = OrderEvent.of("order-001", "MacBook", 1);

        RecordId recordId = producer.publish(event);

        // RecordId는 "타임스탬프-시퀀스" 형태 (e.g. 1700000000000-0)
        assertThat(recordId).isNotNull();
        assertThat(recordId.getValue()).contains("-");
    }
}
