package dev.danielk.startjava17.order;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

public class OrderInMemoryRepository implements OrderRepository {

    private final Map<Long, Order> store = new ConcurrentHashMap<>();
    private final AtomicLong sequence = new AtomicLong(1);

    @Override
    public Order save(Order order) {
        long id = sequence.getAndIncrement();
        Order saved = new Order(id, order.memberId(), order.items(), order.status(), order.createdAt());
        store.put(id, saved);
        return saved;
    }

    @Override
    public Optional<Order> findById(Long id) {
        return Optional.ofNullable(store.get(id));
    }

    @Override
    public List<Order> findAll() {
        return new ArrayList<>(store.values());
    }

    @Override
    public Order update(Order order) {
        store.put(order.id(), order);
        return order;
    }

    @Override
    public void deleteById(Long id) {
        store.remove(id);
    }
}
