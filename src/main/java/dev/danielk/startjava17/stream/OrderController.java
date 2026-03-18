package dev.danielk.startjava17.stream;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 주문 이벤트 발행 REST API
 * POST /orders  →  Redis Stream에 메시지 publish
 */
@RequiredArgsConstructor
@RestController("streamOrderController")
@RequestMapping("/stream/orders")
public class OrderController {

    private final OrderStreamProducer producer;

    // Java 17 Record를 요청 DTO로 그대로 활용
    public record OrderRequest(String product, int quantity) {}

    @PostMapping
    public String publish(@RequestBody OrderRequest request) {
        var uuid = java.util.UUID.randomUUID().toString();
        var event = OrderEvent.of(uuid, request.product(), request.quantity());
        var recordId = producer.publish(event);
        return "published: " + recordId;
    }
}
