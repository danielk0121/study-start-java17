-- 배송지 테이블 생성
CREATE TABLE IF NOT EXISTS shipping_addresses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    member_id BIGINT NOT NULL,
    nickname VARCHAR(255) NOT NULL,
    address VARCHAR(255) NOT NULL,
    zip_code VARCHAR(20) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_shipping_address_member FOREIGN KEY (member_id) REFERENCES members(id)
) ENGINE=InnoDB;

-- 주문 테이블에 배송지 정보 복사 컬럼 추가
ALTER TABLE orders ADD COLUMN shipping_address VARCHAR(255) NOT NULL DEFAULT 'Unknown';
ALTER TABLE orders ADD COLUMN shipping_zip_code VARCHAR(20) NOT NULL DEFAULT '00000';

-- 기존 제약 조건 제거 후 업데이트 (필요 시)
ALTER TABLE orders ALTER COLUMN shipping_address DROP DEFAULT;
ALTER TABLE orders ALTER COLUMN shipping_zip_code DROP DEFAULT;
