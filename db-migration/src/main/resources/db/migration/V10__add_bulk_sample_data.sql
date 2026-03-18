-- ============================================================
-- V10 : 대량 샘플 데이터 추가 (각 테이블 50건 이상 보충)
-- ============================================================

-- 1. 브랜드 (현재 1개 -> 50개)
INSERT INTO brands (name, created_at, updated_at) VALUES
('Apple', NOW(6), NOW(6)), ('Samsung', NOW(6), NOW(6)), ('Sony', NOW(6), NOW(6)), ('LG', NOW(6), NOW(6)), ('Dell', NOW(6), NOW(6)),
('Nike', NOW(6), NOW(6)), ('Adidas', NOW(6), NOW(6)), ('Uniqlo', NOW(6), NOW(6)), ('Zara', NOW(6), NOW(6)), ('H&M', NOW(6), NOW(6)),
('Nestle', NOW(6), NOW(6)), ('Coca-Cola', NOW(6), NOW(6)), ('Pepsi', NOW(6), NOW(6)), ('Kellogg', NOW(6), NOW(6)), ('CJ', NOW(6), NOW(6)),
('OReilly', NOW(6), NOW(6)), ('Manning', NOW(6), NOW(6)), ('Packt', NOW(6), NOW(6)), ('Wiley', NOW(6), NOW(6)), ('Pearson', NOW(6), NOW(6)),
('Starbucks', NOW(6), NOW(6)), ('IKEA', NOW(6), NOW(6)), ('Muji', NOW(6), NOW(6)), ('Dyson', NOW(6), NOW(6)), ('Bose', NOW(6), NOW(6)),
('Patagonia', NOW(6), NOW(6)), ('The North Face', NOW(6), NOW(6)), ('Lululemon', NOW(6), NOW(6)), ('Under Armour', NOW(6), NOW(6)), ('Puma', NOW(6), NOW(6)),
('Logitech', NOW(6), NOW(6)), ('Razer', NOW(6), NOW(6)), ('Corsair', NOW(6), NOW(6)), ('Asus', NOW(6), NOW(6)), ('MSI', NOW(6), NOW(6)),
('Tefal', NOW(6), NOW(6)), ('Philips', NOW(6), NOW(6)), ('Braun', NOW(6), NOW(6)), ('Nespresso', NOW(6), NOW(6)), ('Balmuda', NOW(6), NOW(6)),
('Vans', NOW(6), NOW(6)), ('Converse', NOW(6), NOW(6)), ('New Balance', NOW(6), NOW(6)), ('Dr.Martens', NOW(6), NOW(6)), ('Crocs', NOW(6), NOW(6)),
('LEGO', NOW(6), NOW(6)), ('Nintendo', NOW(6), NOW(6)), ('Disney', NOW(6), NOW(6)), ('Marvel', NOW(6), NOW(6));

-- 2. 회원 (현재 11명 -> 50명, 패스워드는 기본값 빈문자열에서 'password' 해시값 예시로 채움)
INSERT INTO members (email, name, password, role, created_at, updated_at) VALUES
('user12@example.com', '사용자12', '$2a$10$8.UnVuG9HHgffUDAlk8q6uy5y.0R.I2pABy7A0tH/A2d5C1A2.S6C', 'USER', NOW(6), NOW(6)),
('user13@example.com', '사용자13', '$2a$10$8.UnVuG9HHgffUDAlk8q6uy5y.0R.I2pABy7A0tH/A2d5C1A2.S6C', 'USER', NOW(6), NOW(6)),
('user14@example.com', '사용자14', '$2a$10$8.UnVuG9HHgffUDAlk8q6uy5y.0R.I2pABy7A0tH/A2d5C1A2.S6C', 'USER', NOW(6), NOW(6)),
('user15@example.com', '사용자15', '$2a$10$8.UnVuG9HHgffUDAlk8q6uy5y.0R.I2pABy7A0tH/A2d5C1A2.S6C', 'USER', NOW(6), NOW(6)),
('user16@example.com', '사용자16', '$2a$10$8.UnVuG9HHgffUDAlk8q6uy5y.0R.I2pABy7A0tH/A2d5C1A2.S6C', 'USER', NOW(6), NOW(6)),
('user17@example.com', '사용자17', '$2a$10$8.UnVuG9HHgffUDAlk8q6uy5y.0R.I2pABy7A0tH/A2d5C1A2.S6C', 'USER', NOW(6), NOW(6)),
('user18@example.com', '사용자18', '$2a$10$8.UnVuG9HHgffUDAlk8q6uy5y.0R.I2pABy7A0tH/A2d5C1A2.S6C', 'USER', NOW(6), NOW(6)),
('user19@example.com', '사용자19', '$2a$10$8.UnVuG9HHgffUDAlk8q6uy5y.0R.I2pABy7A0tH/A2d5C1A2.S6C', 'USER', NOW(6), NOW(6)),
('user20@example.com', '사용자20', '$2a$10$8.UnVuG9HHgffUDAlk8q6uy5y.0R.I2pABy7A0tH/A2d5C1A2.S6C', 'USER', NOW(6), NOW(6)),
('user21@example.com', '사용자21', '$2a$10$8.UnVuG9HHgffUDAlk8q6uy5y.0R.I2pABy7A0tH/A2d5C1A2.S6C', 'USER', NOW(6), NOW(6)),
('user22@example.com', '사용자22', '$2a$10$8.UnVuG9HHgffUDAlk8q6uy5y.0R.I2pABy7A0tH/A2d5C1A2.S6C', 'USER', NOW(6), NOW(6)),
('user23@example.com', '사용자23', '$2a$10$8.UnVuG9HHgffUDAlk8q6uy5y.0R.I2pABy7A0tH/A2d5C1A2.S6C', 'USER', NOW(6), NOW(6)),
('user24@example.com', '사용자24', '$2a$10$8.UnVuG9HHgffUDAlk8q6uy5y.0R.I2pABy7A0tH/A2d5C1A2.S6C', 'USER', NOW(6), NOW(6)),
('user25@example.com', '사용자25', '$2a$10$8.UnVuG9HHgffUDAlk8q6uy5y.0R.I2pABy7A0tH/A2d5C1A2.S6C', 'USER', NOW(6), NOW(6)),
('user26@example.com', '사용자26', '$2a$10$8.UnVuG9HHgffUDAlk8q6uy5y.0R.I2pABy7A0tH/A2d5C1A2.S6C', 'USER', NOW(6), NOW(6)),
('user27@example.com', '사용자27', '$2a$10$8.UnVuG9HHgffUDAlk8q6uy5y.0R.I2pABy7A0tH/A2d5C1A2.S6C', 'USER', NOW(6), NOW(6)),
('user28@example.com', '사용자28', '$2a$10$8.UnVuG9HHgffUDAlk8q6uy5y.0R.I2pABy7A0tH/A2d5C1A2.S6C', 'USER', NOW(6), NOW(6)),
('user29@example.com', '사용자29', '$2a$10$8.UnVuG9HHgffUDAlk8q6uy5y.0R.I2pABy7A0tH/A2d5C1A2.S6C', 'USER', NOW(6), NOW(6)),
('user30@example.com', '사용자30', '$2a$10$8.UnVuG9HHgffUDAlk8q6uy5y.0R.I2pABy7A0tH/A2d5C1A2.S6C', 'USER', NOW(6), NOW(6)),
('user31@example.com', '사용자31', '$2a$10$8.UnVuG9HHgffUDAlk8q6uy5y.0R.I2pABy7A0tH/A2d5C1A2.S6C', 'USER', NOW(6), NOW(6)),
('user32@example.com', '사용자32', '$2a$10$8.UnVuG9HHgffUDAlk8q6uy5y.0R.I2pABy7A0tH/A2d5C1A2.S6C', 'USER', NOW(6), NOW(6)),
('user33@example.com', '사용자33', '$2a$10$8.UnVuG9HHgffUDAlk8q6uy5y.0R.I2pABy7A0tH/A2d5C1A2.S6C', 'USER', NOW(6), NOW(6)),
('user34@example.com', '사용자34', '$2a$10$8.UnVuG9HHgffUDAlk8q6uy5y.0R.I2pABy7A0tH/A2d5C1A2.S6C', 'USER', NOW(6), NOW(6)),
('user35@example.com', '사용자35', '$2a$10$8.UnVuG9HHgffUDAlk8q6uy5y.0R.I2pABy7A0tH/A2d5C1A2.S6C', 'USER', NOW(6), NOW(6)),
('user36@example.com', '사용자36', '$2a$10$8.UnVuG9HHgffUDAlk8q6uy5y.0R.I2pABy7A0tH/A2d5C1A2.S6C', 'USER', NOW(6), NOW(6)),
('user37@example.com', '사용자37', '$2a$10$8.UnVuG9HHgffUDAlk8q6uy5y.0R.I2pABy7A0tH/A2d5C1A2.S6C', 'USER', NOW(6), NOW(6)),
('user38@example.com', '사용자38', '$2a$10$8.UnVuG9HHgffUDAlk8q6uy5y.0R.I2pABy7A0tH/A2d5C1A2.S6C', 'USER', NOW(6), NOW(6)),
('user39@example.com', '사용자39', '$2a$10$8.UnVuG9HHgffUDAlk8q6uy5y.0R.I2pABy7A0tH/A2d5C1A2.S6C', 'USER', NOW(6), NOW(6)),
('user40@example.com', '사용자40', '$2a$10$8.UnVuG9HHgffUDAlk8q6uy5y.0R.I2pABy7A0tH/A2d5C1A2.S6C', 'USER', NOW(6), NOW(6)),
('user41@example.com', '사용자41', '$2a$10$8.UnVuG9HHgffUDAlk8q6uy5y.0R.I2pABy7A0tH/A2d5C1A2.S6C', 'USER', NOW(6), NOW(6)),
('user42@example.com', '사용자42', '$2a$10$8.UnVuG9HHgffUDAlk8q6uy5y.0R.I2pABy7A0tH/A2d5C1A2.S6C', 'USER', NOW(6), NOW(6)),
('user43@example.com', '사용자43', '$2a$10$8.UnVuG9HHgffUDAlk8q6uy5y.0R.I2pABy7A0tH/A2d5C1A2.S6C', 'USER', NOW(6), NOW(6)),
('user44@example.com', '사용자44', '$2a$10$8.UnVuG9HHgffUDAlk8q6uy5y.0R.I2pABy7A0tH/A2d5C1A2.S6C', 'USER', NOW(6), NOW(6)),
('user45@example.com', '사용자45', '$2a$10$8.UnVuG9HHgffUDAlk8q6uy5y.0R.I2pABy7A0tH/A2d5C1A2.S6C', 'USER', NOW(6), NOW(6)),
('user46@example.com', '사용자46', '$2a$10$8.UnVuG9HHgffUDAlk8q6uy5y.0R.I2pABy7A0tH/A2d5C1A2.S6C', 'USER', NOW(6), NOW(6)),
('user47@example.com', '사용자47', '$2a$10$8.UnVuG9HHgffUDAlk8q6uy5y.0R.I2pABy7A0tH/A2d5C1A2.S6C', 'USER', NOW(6), NOW(6)),
('user48@example.com', '사용자48', '$2a$10$8.UnVuG9HHgffUDAlk8q6uy5y.0R.I2pABy7A0tH/A2d5C1A2.S6C', 'USER', NOW(6), NOW(6)),
('user49@example.com', '사용자49', '$2a$10$8.UnVuG9HHgffUDAlk8q6uy5y.0R.I2pABy7A0tH/A2d5C1A2.S6C', 'USER', NOW(6), NOW(6)),
('user50@example.com', '사용자50', '$2a$10$8.UnVuG9HHgffUDAlk8q6uy5y.0R.I2pABy7A0tH/A2d5C1A2.S6C', 'USER', NOW(6), NOW(6));

-- 3. 상품 (현재 10개 -> 50개)
INSERT INTO products (brand_id, name, price, stock, category, created_at, updated_at) VALUES
(2, 'Galaxy S24', 1150000.00, 30, 'ELECTRONICS', NOW(6), NOW(6)),
(3, 'WH-1000XM5', 450000.00, 20, 'ELECTRONICS', NOW(6), NOW(6)),
(4, 'OLED TV 65인치', 2500000.00, 15, 'ELECTRONICS', NOW(6), NOW(6)),
(5, 'XPS 13', 1800000.00, 10, 'ELECTRONICS', NOW(6), NOW(6)),
(6, 'Air Max 97', 199000.00, 50, 'CLOTHING', NOW(6), NOW(6)),
(7, 'Ultra Boost', 219000.00, 40, 'CLOTHING', NOW(6), NOW(6)),
(8, '에어리즘 셔츠', 29900.00, 200, 'CLOTHING', NOW(6), NOW(6)),
(11, 'KitKat 12개입', 12000.00, 300, 'FOOD', NOW(6), NOW(6)),
(12, 'Coke Zero 500ml', 2000.00, 500, 'FOOD', NOW(6), NOW(6)),
(16, 'Designing Data-Intensive Applications', 45000.00, 100, 'BOOKS', NOW(6), NOW(6)),
(17, 'Spring in Action', 42000.00, 80, 'BOOKS', NOW(6), NOW(6)),
(24, 'V15 Detect', 890000.00, 25, 'ELECTRONICS', NOW(6), NOW(6)),
(21, '자바 칩 프라푸치노 믹스', 15000.00, 150, 'FOOD', NOW(6), NOW(6)),
(31, 'MX Master 3S', 129000.00, 60, 'ELECTRONICS', NOW(6), NOW(6)),
(41, 'Old Skool', 75000.00, 120, 'CLOTHING', NOW(6), NOW(6)),
(46, 'LEGO Star Wars Millennium Falcon', 210000.00, 5, 'ETC', NOW(6), NOW(6)),
(47, 'Switch OLED', 415000.00, 30, 'ELECTRONICS', NOW(6), NOW(6)),
(30, 'Suede Classic', 89000.00, 70, 'CLOTHING', NOW(6), NOW(6)),
(25, 'QuietComfort Ultra', 499000.00, 20, 'ELECTRONICS', NOW(6), NOW(6)),
(10, 'Oversized Hoodie', 59900.00, 100, 'CLOTHING', NOW(6), NOW(6)),
(1, 'MacBook Air M3', 1590000.00, 15, 'ELECTRONICS', NOW(6), NOW(6)),
(2, 'Galaxy Watch 6', 320000.00, 45, 'ELECTRONICS', NOW(6), NOW(6)),
(3, 'PlayStation 5', 620000.00, 10, 'ELECTRONICS', NOW(6), NOW(6)),
(6, 'Jordan 1 Retro', 239000.00, 20, 'CLOTHING', NOW(6), NOW(6)),
(7, 'Stan Smith', 109000.00, 80, 'CLOTHING', NOW(6), NOW(6)),
(12, 'Sprite 1.5L', 3000.00, 200, 'FOOD', NOW(6), NOW(6)),
(15, '햇반 210g 12개', 18000.00, 400, 'FOOD', NOW(6), NOW(6)),
(20, 'Java Performance', 48000.00, 30, 'BOOKS', NOW(6), NOW(6)),
(22, 'BILLY 책장', 79900.00, 50, 'ETC', NOW(6), NOW(6)),
(23, '아로마 디퓨저', 45000.00, 90, 'ETC', NOW(6), NOW(6)),
(34, 'ROG Zephyrus G14', 2100000.00, 5, 'ELECTRONICS', NOW(6), NOW(6)),
(37, 'Sonicare 전동칫솔', 159000.00, 100, 'ETC', NOW(6), NOW(6)),
(39, 'Vertuo Pop', 179000.00, 40, 'ELECTRONICS', NOW(6), NOW(6)),
(43, '574 Core', 119000.00, 150, 'CLOTHING', NOW(6), NOW(6)),
(48, 'Mickey Mouse Plush', 35000.00, 60, 'ETC', NOW(6), NOW(6)),
(9, 'Denim Jacket', 89000.00, 50, 'CLOTHING', NOW(6), NOW(6)),
(13, 'Pepsi Zero 355ml x 24', 15000.00, 100, 'FOOD', NOW(6), NOW(6)),
(18, 'Python Crash Course', 38000.00, 70, 'BOOKS', NOW(6), NOW(6)),
(28, 'Align High-Rise Pant', 138000.00, 40, 'CLOTHING', NOW(6), NOW(6)),
(45, 'Classic Clog', 59900.00, 200, 'CLOTHING', NOW(6), NOW(6));

-- 4. 배송지 (60건 추가)
INSERT INTO shipping_addresses (member_id, nickname, address, zip_code, created_at, updated_at)
SELECT id, '우리집', '서울시 강남구 역삼동 123-45', '06123', NOW(6), NOW(6) FROM members WHERE id BETWEEN 1 AND 30
UNION ALL
SELECT id, '회사', '서울시 서초구 서초동 678-90', '06543', NOW(6), NOW(6) FROM members WHERE id BETWEEN 1 AND 30;

-- 5. 장바구니 항목 (60건 추가)
INSERT INTO cart_items (member_id, product_id, quantity, created_at, updated_at)
SELECT m.id, p.id, 1, NOW(6), NOW(6)
FROM members m, products p
WHERE m.id BETWEEN 2 AND 31 AND p.id = (m.id % 40 + 1)
ON DUPLICATE KEY UPDATE quantity = quantity + 1;

INSERT INTO cart_items (member_id, product_id, quantity, created_at, updated_at)
SELECT m.id, p.id, 2, NOW(6), NOW(6)
FROM members m, products p
WHERE m.id BETWEEN 15 AND 44 AND p.id = (m.id % 30 + 10)
ON DUPLICATE KEY UPDATE quantity = quantity + 1;

-- 6. 주문 이벤트 테이블 생성 및 데이터 추가 (erd.dbml 참고)
CREATE TABLE IF NOT EXISTS order_events (
    id         BIGINT       AUTO_INCREMENT PRIMARY KEY COMMENT 'PK',
    order_id   VARCHAR(36)  NOT NULL UNIQUE COMMENT 'UUID — Redis Stream의 orderId',
    member_id  BIGINT       NOT NULL COMMENT '주문 회원',
    product_id BIGINT       NOT NULL COMMENT '주문 상품',
    quantity   INT          NOT NULL COMMENT '주문 수량',
    created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '주문 일시',
    INDEX idx_order_events_member (member_id),
    INDEX idx_order_events_product (product_id)
) ENGINE=InnoDB;

-- 주문 이벤트 샘플 데이터 (60건)
INSERT INTO order_events (order_id, member_id, product_id, quantity, created_at)
SELECT UUID(), member_id, (id % 50 + 1), (id % 5 + 1), created_at
FROM orders
WHERE id <= 60;
