package dev.danielk.startjava17.order;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

public interface OrderRepository {
    Order save(Order order);
    Optional<Order> findById(Long id);
    List<Order> findAll();
    Page<Order> findAll(Pageable pageable);
    Order update(Order order);
    void deleteById(Long id);
}
