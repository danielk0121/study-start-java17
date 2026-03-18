package dev.danielk.memberservice.member;

import java.time.LocalDateTime;

/**
 * 회원 도메인 모델 — Java 17 Record
 */
public record Member(
        Long id,
        String email,
        String name,
        String password,
        MemberRole role,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
    // Compact constructor — 유효성 검사
    public Member {
        if (email == null || email.isBlank()) throw new IllegalArgumentException("이메일은 필수입니다.");
        if (name == null || name.isBlank())   throw new IllegalArgumentException("이름은 필수입니다.");
    }

    // 신규 회원 생성 팩토리 (기본 권한: BUYER)
    public static Member create(String email, String name, String encodedPassword) {
        return new Member(null, email, name, encodedPassword, MemberRole.BUYER, null, null);
    }
}
