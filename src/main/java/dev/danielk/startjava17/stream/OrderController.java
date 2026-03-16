package dev.danielk.startjava17.stream;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.redis.connection.stream.RecordId;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 주문 이벤트 발행 REST API
 * POST /orders  →  Redis Stream에 메시지 publish
 */
@Tag(name = "Orders", description = "주문 이벤트 발행 API — Redis Stream에 메시지를 적재합니다")
@RestController
@RequestMapping("/orders")
public class OrderController {

    private final OrderStreamProducer producer;

    public OrderController(OrderStreamProducer producer) {
        this.producer = producer;
    }

    // Java 17 Record를 요청 DTO로 그대로 활용
    public record OrderRequest(
            @Schema(description = "상품명", example = "MacBook Pro") String product,
            @Schema(description = "수량", example = "2") int quantity
    ) {}

    @Operation(
            summary = "주문 이벤트 발행",
            description = "주문 정보를 Redis Stream에 발행합니다. 응답으로 Redis RecordId가 반환됩니다.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "발행 성공",
                            content = @Content(schema = @Schema(example = "published: 1700000000000-0")))
            }
    )
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
