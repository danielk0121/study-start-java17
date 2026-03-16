package dev.danielk.startjava17.order;

import javax.validation.Valid;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
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

    public record OrderItemRequest(@NotNull(message = "상품 ID는 필수입니다.") Long productId,
                                   @Min(value = 1, message = "수량은 1 이상이어야 합니다.") int quantity) {}
    public record PlaceRequest(@NotNull(message = "회원 ID는 필수입니다.") Long memberId,
                               @NotEmpty(message = "주문 항목은 최소 1개 이상이어야 합니다.") List<@Valid OrderItemRequest> items) {}
    public record OrderItemResponse(Long productId, int quantity) {}
    public record OrderResponse(Long id, Long memberId, List<OrderItemResponse> items, String status,
                                    OffsetDateTime createdAt, OffsetDateTime updatedAt) {}

    @PostMapping
    public ResponseEntity<OrderResponse> place(@RequestBody @Valid PlaceRequest request) {
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

    @GetMapping("/page")
    public ResponseEntity<Page<OrderResponse>> findAllPaged(@PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(service.findAll(pageable).map(mapper::toResponse));
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
