package dev.danielk.startjava17.product;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * ProductInMemoryRepository 학습 테스트
 *
 * - Spring 컨텍스트 없이 순수 JUnit5로 동작 검증
 * - InMemoryRepository의 CRUD 계약이 ProductRepository 인터페이스 규격을 만족하는지 확인
 */
@DisplayName("ProductInMemoryRepository 학습 테스트")
class ProductInMemoryRepositoryTest {

    private ProductInMemoryRepository repository;

    private static final BigDecimal PRICE = new BigDecimal("2000000");

    @BeforeEach
    void setUp() {
        repository = new ProductInMemoryRepository();
    }

    @Test
    @DisplayName("save — 저장 시 ID가 자동 부여되고 저장된 상품이 반환된다")
    void save() {
        Product product = Product.create("MacBook Pro", PRICE, 10, ProductCategory.ELECTRONICS);

        Product saved = repository.save(product);

        assertThat(saved.id()).isNotNull();
        assertThat(saved.name()).isEqualTo("MacBook Pro");
        assertThat(saved.price()).isEqualByComparingTo(PRICE);
        assertThat(saved.stock()).isEqualTo(10);
        assertThat(saved.category()).isEqualTo(ProductCategory.ELECTRONICS);
    }

    @Test
    @DisplayName("save — 여러 번 저장하면 ID가 순차 증가한다")
    void saveMultiple() {
        Product p1 = repository.save(Product.create("A", PRICE, 1, ProductCategory.ELECTRONICS));
        Product p2 = repository.save(Product.create("B", PRICE, 1, ProductCategory.CLOTHING));

        assertThat(p2.id()).isEqualTo(p1.id() + 1);
    }

    @Test
    @DisplayName("findById — 저장한 상품을 ID로 조회할 수 있다")
    void findById() {
        Product saved = repository.save(Product.create("MacBook Pro", PRICE, 10, ProductCategory.ELECTRONICS));

        Optional<Product> found = repository.findById(saved.id());

        assertThat(found).isPresent();
        assertThat(found.get().name()).isEqualTo("MacBook Pro");
    }

    @Test
    @DisplayName("findById — 존재하지 않는 ID는 Optional.empty를 반환한다")
    void findByIdNotFound() {
        Optional<Product> found = repository.findById(999L);

        assertThat(found).isEmpty();
    }

    @Test
    @DisplayName("findAll — 저장된 전체 상품 목록을 반환한다")
    void findAll() {
        repository.save(Product.create("MacBook Pro", PRICE, 10, ProductCategory.ELECTRONICS));
        repository.save(Product.create("청바지", new BigDecimal("50000"), 100, ProductCategory.CLOTHING));

        List<Product> all = repository.findAll();

        assertThat(all).hasSize(2);
    }

    @Test
    @DisplayName("update — 상품 정보를 수정하면 변경된 데이터가 반환된다")
    void update() {
        Product saved = repository.save(Product.create("MacBook Pro", PRICE, 10, ProductCategory.ELECTRONICS));
        Product updated = new Product(saved.id(), "MacBook Pro M3", new BigDecimal("2500000"), 20, ProductCategory.ELECTRONICS);

        Product result = repository.update(updated);

        assertThat(result.name()).isEqualTo("MacBook Pro M3");
        assertThat(result.stock()).isEqualTo(20);
        assertThat(repository.findById(saved.id()).get().name()).isEqualTo("MacBook Pro M3");
    }

    @Test
    @DisplayName("update — decreaseStock 후 update 호출 시 재고가 차감된 상태로 저장된다")
    void updateAfterDecreaseStock() {
        Product saved = repository.save(Product.create("MacBook Pro", PRICE, 10, ProductCategory.ELECTRONICS));
        Product decreased = saved.decreaseStock(3);

        repository.update(decreased);

        assertThat(repository.findById(saved.id()).get().stock()).isEqualTo(7);
    }

    @Test
    @DisplayName("deleteById — 삭제 후 해당 ID로 조회하면 empty를 반환한다")
    void deleteById() {
        Product saved = repository.save(Product.create("MacBook Pro", PRICE, 10, ProductCategory.ELECTRONICS));

        repository.deleteById(saved.id());

        assertThat(repository.findById(saved.id())).isEmpty();
    }
}
