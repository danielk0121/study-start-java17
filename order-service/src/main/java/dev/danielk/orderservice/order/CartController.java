package dev.danielk.orderservice.order;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RestController
@RequestMapping("/carts")
public class CartController {

    private final CartService cartService;

    public record AddItemRequest(Long memberId, Long productId, int quantity) {}
    public record UpdateQuantityRequest(int quantity) {}

    @PreAuthorize("hasRole('BUYER')")
    @GetMapping("/me")
    public ResponseEntity<CartService.CartResponse> getMyCart(@RequestParam Long memberId) {
        return ResponseEntity.ok(cartService.getMyCart(memberId));
    }

    @PreAuthorize("hasRole('BUYER')")
    @PostMapping("/me/items")
    public ResponseEntity<CartService.CartResponse> addItem(@RequestBody AddItemRequest request) {
        cartService.addItem(request.memberId(), request.productId(), request.quantity());
        return ResponseEntity.ok(cartService.getMyCart(request.memberId()));
    }

    @PreAuthorize("hasRole('BUYER')")
    @PatchMapping("/me/items/{productId}")
    public ResponseEntity<Void> updateQuantity(
            @RequestParam Long memberId,
            @PathVariable Long productId,
            @RequestBody UpdateQuantityRequest request) {
        cartService.updateQuantity(memberId, productId, request.quantity());
        return ResponseEntity.ok().build();
    }

    @PreAuthorize("hasRole('BUYER')")
    @DeleteMapping("/me/items/{productId}")
    public ResponseEntity<Void> removeItem(@RequestParam Long memberId, @PathVariable Long productId) {
        cartService.removeItem(memberId, productId);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasRole('BUYER')")
    @DeleteMapping("/me")
    public ResponseEntity<Void> clearCart(@RequestParam Long memberId) {
        cartService.clearCart(memberId);
        return ResponseEntity.noContent().build();
    }
}
