package dev.danielk.orderservice.order;

import dev.danielk.orderservice.client.ProductClient;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@RequiredArgsConstructor
@Service
@Transactional(readOnly = true)
public class CartService {

    private final CartItemJpaRepository cartRepository;
    private final ProductClient productClient;

    public CartResponse getMyCart(Long memberId) {
        List<CartItemEntity> entities = cartRepository.findByMemberId(memberId);
        
        List<CartItemDetail> details = entities.stream()
                .map(entity -> {
                    ProductClient.ProductResponse product = productClient.findById(entity.getProductId());
                    BigDecimal itemTotal = product.price().multiply(BigDecimal.valueOf(entity.getQuantity()));
                    return new CartItemDetail(
                            product.id(),
                            product.name(),
                            product.price(),
                            entity.getQuantity(),
                            itemTotal
                    );
                })
                .toList();

        BigDecimal totalPrice = details.stream()
                .map(CartItemDetail::itemTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new CartResponse(memberId, details, totalPrice);
    }

    @Transactional
    public void addItem(Long memberId, Long productId, int quantity) {
        cartRepository.findByMemberIdAndProductId(memberId, productId)
                .ifPresentOrElse(
                        item -> item.addQuantity(quantity),
                        () -> cartRepository.save(new CartItemEntity(memberId, productId, quantity))
                );
    }

    @Transactional
    public void updateQuantity(Long memberId, Long productId, int quantity) {
        cartRepository.findByMemberIdAndProductId(memberId, productId)
                .ifPresent(item -> item.updateQuantity(quantity));
    }

    @Transactional
    public void removeItem(Long memberId, Long productId) {
        cartRepository.findByMemberIdAndProductId(memberId, productId)
                .ifPresent(cartRepository::delete);
    }

    @Transactional
    public void clearCart(Long memberId) {
        cartRepository.deleteByMemberId(memberId);
    }

    // DTO Records
    public record CartResponse(Long memberId, List<CartItemDetail> items, BigDecimal totalPrice) {}
    public record CartItemDetail(Long productId, String productName, BigDecimal price, int quantity, BigDecimal itemTotal) {}
}
