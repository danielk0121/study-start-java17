package dev.danielk.memberservice.member;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import javax.persistence.*;
import java.time.LocalDateTime;

/**
 * JPA 영속성 전용 엔티티 — 도메인 record(Member)와 분리
 *
 * record는 final 필드 + setter 없음 → JPA 프록시 생성 불가.
 * 별도 @Entity 클래스로 분리하고, JPA 구현체 안에서만 사용한다.
 */
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Table(name = "members")
@EntityListeners(AuditingEntityListener.class)
public class MemberEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MemberRole role;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public MemberEntity(Long id, String email, String name, String password, MemberRole role) {
        this.id = id;
        this.email = email;
        this.name = name;
        this.password = password;
        this.role = role;
    }

    public static MemberEntity from(Member member) {
        return new MemberEntity(member.id(), member.email(), member.name(), member.password(), member.role());
    }

    public Member toDomain() {
        return new Member(id, email, name, password, role, createdAt, updatedAt);
    }
}
