# Flyway 마이그레이션 가이드

## 개요

Flyway는 DB 스키마 변경 이력을 버전 파일로 관리하는 마이그레이션 도구입니다.
앱 시작 시 `flyway_schema_history` 테이블을 기준으로 미적용 파일을 순서대로 자동 실행합니다.

---

## 마이그레이션 파일 위치 및 네이밍 규칙

```
src/main/resources/db/migration/
├── V1__init_schema.sql       # 테이블 생성
├── V2__sample_data.sql       # 초기 샘플 데이터 (소량)
├── V3__sample_data_bulk.sql  # 주문 100건 확장 샘플
└── V4__stats_views.sql       # 통계 뷰 생성
```

| 규칙 | 예시 | 설명 |
|---|---|---|
| 버전 접두사 | `V1__`, `V2__` | `V` + 숫자 + 언더스코어 2개 |
| 파일명 | `V1__init_schema.sql` | 언더스코어 이후는 설명 |
| 순서 | V1 → V2 → V3 … | 숫자 오름차순으로 실행 |
| 수정 금지 | 한번 실행된 파일 | 체크섬 검증 실패 → 앱 기동 불가 |

---

## 로컬 개발 환경 (Docker MySQL)

### 1. MySQL 컨테이너 실행

```bash
docker compose up -d mysql
```

### 2. 앱 실행 → Flyway 자동 적용

```bash
./gradlew bootRun
```

앱 기동 시 Flyway가 자동으로 미적용 마이그레이션을 순서대로 실행합니다.
로그에서 아래와 같이 확인할 수 있습니다.

```
Flyway Community Edition ... by Redgate
Database: jdbc:mysql://localhost:3306/start_java17
Successfully validated 4 migrations
Creating Schema History table `start_java17`.`flyway_schema_history`
Current version of schema `start_java17`: << Empty Schema >>
Migrating schema `start_java17` to version "1 - init schema"
Migrating schema `start_java17` to version "2 - sample data"
...
Successfully applied 4 migrations to schema `start_java17`
```

### 3. 적용 이력 확인

```sql
SELECT version, description, installed_on, success
FROM flyway_schema_history
ORDER BY installed_rank;
```

---

## 새 마이그레이션 파일 추가하는 법

1. `src/main/resources/db/migration/` 에 파일 생성
2. 버전 번호는 현재 최신보다 높게 지정 (예: `V5__add_column_xxx.sql`)
3. 앱을 재시작하면 Flyway가 자동 감지 후 실행

```sql
-- 예시: V5__add_member_phone.sql
ALTER TABLE members ADD COLUMN phone VARCHAR(20) NULL AFTER name;
```

---

## 마이그레이션 실패 시 복구

Flyway는 실패한 마이그레이션을 `success = 0` 으로 기록합니다.
SQL을 수정한 뒤 아래 순서로 복구합니다.

```sql
-- 1. 실패 레코드 삭제
DELETE FROM flyway_schema_history WHERE success = 0;
```

```bash
# 2. 앱 재시작 → 해당 버전 재실행
./gradlew bootRun
```

---

## 실수로 적용된 마이그레이션 되돌리기 (로컬 한정)

Flyway Community Edition은 자동 롤백을 지원하지 않습니다.
로컬 개발 환경에서는 볼륨을 삭제하고 전체 재적용하는 방식을 사용합니다.

```bash
# 컨테이너 + 볼륨 전체 삭제
docker compose down -v

# MySQL 재시작 → 앱 기동 시 V1부터 재적용
docker compose up -d mysql
./gradlew bootRun
```

> 운영 환경에서는 롤백 SQL을 별도 `V{n}__rollback_xxx.sql` 로 작성해 순방향으로 적용합니다.

---

## docker-compose 환경에서 마이그레이션 확인

```bash
# MySQL 컨테이너 접속
docker exec -it start-java17-mysql mysql -uroot -proot start_java17

# 마이그레이션 이력 조회
SELECT version, description, installed_on, execution_time, success
FROM flyway_schema_history
ORDER BY installed_rank;

# 테이블 목록 확인
SHOW TABLES;

# 통계 뷰 실행 예시
SELECT * FROM v_order_stats_monthly ORDER BY order_month;
SELECT * FROM v_order_stats_daily WHERE order_month = '2025-12';
SELECT * FROM v_product_sales_monthly WHERE order_month = '2025-12' ORDER BY total_quantity DESC LIMIT 5;
```

---

## 통계 뷰 목록

| 뷰 이름 | 설명 |
|---|---|
| `v_order_stats_monthly` | 월별 주문 수, 상태별 집계, 취소율 |
| `v_order_stats_daily` | 일별 주문 수 (요일 포함) |
| `v_product_sales_monthly` | 월별 상품 판매량 / 주문 건수 (CONFIRMED 기준) |

### 쿼리 예시

```sql
-- 월별 주문 현황 전체
SELECT * FROM v_order_stats_monthly ORDER BY order_month;

-- 특정 기간 일별 주문 (2025년 12월)
SELECT * FROM v_order_stats_daily
WHERE order_date BETWEEN '2025-12-01' AND '2025-12-31'
ORDER BY order_date;

-- 요일별 주문 패턴 집계 (1=일, 2=월 ... 7=토)
SELECT day_of_week, SUM(total_orders) AS total
FROM v_order_stats_daily
GROUP BY day_of_week
ORDER BY day_of_week;

-- 월별 상품 판매 TOP 3
SELECT order_month, product_name, total_quantity
FROM v_product_sales_monthly
ORDER BY order_month, total_quantity DESC;
```

---

## application.yml Flyway 설정

```yaml
spring:
  flyway:
    enabled: true
    locations: classpath:db/migration  # 마이그레이션 파일 탐색 경로
```

비활성화가 필요한 경우 (테스트 환경 등):

```yaml
spring:
  flyway:
    enabled: false
```
