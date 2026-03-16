package dev.danielk.startjava17.order;

import dev.danielk.startjava17.config.CacheNames;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OrderService {

    private final OrderRepository repository;

    public OrderService(OrderRepository repository) {
        this.repository = repository;
    }

    @Caching(evict = @CacheEvict(value = CacheNames.ORDER_LIST, allEntries = true))
    public Order place(Long memberId, List<OrderItem> items) {
        return repository.save(Order.create(memberId, items));
    }

    @Cacheable(value = CacheNames.ORDER, key = "#id")
    public Order findById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 주문입니다. id=" + id));
    }

    @Cacheable(value = CacheNames.ORDER_LIST)
    public List<Order> findAll() {
        return repository.findAll();
    }

    @Caching(
            put   = @CachePut(value = CacheNames.ORDER, key = "#id"),
            evict = @CacheEvict(value = CacheNames.ORDER_LIST, allEntries = true)
    )
    public Order cancel(Long id) {
        return repository.update(findById(id).cancel());
    }

    @Caching(evict = {
            @CacheEvict(value = CacheNames.ORDER,      key = "#id"),
            @CacheEvict(value = CacheNames.ORDER_LIST, allEntries = true)
    })
    public void delete(Long id) {
        findById(id);
        repository.deleteById(id);
    }
}
