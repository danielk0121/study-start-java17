package dev.danielk.startjava17.order;

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

public class OrderInMemoryRepository implements OrderRepository {

    private final Map<Long, Order> store = new ConcurrentHashMap<>();
    private final AtomicLong sequence = new AtomicLong(1);

    @Override
    public Order save(Order order) {
        var id = sequence.getAndIncrement();
        var now = LocalDateTime.now();
        var saved = new Order(id, order.memberId(), order.items(), order.status(), now, now);
        store.put(id, saved);
        return saved;
    }

    @Override
    public Optional<Order> findById(Long id) {
        return Optional.ofNullable(store.get(id));
    }

    @Override
    public List<Order> findAll() {
        var all = new ArrayList<>(store.values());
        return all;
    }

    @Override
    public Page<Order> findAll(Pageable pageable) {
        var all = new ArrayList<>(store.values());
        var start = (int) pageable.getOffset();
        var end = Math.min(start + pageable.getPageSize(), all.size());
        var content = start >= all.size() ? List.<Order>of() : all.subList(start, end);
        return new PageImpl<>(content, pageable, all.size());
    }

    @Override
    public Order update(Order order) {
        var updated = new Order(
                order.id(), order.memberId(), order.items(), order.status(),
                order.createdAt(), LocalDateTime.now()
        );
        store.put(updated.id(), updated);
        return updated;
    }

    @Override
    public void deleteById(Long id) {
        store.remove(id);
    }
}
