package dev.danielk.startjava17.member;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicLong;

public class MemberInMemoryRepository implements MemberRepository {

    private final Map<Long, Member> store = new ConcurrentHashMap<>();
    private final AtomicLong sequence = new AtomicLong(1);

    @Override
    public Member save(Member member) {
        var id = sequence.getAndIncrement();
        var now = LocalDateTime.now();
        var saved = new Member(id, member.email(), member.name(), member.role(), now, now);
        store.put(id, saved);
        return saved;
    }

    @Override
    public Optional<Member> findById(Long id) {
        return Optional.ofNullable(store.get(id));
    }

    @Override
    public List<Member> findAll() {
        var all = new ArrayList<>(store.values());
        return all;
    }

    @Override
    public Page<Member> findAll(Pageable pageable) {
        var all = new ArrayList<>(store.values());
        var start = (int) pageable.getOffset();
        var end = Math.min(start + pageable.getPageSize(), all.size());
        var content = start >= all.size() ? List.<Member>of() : all.subList(start, end);
        return new PageImpl<>(content, pageable, all.size());
    }

    @Override
    public Member update(Member member) {
        var updated = new Member(
                member.id(), member.email(), member.name(), member.role(),
                member.createdAt(), LocalDateTime.now()
        );
        store.put(updated.id(), updated);
        return updated;
    }

    @Override
    public void deleteById(Long id) {
        store.remove(id);
    }
}
