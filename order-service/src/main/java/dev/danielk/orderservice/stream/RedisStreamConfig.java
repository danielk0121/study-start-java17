package dev.danielk.orderservice.stream;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.stream.Consumer;
import org.springframework.data.redis.connection.stream.MapRecord;
import org.springframework.data.redis.connection.stream.ReadOffset;
import org.springframework.data.redis.connection.stream.StreamOffset;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.stream.StreamMessageListenerContainer;
import org.springframework.data.redis.stream.Subscription;

import java.time.Duration;

@Configuration
public class RedisStreamConfig {

    @Value("${redis.stream.key}")
    private String streamKey;

    @Value("${redis.stream.consumer-group}")
    private String consumerGroup;

    @Value("${redis.stream.consumer-name}")
    private String consumerName;

    /**
     * StreamMessageListenerContainer: 카프카의 KafkaListenerContainerFactory에 대응
     * 백그라운드 스레드에서 스트림을 폴링하여 메시지를 리스너에 전달
     */
    @Bean
    public StreamMessageListenerContainer<String, MapRecord<String, String, String>> streamListenerContainer(
            RedisConnectionFactory connectionFactory,
            OrderStreamConsumer consumer,
            StringRedisTemplate redisTemplate
    ) {
        // 컨슈머 그룹 초기화 (스트림/그룹이 없으면 생성, 있으면 무시)
        initConsumerGroup(redisTemplate);

        var options = StreamMessageListenerContainer
                .StreamMessageListenerContainerOptions
                .builder()
                .pollTimeout(Duration.ofMillis(100))
                .build();

        var container = StreamMessageListenerContainer.create(connectionFactory, options);

        // 컨슈머 그룹 기반 구독: 카프카의 @KafkaListener(groupId=...) 에 대응
        var subscription = container.receive(
                Consumer.from(consumerGroup, consumerName),
                StreamOffset.create(streamKey, ReadOffset.lastConsumed()),
                consumer
        );

        container.start();
        return container;
    }

    /**
     * 스트림과 컨슈머 그룹이 없으면 생성.
     * 카프카에서 토픽을 미리 생성하는 것과 동일한 역할.
     */
    private void initConsumerGroup(StringRedisTemplate redisTemplate) {
        try {
            redisTemplate.opsForStream().createGroup(streamKey, ReadOffset.from("0"), consumerGroup);
        } catch (Exception e) {
            // 이미 존재하면 무시
        }
    }
}
