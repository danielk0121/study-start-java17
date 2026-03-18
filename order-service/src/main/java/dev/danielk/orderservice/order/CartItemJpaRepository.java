package dev.danielk.orderservice.order;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface CartItemJpaRepository extends JpaRepository<CartItemEntity, Long> {
    List<CartItemEntity> findByMemberId(Long memberId);
    Optional<CartItemEntity> findByMemberIdAndProductId(Long memberId, Long productId);
    void deleteByMemberId(Long memberId);
}
