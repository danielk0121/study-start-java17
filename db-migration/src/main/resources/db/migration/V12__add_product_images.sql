-- products 테이블에 썸네일 및 상세 이미지 컬럼 추가
ALTER TABLE products
    ADD COLUMN thumbnail_url_1 VARCHAR(512),
    ADD COLUMN thumbnail_url_2 VARCHAR(512),
    ADD COLUMN thumbnail_url_3 VARCHAR(512),
    ADD COLUMN detail_url_1    VARCHAR(512),
    ADD COLUMN detail_url_2    VARCHAR(512),
    ADD COLUMN detail_url_3    VARCHAR(512);
