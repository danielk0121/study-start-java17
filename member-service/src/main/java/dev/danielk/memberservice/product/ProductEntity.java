package dev.danielk.memberservice.product;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import javax.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * JPA 영속성 전용 엔티티 — 도메인 record(Product)와 분리
 */
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "products")
@EntityListeners(AuditingEntityListener.class)
public class ProductEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "brand_id", nullable = false)
    private BrandEntity brand;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal price;

    @Column(nullable = false)
    private int stock;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProductCategory category;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public ProductEntity(Long id, BrandEntity brand, String name, BigDecimal price, int stock, ProductCategory category) {
        this.id = id;
        this.brand = brand;
        this.name = name;
        this.price = price;
        this.stock = stock;
        this.category = category;
    }

    public static ProductEntity from(Product product, BrandEntity brand) {
        return new ProductEntity(product.id(), brand, product.name(), product.price(), product.stock(), product.category());
    }

    public Product toDomain() {
        return new Product(id, name, price, stock, category, brand != null ? brand.getName() : null, createdAt, updatedAt);
    }
}
