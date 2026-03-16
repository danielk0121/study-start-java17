package dev.danielk.startjava17.member;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MemberService {

    private final MemberRepository repository;

    public MemberService(MemberRepository repository) {
        this.repository = repository;
    }

    public Member join(String email, String name) {
        return repository.save(Member.create(email, name));
    }

    public Member findById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다. id=" + id));
    }

    public List<Member> findAll() {
        return repository.findAll();
    }

    public Member update(Long id, String name) {
        Member member = findById(id);
        Member updated = new Member(member.id(), member.email(), name, member.role());
        return repository.update(updated);
    }

    public void delete(Long id) {
        findById(id); // 존재 여부 확인
        repository.deleteById(id);
    }
}
