-- 주문 상태 변경 이력 테이블 생성
CREATE TABLE order_status_histories (
    id         BIGINT       NOT NULL AUTO_INCREMENT,
    order_id   BIGINT       NOT NULL,
    status     VARCHAR(20)  NOT NULL,
    created_at DATETIME(6)  NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    PRIMARY KEY (id),
    KEY idx_order_status_histories_order_id (order_id),
    CONSTRAINT fk_order_status_histories_order FOREIGN KEY (order_id) REFERENCES orders (id)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

-- 샘플 데이터 추가
INSERT INTO order_status_histories (order_id, status, created_at) VALUES
(1, 'PENDING', '2025-09-02 10:15:00'),
(1, 'CONFIRMED', '2025-09-02 14:30:00'),
(4, 'PENDING', '2025-09-29 14:00:00'),
(4, 'CANCELLED', '2025-09-30 09:00:00'),
(6, 'PENDING', '2025-09-02 10:15:00'),
(6, 'CONFIRMED', '2025-09-02 11:00:00'),
(105, 'PENDING', '2026-02-26 13:00:00');
