package dev.danielk.memberservice.product;

import dev.danielk.memberservice.config.CacheNames;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@RequiredArgsConstructor
@Service
@Transactional(readOnly = true)
public class ProductService {

    private final ProductRepository repository;

    @Transactional
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

    public Page<Product> findAll(Pageable pageable) {
        return repository.findAll(pageable);
    }

    @Transactional
    @Caching(
            put   = @CachePut(value = CacheNames.PRODUCT, key = "#id"),
            evict = @CacheEvict(value = CacheNames.PRODUCT_LIST, allEntries = true)
    )
    public Product update(Long id, Product product) {
        findById(id);
        var updated = new Product(id, product.name(), product.price(), product.stock(), product.category(), product.createdAt(), product.updatedAt());
        return repository.update(updated);
    }

    @Transactional
    @Caching(evict = {
            @CacheEvict(value = CacheNames.PRODUCT,      key = "#id"),
            @CacheEvict(value = CacheNames.PRODUCT_LIST, allEntries = true)
    })
    public void delete(Long id) {
        findById(id);
        repository.deleteById(id);
    }

    @Transactional
    @Caching(
            put   = @CachePut(value = CacheNames.PRODUCT, key = "#id"),
            evict = @CacheEvict(value = CacheNames.PRODUCT_LIST, allEntries = true)
    )
    public Product decreaseStock(Long id, int quantity) {
        Product product = findById(id);
        return repository.update(product.decreaseStock(quantity));
    }
}
