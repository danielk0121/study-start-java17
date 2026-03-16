package dev.danielk.startjava17.member;

import javax.persistence.*;

/**
 * JPA 영속성 전용 엔티티 — 도메인 record(Member)와 분리
 *
 * record는 final 필드 + setter 없음 → JPA 프록시 생성 불가.
 * 별도 @Entity 클래스로 분리하고, JPA 구현체 안에서만 사용한다.
 */
@Entity
@Table(name = "members")
public class MemberEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MemberRole role;

    protected MemberEntity() {}

    public MemberEntity(Long id, String email, String name, MemberRole role) {
        this.id = id;
        this.email = email;
        this.name = name;
        this.role = role;
    }

    public static MemberEntity from(Member member) {
        return new MemberEntity(member.id(), member.email(), member.name(), member.role());
    }

    public Member toDomain() {
        return new Member(id, email, name, role);
    }

    public Long getId()       { return id; }
    public String getEmail()  { return email; }
    public String getName()   { return name; }
    public MemberRole getRole() { return role; }
}
