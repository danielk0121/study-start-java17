-- ============================================================
-- V2 : 샘플 데이터 삽입
-- ============================================================

-- members
INSERT INTO members (email, name, role, created_at, updated_at)
VALUES ('admin@example.com', '관리자', 'ADMIN', NOW(6), NOW(6)),
       ('alice@example.com', '앨리스', 'USER', NOW(6), NOW(6)),
       ('bob@example.com', '밥', 'USER', NOW(6), NOW(6)),
       ('carol@example.com', '캐롤', 'USER', NOW(6), NOW(6)),
       ('dave@example.com', '데이브', 'USER', NOW(6), NOW(6));

-- products
INSERT INTO products (name, price, stock, category, created_at, updated_at)
VALUES ('맥북 프로 14인치', 2990000.00, 10, 'ELECTRONICS', NOW(6), NOW(6)),
       ('아이폰 15 Pro', 1550000.00, 25, 'ELECTRONICS', NOW(6), NOW(6)),
       ('무선 키보드', 89000.00, 50, 'ELECTRONICS', NOW(6), NOW(6)),
       ('린넨 셔츠', 49000.00, 100, 'CLOTHING', NOW(6), NOW(6)),
       ('청바지 슬림핏', 79000.00, 80, 'CLOTHING', NOW(6), NOW(6)),
       ('제주 감귤 2kg', 15000.00, 200, 'FOOD', NOW(6), NOW(6)),
       ('유기농 아메리카노 원두 500g', 22000.00, 150, 'FOOD', NOW(6), NOW(6)),
       ('클린 코드', 33000.00, 60, 'BOOKS', NOW(6), NOW(6)),
       ('자바 ORM 표준 JPA 프로그래밍', 38000.00, 45, 'BOOKS', NOW(6), NOW(6)),
       ('텀블러 500ml', 25000.00, 120, 'ETC', NOW(6), NOW(6));

-- orders
INSERT INTO orders (member_id, status, created_at, updated_at)
VALUES (2, 'CONFIRMED', NOW(6), NOW(6)),
       (2, 'PENDING', NOW(6), NOW(6)),
       (3, 'CONFIRMED', NOW(6), NOW(6)),
       (4, 'CANCELLED', NOW(6), NOW(6)),
       (5, 'PENDING', NOW(6), NOW(6));

-- order_items
INSERT INTO order_items (order_id, product_id, quantity)
VALUES (1, 1, 1),  -- 앨리스: 맥북 1대
       (1, 3, 2),  -- 앨리스: 무선 키보드 2개
       (2, 2, 1),  -- 앨리스: 아이폰 1대
       (3, 8, 1),  -- 밥: 클린 코드 1권
       (3, 9, 1),  -- 밥: JPA 프로그래밍 1권
       (4, 4, 2),  -- 캐롤: 린넨 셔츠 2장 (취소됨)
       (5, 6, 3),  -- 데이브: 감귤 3박스
       (5, 7, 2);  -- 데이브: 원두 2봉
