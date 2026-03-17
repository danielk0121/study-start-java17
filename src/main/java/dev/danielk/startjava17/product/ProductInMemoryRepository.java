package dev.danielk.startjava17.product;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

public class ProductInMemoryRepository implements ProductRepository {

    private final Map<Long, Product> store = new ConcurrentHashMap<>();
    private final AtomicLong sequence = new AtomicLong(1);

    @Override
    public Product save(Product product) {
        var id = sequence.getAndIncrement();
        var now = LocalDateTime.now();
        var saved = new Product(id, product.name(), product.price(), product.stock(), product.category(), now, now);
        store.put(id, saved);
        return saved;
    }

    @Override
    public Optional<Product> findById(Long id) {
        return Optional.ofNullable(store.get(id));
    }

    @Override
    public List<Product> findAll() {
        var all = new ArrayList<>(store.values());
        return all;
    }

    @Override
    public Page<Product> findAll(Pageable pageable) {
        var all = new ArrayList<>(store.values());
        var start = (int) pageable.getOffset();
        var end = Math.min(start + pageable.getPageSize(), all.size());
        var content = start >= all.size() ? List.<Product>of() : all.subList(start, end);
        return new PageImpl<>(content, pageable, all.size());
    }

    @Override
    public Product update(Product product) {
        var updated = new Product(
                product.id(), product.name(), product.price(), product.stock(), product.category(),
                product.createdAt(), LocalDateTime.now()
        );
        store.put(updated.id(), updated);
        return updated;
    }

    @Override
    public void deleteById(Long id) {
        store.remove(id);
    }
}
