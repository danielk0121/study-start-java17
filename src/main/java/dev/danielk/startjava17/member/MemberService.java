package dev.danielk.startjava17.member;

import dev.danielk.startjava17.config.CacheNames;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.CachePut;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.Caching;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MemberService {

    private final MemberRepository repository;

    public MemberService(MemberRepository repository) {
        this.repository = repository;
    }

    @Caching(evict = @CacheEvict(value = CacheNames.MEMBER_LIST, allEntries = true))
    public Member join(String email, String name) {
        return repository.save(Member.create(email, name));
    }

    @Cacheable(value = CacheNames.MEMBER, key = "#id")
    public Member findById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다. id=" + id));
    }

    @Cacheable(value = CacheNames.MEMBER_LIST)
    public List<Member> findAll() {
        return repository.findAll();
    }

    @Caching(
            put  = @CachePut(value = CacheNames.MEMBER, key = "#id"),
            evict = @CacheEvict(value = CacheNames.MEMBER_LIST, allEntries = true)
    )
    public Member update(Long id, String name) {
        Member member = findById(id);
        return repository.update(new Member(member.id(), member.email(), name, member.role()));
    }

    @Caching(evict = {
            @CacheEvict(value = CacheNames.MEMBER,      key = "#id"),
            @CacheEvict(value = CacheNames.MEMBER_LIST, allEntries = true)
    })
    public void delete(Long id) {
        findById(id);
        repository.deleteById(id);
    }
}
