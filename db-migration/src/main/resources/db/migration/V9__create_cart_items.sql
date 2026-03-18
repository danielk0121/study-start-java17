-- 장바구니 항목 테이블 생성
CREATE TABLE IF NOT EXISTS cart_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    member_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_cart_item_member FOREIGN KEY (member_id) REFERENCES members(id),
    CONSTRAINT fk_cart_item_product FOREIGN KEY (product_id) REFERENCES products(id),
    UNIQUE KEY uk_member_product (member_id, product_id)
) ENGINE=InnoDB;
