-- 브랜드 테이블 생성
CREATE TABLE IF NOT EXISTS brands (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 기본 브랜드 추가 (기존 데이터 호환성을 위해)
INSERT INTO brands (name) VALUES ('Default Brand');

-- 상품 테이블에 브랜드 ID 추가
ALTER TABLE products ADD COLUMN brand_id BIGINT;

-- 기존 상품에 기본 브랜드 할당
UPDATE products SET brand_id = (SELECT id FROM brands WHERE name = 'Default Brand') WHERE brand_id IS NULL;

-- 브랜드 ID 제약 조건 추가
ALTER TABLE products MODIFY COLUMN brand_id BIGINT NOT NULL;
ALTER TABLE products ADD CONSTRAINT fk_product_brand FOREIGN KEY (brand_id) REFERENCES brands(id);
