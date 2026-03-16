package dev.danielk.startjava17.order;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/orders")
public class OrderController {

    private final OrderService service;

    public OrderController(OrderService service) {
        this.service = service;
    }

    public record OrderItemRequest(Long productId, int quantity) {}
    public record PlaceRequest(Long memberId, List<OrderItemRequest> items) {}

    public record OrderItemResponse(Long productId, int quantity) {
        static OrderItemResponse from(OrderItem item) {
            return new OrderItemResponse(item.productId(), item.quantity());
        }
    }
    public record OrderResponse(Long id, Long memberId, List<OrderItemResponse> items, String status, String createdAt) {
        static OrderResponse from(Order order) {
            return new OrderResponse(
                    order.id(),
                    order.memberId(),
                    order.items().stream().map(OrderItemResponse::from).toList(),
                    order.status().name(),
                    order.createdAt().toString()
            );
        }
    }

    @PostMapping
    public ResponseEntity<OrderResponse> place(@RequestBody PlaceRequest request) {
        List<OrderItem> items = request.items().stream()
                .map(i -> new OrderItem(i.productId(), i.quantity()))
                .toList();
        return ResponseEntity.ok(OrderResponse.from(service.place(request.memberId(), items)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> findById(@PathVariable Long id) {
        return ResponseEntity.ok(OrderResponse.from(service.findById(id)));
    }

    @GetMapping
    public ResponseEntity<List<OrderResponse>> findAll() {
        return ResponseEntity.ok(service.findAll().stream().map(OrderResponse::from).toList());
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<OrderResponse> cancel(@PathVariable Long id) {
        return ResponseEntity.ok(OrderResponse.from(service.cancel(id)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrder(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
