package dev.danielk.startjava17.order;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OrderService {

    private final OrderRepository repository;

    public OrderService(OrderRepository repository) {
        this.repository = repository;
    }

    public Order place(Long memberId, List<OrderItem> items) {
        return repository.save(Order.create(memberId, items));
    }

    public Order findById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 주문입니다. id=" + id));
    }

    public List<Order> findAll() {
        return repository.findAll();
    }

    public Order cancel(Long id) {
        return repository.update(findById(id).cancel());
    }

    public void delete(Long id) {
        findById(id);
        repository.deleteById(id);
    }
}
