package dev.danielk.startjava17.member;

import java.util.List;
import java.util.Optional;

public interface MemberRepository {
    Member save(Member member);
    Optional<Member> findById(Long id);
    List<Member> findAll();
    Member update(Member member);
    void deleteById(Long id);
}
