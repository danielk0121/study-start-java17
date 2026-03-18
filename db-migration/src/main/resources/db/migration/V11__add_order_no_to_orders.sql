-- orders 테이블에 주문번호(order_no) 컬럼 추가
-- 형식: yyMMddHHmmssNNN
ALTER TABLE orders ADD COLUMN order_no VARCHAR(20) AFTER id;

-- 기존 데이터에 대해 임시 주문번호 생성 (날짜 기반 + ID 패딩)
UPDATE orders SET order_no = CONCAT(DATE_FORMAT(created_at, '%y%m%d%H%i%s'), LPAD(id, 3, '0')) WHERE order_no IS NULL;

-- 제약 조건 추가 (NOT NULL, UNIQUE)
ALTER TABLE orders MODIFY COLUMN order_no VARCHAR(20) NOT NULL;
ALTER TABLE orders ADD CONSTRAINT uq_orders_order_no UNIQUE (order_no);
