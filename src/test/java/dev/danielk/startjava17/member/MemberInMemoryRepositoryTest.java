package dev.danielk.startjava17.member;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * MemberInMemoryRepository 학습 테스트
 *
 * - Spring 컨텍스트 없이 순수 JUnit5로 동작 검증
 * - InMemoryRepository의 CRUD 계약이 MemberRepository 인터페이스 규격을 만족하는지 확인
 */
@DisplayName("MemberInMemoryRepository 학습 테스트")
class MemberInMemoryRepositoryTest {

    private MemberInMemoryRepository repository;

    @BeforeEach
    void setUp() {
        repository = new MemberInMemoryRepository();
    }

    @Test
    @DisplayName("save — 저장 시 ID가 자동 부여되고 저장된 회원이 반환된다")
    void save() {
        Member member = Member.create("hong@example.com", "홍길동");

        Member saved = repository.save(member);

        assertThat(saved.id()).isNotNull();
        assertThat(saved.email()).isEqualTo("hong@example.com");
        assertThat(saved.name()).isEqualTo("홍길동");
        assertThat(saved.role()).isEqualTo(MemberRole.USER);
    }

    @Test
    @DisplayName("save — 여러 번 저장하면 ID가 순차 증가한다")
    void saveMultiple() {
        Member m1 = repository.save(Member.create("a@example.com", "A"));
        Member m2 = repository.save(Member.create("b@example.com", "B"));

        assertThat(m2.id()).isEqualTo(m1.id() + 1);
    }

    @Test
    @DisplayName("findById — 저장한 회원을 ID로 조회할 수 있다")
    void findById() {
        Member saved = repository.save(Member.create("hong@example.com", "홍길동"));

        Optional<Member> found = repository.findById(saved.id());

        assertThat(found).isPresent();
        assertThat(found.get().email()).isEqualTo("hong@example.com");
    }

    @Test
    @DisplayName("findById — 존재하지 않는 ID는 Optional.empty를 반환한다")
    void findByIdNotFound() {
        Optional<Member> found = repository.findById(999L);

        assertThat(found).isEmpty();
    }

    @Test
    @DisplayName("findAll — 저장된 전체 회원 목록을 반환한다")
    void findAll() {
        repository.save(Member.create("a@example.com", "A"));
        repository.save(Member.create("b@example.com", "B"));

        List<Member> all = repository.findAll();

        assertThat(all).hasSize(2);
    }

    @Test
    @DisplayName("update — 회원 정보를 수정하면 변경된 데이터가 반환된다")
    void update() {
        Member saved = repository.save(Member.create("hong@example.com", "홍길동"));
        Member updated = new Member(saved.id(), saved.email(), "홍길순", saved.role(), saved.createdAt(), saved.updatedAt());

        Member result = repository.update(updated);

        assertThat(result.name()).isEqualTo("홍길순");
        assertThat(repository.findById(saved.id()).get().name()).isEqualTo("홍길순");
    }

    @Test
    @DisplayName("deleteById — 삭제 후 해당 ID로 조회하면 empty를 반환한다")
    void deleteById() {
        Member saved = repository.save(Member.create("hong@example.com", "홍길동"));

        repository.deleteById(saved.id());

        assertThat(repository.findById(saved.id())).isEmpty();
    }
}
