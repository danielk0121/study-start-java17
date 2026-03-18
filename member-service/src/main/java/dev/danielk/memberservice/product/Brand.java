package dev.danielk.memberservice.product;

/**
 * 브랜드 도메인 모델 — Java 17 Record
 */
public record Brand(
        Long id,
        String name
) {
    public Brand {
        if (name == null || name.isBlank()) throw new IllegalArgumentException("브랜드명은 필수입니다.");
    }
}
