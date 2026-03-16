package dev.danielk.startjava17.stream;

import org.springframework.data.redis.connection.stream.RecordId;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 주문 이벤트 발행 REST API
 * POST /orders  →  Redis Stream에 메시지 publish
 */
@RestController
@RequestMapping("/orders")
public class OrderController {

    private final OrderStreamProducer producer;

    public OrderController(OrderStreamProducer producer) {
        this.producer = producer;
    }

    // Java 17 Record를 요청 DTO로 그대로 활용
    public record OrderRequest(String product, int quantity) {}

    @PostMapping
    public String publish(@RequestBody OrderRequest request) {
        OrderEvent event = OrderEvent.of(
                java.util.UUID.randomUUID().toString(),
                request.product(),
                request.quantity()
        );
        RecordId recordId = producer.publish(event);
        return "published: " + recordId;
    }
}
