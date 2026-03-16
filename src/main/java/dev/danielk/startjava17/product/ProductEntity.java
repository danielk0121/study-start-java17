package dev.danielk.startjava17.product;

import javax.persistence.*;

import java.math.BigDecimal;

/**
 * JPA 영속성 전용 엔티티 — 도메인 record(Product)와 분리
 */
@Entity
@Table(name = "products")
public class ProductEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal price;

    @Column(nullable = false)
    private int stock;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProductCategory category;

    protected ProductEntity() {}

    public ProductEntity(Long id, String name, BigDecimal price, int stock, ProductCategory category) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.stock = stock;
        this.category = category;
    }

    public static ProductEntity from(Product product) {
        return new ProductEntity(product.id(), product.name(), product.price(), product.stock(), product.category());
    }

    public Product toDomain() {
        return new Product(id, name, price, stock, category);
    }

    public Long getId()              { return id; }
    public String getName()          { return name; }
    public BigDecimal getPrice()     { return price; }
    public int getStock()            { return stock; }
    public ProductCategory getCategory() { return category; }
}
