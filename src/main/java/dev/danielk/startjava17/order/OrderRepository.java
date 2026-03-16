package dev.danielk.startjava17.order;

import java.util.List;
import java.util.Optional;

public interface OrderRepository {
    Order save(Order order);
    Optional<Order> findById(Long id);
    List<Order> findAll();
    Order update(Order order);
    void deleteById(Long id);
}
