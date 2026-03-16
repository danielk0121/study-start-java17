package dev.danielk.startjava17.product;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 상품 도메인 모델 — Java 17 Record
 *
 * Lombok @Builder 대체 예시:
 *   record는 생성자가 명확하므로 of() 팩토리 메서드로 빌더 역할을 대체.
 *   필드가 많아지면 별도 Builder 클래스를 만들거나 @Builder를 남겨도 무방.
 */
public record Product(
        Long id,
        String name,
        BigDecimal price,
        int stock,
        ProductCategory category,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    // Compact constructor — 유효성 검사
    public Product {
        if (name == null || name.isBlank())          throw new IllegalArgumentException("상품명은 필수입니다.");
        if (price == null || price.signum() < 0)     throw new IllegalArgumentException("가격은 0 이상이어야 합니다.");
        if (stock < 0)                               throw new IllegalArgumentException("재고는 0 이상이어야 합니다.");
    }

    public static Product create(String name, BigDecimal price, int stock, ProductCategory category) {
        return new Product(null, name, price, stock, category, null, null);
    }

    // 재고 차감 후 새 record 반환 (불변 유지)
    public Product decreaseStock(int quantity) {
        if (stock < quantity) throw new IllegalStateException("재고가 부족합니다.");
        return new Product(id, name, price, stock - quantity, category, createdAt, updatedAt);
    }
}
