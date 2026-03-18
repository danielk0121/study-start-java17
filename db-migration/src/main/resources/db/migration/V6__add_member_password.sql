-- members 테이블에 password 컬럼 추가
-- BCrypt 해시값 저장 (60자 고정)
ALTER TABLE members
    ADD COLUMN password VARCHAR(255) NOT NULL DEFAULT '' AFTER name;
