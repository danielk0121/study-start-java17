-- brands 테이블에 thumbnail_url 컬럼 추가
ALTER TABLE brands ADD COLUMN thumbnail_url VARCHAR(512) AFTER name;

-- 기존 브랜드에 대해 샘플 이미지 업데이트
UPDATE brands SET thumbnail_url = 'https://via.placeholder.com/150x150?text=Brand+Thumb' WHERE thumbnail_url IS NULL;
