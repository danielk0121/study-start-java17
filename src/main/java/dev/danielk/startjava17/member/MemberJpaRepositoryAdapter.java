package dev.danielk.startjava17.member;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Primary;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@RequiredArgsConstructor
@Primary
@Repository
public class MemberJpaRepositoryAdapter implements MemberRepository {

    private final MemberJpaRepository jpaRepository;

    @Override
    public Member save(Member member) {
        var entity = MemberEntity.from(member);
        var saved = jpaRepository.save(entity);
        return saved.toDomain();
    }

    @Override
    public Optional<Member> findById(Long id) {
        return jpaRepository.findById(id).map(MemberEntity::toDomain);
    }

    @Override
    public List<Member> findAll() {
        return jpaRepository.findAll().stream()
                .map(MemberEntity::toDomain)
                .toList();
    }

    @Override
    public Page<Member> findAll(Pageable pageable) {
        return jpaRepository.findAll(pageable).map(MemberEntity::toDomain);
    }

    @Override
    public Member update(Member member) {
        var entity = MemberEntity.from(member);
        var saved = jpaRepository.save(entity);
        return saved.toDomain();
    }

    @Override
    public void deleteById(Long id) {
        jpaRepository.deleteById(id);
    }
}
