package dev.danielk.orderservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.math.BigDecimal;

@FeignClient(name = "product-service", url = "${feign.member-service.url}")
public interface ProductClient {

    @GetMapping("/products/{id}")
    ProductResponse findById(@PathVariable Long id);

    record ProductResponse(Long id, String name, BigDecimal price, int stock) {}
}
