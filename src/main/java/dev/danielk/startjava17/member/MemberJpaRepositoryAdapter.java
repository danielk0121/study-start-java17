package dev.danielk.startjava17.member;

import org.springframework.context.annotation.Primary;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Primary
@Repository
public class MemberJpaRepositoryAdapter implements MemberRepository {

    private final MemberJpaRepository jpaRepository;

    public MemberJpaRepositoryAdapter(MemberJpaRepository jpaRepository) {
        this.jpaRepository = jpaRepository;
    }

    @Override
    public Member save(Member member) {
        return jpaRepository.save(MemberEntity.from(member)).toDomain();
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
        return jpaRepository.save(MemberEntity.from(member)).toDomain();
    }

    @Override
    public void deleteById(Long id) {
        jpaRepository.deleteById(id);
    }
}
