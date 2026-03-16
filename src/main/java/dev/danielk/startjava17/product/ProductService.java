package dev.danielk.startjava17.product;

import dev.danielk.startjava17.config.CacheNames;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductService {

    private final ProductRepository repository;

    public ProductService(ProductRepository repository) {
        this.repository = repository;
    }

    @Caching(evict = @CacheEvict(value = CacheNames.PRODUCT_LIST, allEntries = true))
    public Product register(Product product) {
        return repository.save(product);
    }

    @Cacheable(value = CacheNames.PRODUCT, key = "#id")
    public Product findById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 상품입니다. id=" + id));
    }

    @Cacheable(value = CacheNames.PRODUCT_LIST)
    public List<Product> findAll() {
        return repository.findAll();
    }

    @Caching(
            put   = @CachePut(value = CacheNames.PRODUCT, key = "#id"),
            evict = @CacheEvict(value = CacheNames.PRODUCT_LIST, allEntries = true)
    )
    public Product update(Long id, Product product) {
        findById(id);
        return repository.update(new Product(id, product.name(), product.price(), product.stock(), product.category()));
    }

    @Caching(evict = {
            @CacheEvict(value = CacheNames.PRODUCT,      key = "#id"),
            @CacheEvict(value = CacheNames.PRODUCT_LIST, allEntries = true)
    })
    public void delete(Long id) {
        findById(id);
        repository.deleteById(id);
    }

    @Caching(
            put   = @CachePut(value = CacheNames.PRODUCT, key = "#id"),
            evict = @CacheEvict(value = CacheNames.PRODUCT_LIST, allEntries = true)
    )
    public Product decreaseStock(Long id, int quantity) {
        Product product = findById(id);
        return repository.update(product.decreaseStock(quantity));
    }
}
