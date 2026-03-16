package dev.danielk.startjava17.product;

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
        Product saved = new Product(id, product.name(), product.price(), product.stock(), product.category());
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
        store.put(product.id(), product);
        return product;
    }

    @Override
    public void deleteById(Long id) {
        store.remove(id);
    }
}
