package dev.danielk.startjava17.order;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * OrderInMemoryRepository 학습 테스트
 *
 * - Spring 컨텍스트 없이 순수 JUnit5로 동작 검증
 * - InMemoryRepository의 CRUD 계약이 OrderRepository 인터페이스 규격을 만족하는지 확인
 */
@DisplayName("OrderInMemoryRepository 학습 테스트")
class OrderInMemoryRepositoryTest {

    private OrderInMemoryRepository repository;

    private static final List<OrderItem> ITEMS = List.of(
            new OrderItem(1L, 2),
            new OrderItem(2L, 1)
    );

    @BeforeEach
    void setUp() {
        repository = new OrderInMemoryRepository();
    }

    @Test
    @DisplayName("save — 저장 시 ID가 자동 부여되고 저장된 주문이 반환된다")
    void save() {
        Order order = Order.create(1L, ITEMS);

        Order saved = repository.save(order);

        assertThat(saved.id()).isNotNull();
        assertThat(saved.memberId()).isEqualTo(1L);
        assertThat(saved.status()).isEqualTo(OrderStatus.PENDING);
        assertThat(saved.items()).hasSize(2);
    }

    @Test
    @DisplayName("save — 여러 번 저장하면 ID가 순차 증가한다")
    void saveMultiple() {
        Order o1 = repository.save(Order.create(1L, ITEMS));
        Order o2 = repository.save(Order.create(2L, List.of(new OrderItem(3L, 5))));

        assertThat(o2.id()).isEqualTo(o1.id() + 1);
    }

    @Test
    @DisplayName("findById — 저장한 주문을 ID로 조회할 수 있다")
    void findById() {
        Order saved = repository.save(Order.create(1L, ITEMS));

        Optional<Order> found = repository.findById(saved.id());

        assertThat(found).isPresent();
        assertThat(found.get().memberId()).isEqualTo(1L);
    }

    @Test
    @DisplayName("findById — 존재하지 않는 ID는 Optional.empty를 반환한다")
    void findByIdNotFound() {
        Optional<Order> found = repository.findById(999L);

        assertThat(found).isEmpty();
    }

    @Test
    @DisplayName("findAll — 저장된 전체 주문 목록을 반환한다")
    void findAll() {
        repository.save(Order.create(1L, ITEMS));
        repository.save(Order.create(2L, List.of(new OrderItem(3L, 5))));

        List<Order> all = repository.findAll();

        assertThat(all).hasSize(2);
    }

    @Test
    @DisplayName("update — cancel() 후 update 호출 시 상태가 CANCELLED로 변경된다")
    void updateCancel() {
        Order saved = repository.save(Order.create(1L, ITEMS));
        Order cancelled = saved.cancel();

        Order result = repository.update(cancelled);

        assertThat(result.status()).isEqualTo(OrderStatus.CANCELLED);
        assertThat(repository.findById(saved.id()).get().status()).isEqualTo(OrderStatus.CANCELLED);
    }

    @Test
    @DisplayName("update — 이미 취소된 주문을 다시 cancel() 하면 예외가 발생한다")
    void cancelAlreadyCancelled() {
        Order saved = repository.save(Order.create(1L, ITEMS));
        Order cancelled = saved.cancel();
        repository.update(cancelled);

        assertThatThrownBy(cancelled::cancel)
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("이미 취소된 주문");
    }

    @Test
    @DisplayName("deleteById — 삭제 후 해당 ID로 조회하면 empty를 반환한다")
    void deleteById() {
        Order saved = repository.save(Order.create(1L, ITEMS));

        repository.deleteById(saved.id());

        assertThat(repository.findById(saved.id())).isEmpty();
    }
}
