package dev.danielk.startjava17.member;

/**
 * 회원 도메인 모델 — Java 17 Record
 *
 * Lombok @Value 대체 예시:
 *   @Value 클래스는 불변 + getter + equals/hashCode/toString을 제공하는데
 *   record가 이 모든 것을 언어 레벨에서 제공함.
 *
 * record 제약:
 *   - 모든 필드가 final (불변)
 *   - 상속 불가 (암묵적으로 final class)
 *   - 커스텀 로직은 compact constructor 또는 static 팩토리 메서드로 처리
 */
public record Member(
        Long id,
        String email,
        String name,
        MemberRole role
) {
    // Compact constructor — 유효성 검사
    public Member {
        if (email == null || email.isBlank()) throw new IllegalArgumentException("이메일은 필수입니다.");
        if (name == null || name.isBlank())   throw new IllegalArgumentException("이름은 필수입니다.");
    }

    // 신규 회원 생성 팩토리 (id는 저장소가 부여)
    public static Member create(String email, String name) {
        return new Member(null, email, name, MemberRole.USER);
    }
}
