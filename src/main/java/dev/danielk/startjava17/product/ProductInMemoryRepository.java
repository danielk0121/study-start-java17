package dev.danielk.startjava17.product;

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
        long id = sequence.getAndIncrement();
        LocalDateTime now = LocalDateTime.now();
        Product saved = new Product(id, product.name(), product.price(), product.stock(), product.category(), now, now);
        store.put(id, saved);
        return saved;
    }

    @Override
    public Optional<Product> findById(Long id) {
        return Optional.ofNullable(store.get(id));
    }

    @Override
    public List<Product> findAll() {
        return new ArrayList<>(store.values());
    }

    @Override
    public Product update(Product product) {
        Product updated = new Product(
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
