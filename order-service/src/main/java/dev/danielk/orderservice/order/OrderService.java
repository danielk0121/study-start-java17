package dev.danielk.orderservice.order;

import dev.danielk.orderservice.client.MemberClient;
import dev.danielk.orderservice.config.CacheNames;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@RequiredArgsConstructor
@Service
@Transactional(readOnly = true)
public class OrderService {

    private final OrderRepository repository;
    private final MemberClient memberClient;

    @Transactional
    @Caching(evict = @CacheEvict(value = CacheNames.ORDER_LIST, allEntries = true))
    public Order place(Long memberId, Long addressId, List<OrderItem> items) {
        // 배송지 정보 조회 및 복사
        var addresses = memberClient.getAddresses(memberId);
        var address = addresses.stream()
                .filter(a -> a.id().equals(addressId))
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 배송지입니다. id=" + addressId));

        return repository.save(Order.create(memberId, items, address.address(), address.zipCode()));
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

    public Page<Order> findAll(Pageable pageable) {
        return repository.findAll(pageable);
    }

    @Transactional
    @Caching(
            put   = @CachePut(value = CacheNames.ORDER, key = "#id"),
            evict = @CacheEvict(value = CacheNames.ORDER_LIST, allEntries = true)
    )
    public Order cancel(Long id) {
        var found = findById(id);
        return repository.update(found.cancel());
    }

    @Transactional
    @Caching(evict = {
            @CacheEvict(value = CacheNames.ORDER,      key = "#id"),
            @CacheEvict(value = CacheNames.ORDER_LIST, allEntries = true)
    })
    public void delete(Long id) {
        findById(id);
        repository.deleteById(id);
    }
}
