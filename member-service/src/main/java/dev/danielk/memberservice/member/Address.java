package dev.danielk.memberservice.member;

/**
 * 배송지 도메인 모델 — Java 17 Record
 */
public record Address(
        Long id,
        String nickname,
        String address,
        String zipCode
) {
    public Address {
        if (nickname == null || nickname.isBlank()) throw new IllegalArgumentException("배송지 별명은 필수입니다.");
        if (address == null || address.isBlank())   throw new IllegalArgumentException("상세 주소는 필수입니다.");
        if (zipCode == null || zipCode.isBlank())   throw new IllegalArgumentException("우편번호는 필수입니다.");
    }

    public static Address create(String nickname, String address, String zipCode) {
        return new Address(null, nickname, address, zipCode);
    }
}
