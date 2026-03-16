package dev.danielk.startjava17.member;

import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

/**
 * 인메모리 회원 저장소 — DB 없이 학습 목적으로 ConcurrentHashMap 사용
 */
@Repository
public class MemberRepository {

    private final Map<Long, Member> store = new ConcurrentHashMap<>();
    private final AtomicLong sequence = new AtomicLong(1);

    public Member save(Member member) {
        long id = sequence.getAndIncrement();
        Member saved = new Member(id, member.email(), member.name(), member.role());
        store.put(id, saved);
        return saved;
    }

    public Optional<Member> findById(Long id) {
        return Optional.ofNullable(store.get(id));
    }

    public List<Member> findAll() {
        return new ArrayList<>(store.values());
    }

    public Member update(Member member) {
        store.put(member.id(), member);
        return member;
    }

    public void deleteById(Long id) {
        store.remove(id);
    }
}
