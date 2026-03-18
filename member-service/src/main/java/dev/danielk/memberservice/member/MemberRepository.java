package dev.danielk.memberservice.member;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Optional;

public interface MemberRepository {
    Member save(Member member);
    Optional<Member> findById(Long id);
    Optional<Member> findByEmail(String email);
    List<Member> findAll();
    Page<Member> findAll(Pageable pageable);
    Member update(Member member);
    void deleteById(Long id);
}
