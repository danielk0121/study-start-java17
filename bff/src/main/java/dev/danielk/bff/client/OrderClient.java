package dev.danielk.bff.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@FeignClient(name = "order-service", url = "${feign.order-service.url}")
public interface OrderClient {

    @GetMapping("/orders")
    List<OrderResponse> findAll(@RequestParam(required = false) Long memberId);

    record OrderResponse(Long id, Long memberId, String status, List<OrderItemResponse> items) {}
    record OrderItemResponse(Long productId, int quantity) {}
}
