package dev.danielk.orderservice.stream;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RequiredArgsConstructor
@RestController
@RequestMapping("/orders/stream") // 기존 /orders와 충돌 방지
public class OrderController {

    private final OrderStreamProducer producer;

    public record OrderRequest(String product, int quantity) {}

    @PostMapping
    public String placeOrder(@RequestBody OrderRequest request) {
        // 학습용 샘플 코드: OrderEvent 구조 변경에 맞춰 임시 수정
        Long dummyOrderId = System.currentTimeMillis();
        Long dummyMemberId = 1L;
        String dummyAddress = "Seoul, Korea";
        String dummyZipCode = "12345";

        var event = OrderEvent.of(dummyOrderId, dummyMemberId, dummyAddress, dummyZipCode);
        producer.sendEvent(event);

        return "Order Event Published: " + dummyOrderId;
    }
}
