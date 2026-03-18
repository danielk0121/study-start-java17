package dev.danielk.orderservice.order;

import lombok.RequiredArgsConstructor;

import javax.validation.Valid;
import javax.validation.constraints.Min;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/orders")
public class OrderController {

    private final OrderService service;
    private final OrderMapper mapper;

    public record OrderItemRequest(@NotNull(message = "상품 ID는 필수입니다.") Long productId,
                                   @Min(value = 1, message = "수량은 1 이상이어야 합니다.") int quantity) {}
    public record PlaceRequest(@NotNull(message = "회원 ID는 필수입니다.") Long memberId,
                               @NotNull(message = "배송지 ID는 필수입니다.") Long addressId,
                               @NotEmpty(message = "주문 항목은 최소 1개 이상이어야 합니다.") List<@Valid OrderItemRequest> items) {}
    public record OrderItemResponse(Long productId, int quantity) {}
    public record OrderResponse(Long id, Long memberId, List<OrderItemResponse> items, String status,
                                    String shippingAddress, String shippingZipCode,
                                    OffsetDateTime createdAt, OffsetDateTime updatedAt) {}

    @PreAuthorize("hasRole('BUYER')")
    @PostMapping
    public ResponseEntity<OrderResponse> place(@RequestBody @Valid PlaceRequest request) {
        var items = mapper.toOrderItems(request.items());
        var order = service.place(request.memberId(), request.addressId(), items);
        var response = mapper.toResponse(order);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> findById(@PathVariable Long id) {
        var order = service.findById(id);
        var response = mapper.toResponse(order);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<OrderResponse>> findAll() {
        var orders = service.findAll();
        var response = mapper.toResponseList(orders);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/page")
    public ResponseEntity<Page<OrderResponse>> findAllPaged(@PageableDefault(size = 20) Pageable pageable) {
        var page = service.findAll(pageable).map(mapper::toResponse);
        return ResponseEntity.ok(page);
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<OrderResponse> cancel(@PathVariable Long id) {
        var order = service.cancel(id);
        var response = mapper.toResponse(order);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrder(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
