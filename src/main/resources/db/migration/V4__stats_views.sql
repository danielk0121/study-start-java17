-- ============================================================
-- V4 : 월별 / 일별 주문 통계 뷰
-- ============================================================

-- 월별 주문 통계
-- 사용 예: SELECT * FROM v_order_stats_monthly ORDER BY order_month;
CREATE VIEW v_order_stats_monthly AS
SELECT
    DATE_FORMAT(created_at, '%Y-%m')  AS order_month,
    COUNT(*)                          AS total_orders,
    SUM(CASE WHEN status = 'CONFIRMED'  THEN 1 ELSE 0 END) AS confirmed,
    SUM(CASE WHEN status = 'PENDING'    THEN 1 ELSE 0 END) AS pending,
    SUM(CASE WHEN status = 'CANCELLED'  THEN 1 ELSE 0 END) AS cancelled,
    ROUND(
        SUM(CASE WHEN status = 'CANCELLED' THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 1
    )                                 AS cancel_rate_pct
FROM orders
GROUP BY DATE_FORMAT(created_at, '%Y-%m');

-- 일별 주문 통계
-- 사용 예: SELECT * FROM v_order_stats_daily WHERE order_date BETWEEN '2025-12-01' AND '2025-12-31';
CREATE VIEW v_order_stats_daily AS
SELECT
    DATE(created_at)                  AS order_date,
    DATE_FORMAT(created_at, '%Y-%m')  AS order_month,
    DAYOFWEEK(created_at)             AS day_of_week, -- 1=일 2=월 ... 7=토
    COUNT(*)                          AS total_orders,
    SUM(CASE WHEN status = 'CONFIRMED'  THEN 1 ELSE 0 END) AS confirmed,
    SUM(CASE WHEN status = 'PENDING'    THEN 1 ELSE 0 END) AS pending,
    SUM(CASE WHEN status = 'CANCELLED'  THEN 1 ELSE 0 END) AS cancelled
FROM orders
GROUP BY DATE(created_at), DATE_FORMAT(created_at, '%Y-%m'), DAYOFWEEK(created_at);

-- 월별 상품 판매 통계 (CONFIRMED 주문 기준)
-- 사용 예: SELECT * FROM v_product_sales_monthly WHERE order_month = '2025-12' ORDER BY total_quantity DESC;
CREATE VIEW v_product_sales_monthly AS
SELECT
    DATE_FORMAT(o.created_at, '%Y-%m') AS order_month,
    p.id                               AS product_id,
    p.name                             AS product_name,
    p.category,
    SUM(oi.quantity)                   AS total_quantity,
    COUNT(DISTINCT o.id)               AS order_count
FROM orders o
         JOIN order_items oi ON o.id = oi.order_id
         JOIN products p     ON oi.product_id = p.id
WHERE o.status = 'CONFIRMED'
GROUP BY DATE_FORMAT(o.created_at, '%Y-%m'), p.id, p.name, p.category;
