-- auth-service 전용 테이블
-- refresh token 저장 및 관리 담당
-- member_id는 members 테이블과 논리적 관계이나 FK 제약 없음 (서비스 간 경계 원칙)
CREATE TABLE refresh_tokens (
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    member_id   BIGINT       NOT NULL,
    token       VARCHAR(512) NOT NULL UNIQUE,
    expires_at  DATETIME     NOT NULL,
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_refresh_tokens_member_id (member_id),
    INDEX idx_refresh_tokens_token (token)
);
