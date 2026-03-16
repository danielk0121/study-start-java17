package dev.danielk.startjava17.order;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/orders")
public class OrderController {

    private final OrderService service;
    private final OrderMapper mapper;

    public OrderController(OrderService service, OrderMapper mapper) {
        this.service = service;
        this.mapper = mapper;
    }

    public record OrderItemRequest(Long productId, int quantity) {}
    public record PlaceRequest(Long memberId, List<OrderItemRequest> items) {}
    public record OrderItemResponse(Long productId, int quantity) {}
    public record OrderResponse(Long id, Long memberId, List<OrderItemResponse> items, String status, String createdAt) {}

    @PostMapping
    public ResponseEntity<OrderResponse> place(@RequestBody PlaceRequest request) {
        List<OrderItem> items = mapper.toOrderItems(request.items());
        return ResponseEntity.ok(mapper.toResponse(service.place(request.memberId(), items)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> findById(@PathVariable Long id) {
        return ResponseEntity.ok(mapper.toResponse(service.findById(id)));
    }

    @GetMapping
    public ResponseEntity<List<OrderResponse>> findAll() {
        return ResponseEntity.ok(mapper.toResponseList(service.findAll()));
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<OrderResponse> cancel(@PathVariable Long id) {
        return ResponseEntity.ok(mapper.toResponse(service.cancel(id)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrder(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
