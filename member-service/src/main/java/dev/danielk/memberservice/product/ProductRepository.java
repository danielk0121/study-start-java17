package dev.danielk.memberservice.product;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

public interface ProductRepository {
    Product save(Long brandId, Product product);
    Optional<Product> findById(Long id);
    List<Product> findAll();
    Page<Product> findAll(Pageable pageable);
    Product update(Long brandId, Product product);
    void deleteById(Long id);
}
