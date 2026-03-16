package dev.danielk.startjava17.product;

import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class ProductService {

    private final ProductRepository repository;

    public ProductService(ProductRepository repository) {
        this.repository = repository;
    }

    public Product register(String name, BigDecimal price, int stock, ProductCategory category) {
        return repository.save(Product.create(name, price, stock, category));
    }

    public Product findById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 상품입니다. id=" + id));
    }

    public List<Product> findAll() {
        return repository.findAll();
    }

    public Product decreaseStock(Long id, int quantity) {
        Product product = findById(id);
        return repository.update(product.decreaseStock(quantity));
    }
}
