package dev.danielk.memberservice.product;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * 상품 도메인 모델 — Java 17 Record
 */
public record Product(
        Long id,
        String name,
        BigDecimal price,
        int stock,
        ProductCategory category,
        String brandName,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    public Product {
        if (name == null || name.isBlank())          throw new IllegalArgumentException("상품명은 필수입니다.");
        if (price == null || price.signum() < 0)     throw new IllegalArgumentException("가격은 0 이상이어야 합니다.");
        if (stock < 0)                               throw new IllegalArgumentException("재고는 0 이상이어야 합니다.");
    }

    public static Product create(String name, BigDecimal price, int stock, ProductCategory category, String brandName) {
        return new Product(null, name, price, stock, category, brandName, null, null);
    }

    public Product decreaseStock(int quantity) {
        if (stock < quantity) throw new IllegalStateException("재고가 부족합니다.");
        return new Product(id, name, price, stock - quantity, category, brandName, createdAt, updatedAt);
    }
}
