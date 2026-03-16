package dev.danielk.startjava17.order;

import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

@Repository
public class OrderRepository {

    private final Map<Long, Order> store = new ConcurrentHashMap<>();
    private final AtomicLong sequence = new AtomicLong(1);

    public Order save(Order order) {
        long id = sequence.getAndIncrement();
        Order saved = new Order(id, order.memberId(), order.productId(),
                order.quantity(), order.status(), order.createdAt());
        store.put(id, saved);
        return saved;
    }

    public Optional<Order> findById(Long id) {
        return Optional.ofNullable(store.get(id));
    }

    public List<Order> findAll() {
        return new ArrayList<>(store.values());
    }

    public Order update(Order order) {
        store.put(order.id(), order);
        return order;
    }

    public void deleteById(Long id) {
        store.remove(id);
    }
}
