# 목적
- 자바 17 시작
- 특징, 주의점, 새로운 기능 테스트

# TODO
- [x] 롬복 제거
  - [x] 데이터 클래스 (@Data, @Value, java17 record 등)
  - [x] ToString, 생성자, 빌더
- [x] MapStruct
- [x] Redis Streams (프로듀서/컨슈머/컨슈머 그룹)
- [x] 글로벌 예외 처리 — `@RestControllerAdvice` + 표준 에러 응답 형식
- [x] Bean Validation — `@Valid` / `@NotBlank` 등 Controller 진입 시점 입력값 검증
- [x] `@Transactional` 전략 적용 — 쓰기/읽기 분리 (`readOnly = true`)
- [x] 페이지네이션 — `Pageable` + `Page<T>` 적용
- [x] 환경별 설정 분리 — `application-local.yml` / `application-prod.yml` 분리 및 시크릿 환경변수화
- [x] Actuator / 헬스체크 — `/actuator/health` 및 Prometheus 메트릭 엔드포인트
- [x] Global Timezone UTC 고정 — JVM `TimeZone.setDefault(UTC)` + DB `serverTimezone=UTC` (Locale 설정은 다국어 지원 시 적용)
- [x] Flyway — DB 스키마 마이그레이션 이력 관리 (`V1__init_schema.sql`, `V2__sample_data.sql`)
- [x] QueryDSL — 주문/상품 월별·일별·요일별 통계 API (`/stats/**`)
- [ ] 멀티 모듈 아키텍처 전환 — member-service / order-service / auth-service / bff 분리 ([설계 문서](./docs/proposal-multimodule-architecture.md))
- [ ] 서비스 간 통신 — FeignClient / WebClient 패턴 적용
- [ ] 도메인 이벤트 / Transactional Outbox 패턴 — 주문 생성 후 이벤트 유실 방지 ([설계 문서](./docs/proposal-distributed-transaction-patterns.md))
- [x] Spring Security + JWT 인증/인가 적용 — auth-service 전담, 서비스 간 내부 통신 인증 없음 ([설계 문서](./docs/proposal-spring-security-jwt.md))
  - [x] 회원가입 시 비밀번호 저장 (BCrypt 해싱)
  - [x] JWT 발급 / 검증 (로그인 → AccessToken + RefreshToken 반환)
  - [x] JWT 기반 회원 정보 조회 (`Authorization: Bearer <token>`) — `GET /members/me`
  - [ ] Spring Security 통합 테스트 (`@SpringBootTest` + MockMvc SecurityContext)
- [ ] MSA API 문서 — 서비스별 Swagger + 통합 뷰 ([제안 문서](./docs/proposal-api-docs-msa.md))
- [ ] Circuit Breaker (Resilience4j) — FeignClient 호출 장애 시 연쇄 장애 방지 ([연구조사 문서](./docs/search-circuit-breaker.md))
- [x] 분산 추적 — 멀티 모듈 전환 후 서비스 간 Sleuth traceId 전파 동작 확인 ([연구조사 문서](./docs/search-distributed-tracing.md))
  - [x] bff / auth-service Sleuth + Zipkin 적용
  - [x] Zipkin docker-compose 추가 (`:9411`)
  - [x] 모든 서비스 traceId 로그 패턴 통일
- [ ] OSIV(Open Session In View) 적용 테스트 [연구조사 문서](docs/search-osiv.md)
- [ ] 부하 테스트 (Locust) — 샘플 랜덤 데이터를 활용한 e2e 시나리오 ([제안 문서](./docs/proposal-locust-load-test.md))
- [ ] 네이버 Pinpoint APM 연동 및 샘플 테스트 보고서 문서 작성
- [ ] Prometheus + Grafana 메트릭 모니터링 — `/actuator/prometheus` 수집 및 대시보드 구성 테스트
- [ ] CQRS + Event Sourcing — Read/Write 모델 분리 및 이벤트 이력 저장 ([연구조사 문서](./docs/search-cqrs-event-sourcing.md))
- [ ] Rate Limiting / Throttling — API Gateway 레벨에서 클라이언트별 요청 수 제한 ([연구조사 문서](./docs/search-rate-limiting.md))
- [x] 월 $50 배포 운영 전략 — Lightsail + k3s + MySQL 컨테이너 기반 소규모 MSA 운영 ([연구조사 문서](./docs/search-deployment-strategy.md))
- [x] k3s 로컬 테스트 환경 구축 — k3d로 Mac에서 k3s 클러스터 실행, Spring Boot 앱 배포 ([가이드 문서](./docs/search-k3s-local-test-guide.md) / [명령어 참조](./docs/search-k3d-kubectl-commands.md))
- [ ] 테스트 커버리지 보강 — Service 단위 테스트, `@DataJpaTest`, 통합 테스트

## 적용된 기술 요약

- Java 17 record (도메인 모델, DTO, 이벤트)
- Spring Boot 2.7.18
- Spring Data JPA + JPA Auditing (createdAt / updatedAt 자동 관리)
- Spring Data Redis + Redis Streams (프로듀서 / 컨슈머 / 컨슈머 그룹)
- Spring Cache 추상화 + Caffeine 로컬 캐시
- MapStruct 객체 매핑 코드 자동 생성
- Repository 인터페이스 + InMemory / JPA 이중 구현체 (@Primary)
- Spring REST Docs + restdocs-api-spec → OpenAPI 3.0 YAML 자동 생성
- Spring Cloud Sleuth (traceId / spanId MDC 자동 주입)
- Logstash Logback Encoder (dev/prod JSON 로그)
- MySQL 8 / HikariCP
- Bean Validation (`@Valid` + `@NotBlank` / `@Email` / `@Min` 등)
- `@RestControllerAdvice` 글로벌 예외 처리 + `ErrorResponse` record 표준 에러 형식
- `@Transactional(readOnly = true)` 기본 + 쓰기 메서드 개별 `@Transactional`
- `Pageable` + `Page<T>` 페이지네이션 (GET `/*/page`)
- 환경별 설정 분리 (`application-local.yml` / `application-prod.yml`)
- Spring Boot Actuator + Micrometer Prometheus (`/actuator/health`, `/actuator/prometheus`)
- Flyway DB 마이그레이션 — V1 테이블 생성 / V2~V3 샘플 데이터 (주문 100건, 날짜 분산) / V4 통계 뷰
- QueryDSL 5.0 — 통계 API (`/stats/**`), `JPAQueryFactory` + `Projections.constructor` + record 조합

---

# 실행 방법

## 인프라만 실행 (MySQL + Redis)

로컬에서 앱을 직접 실행할 때 DB/Redis만 Docker로 띄웁니다.

```bash
docker compose up -d mysql redis
```

이후 앱 실행:

```bash
./gradlew bootRun
```

## 전체 실행 (MySQL + Redis + App)

앱까지 컨테이너로 함께 실행합니다.

```bash
docker compose up -d
```

## 종료

```bash
# 컨테이너 중지 (볼륨 유지)
docker compose down

# 컨테이너 + 볼륨 모두 삭제 (DB 초기화 후 Flyway 재적용 필요 시)
docker compose down -v
```

## Flyway 마이그레이션

앱 기동 시 Flyway가 미적용 마이그레이션을 자동으로 순서대로 실행합니다.

```
db/migration/
├── V1__init_schema.sql       테이블 생성 (members, products, orders, order_items)
├── V2__sample_data.sql       초기 샘플 데이터
├── V3__sample_data_bulk.sql  주문 100건 확장 (2025-09 ~ 2026-02 날짜 분산)
└── V4__stats_views.sql       월별/일별/상품별 통계 뷰
```

적용 이력 확인:

```bash
docker exec -it start-java17-mysql mysql -uroot -proot start_java17 \
  -e "SELECT version, description, installed_on, success FROM flyway_schema_history ORDER BY installed_rank;"
```

볼륨 삭제 후 재기동하면 V1부터 전체 재적용됩니다. 자세한 내용은 [docs/flyway.md](./docs/flyway.md)를 참고하세요.

## 포트 정보

| 서비스 | 포트 |
|---|---|
| App | 8080 |
| MySQL | 3306 |
| Redis | 6379 |

## 프로파일 설정

| 프로파일 | 설정 파일 | 용도 |
|---|---|---|
| `local` (기본) | `application-local.yml` | 로컬 개발 (localhost DB/Redis) |
| `prod` | `application-prod.yml` | 운영 (환경변수로 접속 정보 주입) |

운영 환경 실행 예시:

```bash
SPRING_PROFILES_ACTIVE=prod \
DB_URL=jdbc:mysql://db-host:3306/start_java17 \
DB_USERNAME=app \
DB_PASSWORD=secret \
REDIS_HOST=redis-host \
./gradlew bootRun
```

## Actuator 엔드포인트

| 엔드포인트 | 설명 |
|---|---|
| `GET /actuator/health` | 헬스체크 (UP / DOWN) |
| `GET /actuator/prometheus` | Prometheus 메트릭 수집용 |

---

# 기술 스펙

## 코어

| 항목 | 버전 / 상세 |
|---|---|
| Java | 17 |
| Spring Boot | 2.7.18 |
| Gradle | 8.x |
| 데이터베이스 | MySQL 8 |

## 주요 의존성

| 라이브러리 | 버전 | 용도 |
|---|---|---|
| Spring Data JPA | Boot 관리 | ORM, Repository |
| Spring Data Redis | Boot 관리 | Redis Streams 연동 |
| Spring Web | Boot 관리 | REST API |
| MySQL Connector/J | Boot 관리 | MySQL 드라이버 |
| HikariCP | Boot 관리 | JDBC 커넥션 풀 (maximum-pool-size=5) |
| Spring Cache + Caffeine | Boot 관리 / Boot 관리 | 로컬 캐시 추상화 |
| Spring Cloud Sleuth | 3.1.11 | 분산 추적 (traceId/spanId MDC 자동 주입) |
| Logstash Logback Encoder | 7.4 | JSON 로그 출력 (dev/prod 프로파일) |
| MapStruct | 1.5.5 | 객체 매핑 코드 자동 생성 |
| Lombok | Boot 관리 | 보일러플레이트 코드 생성 |
| Spring Boot Validation | Boot 관리 | Bean Validation (`@Valid`, `@NotBlank` 등) |
| Spring Boot Actuator | Boot 관리 | 헬스체크 및 운영 엔드포인트 |
| Micrometer Prometheus | Boot 관리 | Prometheus 메트릭 수집 (`/actuator/prometheus`) |

## 테스트

| 라이브러리 | 버전 | 용도 |
|---|---|---|
| springdoc-openapi-ui | 1.7.0 | Swagger UI (`/swagger-ui/index.html`) |
| Spring Boot Test | Boot 관리 | 통합 테스트 |
| Spring REST Docs (MockMvc) | 2.0.8 | 테스트 코드 기반 API 문서 스니펫 생성 |
| restdocs-api-spec (MockMvc) | 0.16.4 | REST Docs → OpenAPI 3.0 YAML 자동 생성 |
| embedded-redis | 1.4.3 | Docker 없이 JVM 내 Redis 서버 구동 |

## 문서화 / 빌드 플러그인

| 플러그인 | 버전 | 용도 |
|---|---|---|
| org.asciidoctor.jvm.convert | 3.3.2 | REST Docs 스니펫 → HTML 변환 |
| com.epages.restdocs-api-spec | 0.16.4 | OpenAPI 3.0 YAML 자동 생성 (`build/api-spec/openapi3.yaml`) |

## 로깅 전략

| 프로파일 | 포맷 | 비고 |
|---|---|---|
| local (기본) | Spring Boot 기본 컬러 포맷 | traceId/spanId 포함 |
| dev / prod | JSON (Logstash 포맷) | ELK 스택 연동 목적 |

설정 파일: `src/main/resources/logback-spring.xml`

---

# ERD

DBML 형식으로 관리합니다. 아래 링크에서 다이어그램으로 확인할 수 있습니다.

- **스펙 파일**: [docs/erd.dbml](./docs/erd.dbml)
- **다이어그램 보기**: [dbdiagram.io에서 열기](https://dbdiagram.io/d) — 링크 접속 후 `docs/erd.dbml` 내용을 붙여넣기

**DBML 검증**

`docs/erd.dbml` 수정 후 반드시 아래 명령어로 문법 오류를 확인한다.

```bash
bash tools/dbml/validate.sh                   # docs/ 전체 .dbml 검증
bash tools/dbml/validate.sh docs/erd.dbml     # 특정 파일만 검증
```

> 최초 실행 전 `cd tools/dbml && npm install`로 `@dbml/cli`를 설치해야 한다.

**도메인 구성**

| 테이블 | 설명 |
|---|---|
| `members` | 회원 (이메일, 이름, 권한) |
| `products` | 상품 (상품명, 가격, 재고, 카테고리) |
| `orders` | 주문 헤더 (회원, 상태, 주문일시) |
| `order_items` | 주문 항목 (주문 : 상품 = N : M 중간 테이블) |
| `order_events` | 주문 이벤트 (Redis Stream 메시지의 RDB 표현) |

---

# API 문서

OpenAPI 3.0 스펙으로 정의되어 있습니다. 아래 링크에서 바로 확인할 수 있습니다.

| 방법 | 링크 | 설명 |
|---|---|---|
| **Swagger Editor** | [editor.swagger.io/?url=...](https://editor.swagger.io/?url=https://raw.githubusercontent.com/danielk0121/study-start-java17/master/docs/openapi.yaml) | 편집 가능, 직접 API 호출 |
| **ReDoc** | [redocly.github.io/redoc/?url=...](https://redocly.github.io/redoc/?url=https://raw.githubusercontent.com/danielk0121/study-start-java17/master/docs/openapi.yaml) | 읽기 전용, 깔끔한 UI |
| **스펙 파일** | [docs/openapi.yaml](./docs/openapi.yaml) | 원본 YAML 파일 |

로컬 실행 중일 때:
- Swagger UI: http://localhost:8080/swagger-ui/index.html
- OpenAPI JSON: http://localhost:8080/v3/api-docs

## 페이지네이션 API

전체 목록 조회 외에 페이지네이션 버전이 추가되었습니다.

| 엔드포인트 | 쿼리 파라미터 | 설명 |
|---|---|---|
| `GET /members/page` | `page`, `size`, `sort` | 회원 페이지 조회 |
| `GET /orders/page` | `page`, `size`, `sort` | 주문 페이지 조회 |
| `GET /products/page` | `page`, `size`, `sort` | 상품 페이지 조회 |

예시: `GET /products/page?page=0&size=10&sort=id,desc`

---

# Redis Streams 예제

카프카와 유사한 이벤트 스트리밍을 Redis 하나로 구성하는 예제.

## 카프카 vs Redis Streams 개념 대응

| Apache Kafka | Redis Streams |
|---|---|
| Topic | Stream Key (`order-stream`) |
| `KafkaTemplate.send()` | `opsForStream().add()` |
| `@KafkaListener` | `StreamListener` 구현체 |
| Consumer Group | Consumer Group (XGROUP) |
| `commitOffset()` | `opsForStream().acknowledge()` (XACK) |
| Offset | RecordId (`타임스탬프-시퀀스`) |

## 구성 파일

```
src/main/java/dev/danielk/startjava17/stream/
├── OrderEvent.java           # Java 17 Record — 불변 이벤트 모델
├── OrderStreamProducer.java  # 메시지 발행 (XADD)
├── OrderStreamConsumer.java  # 메시지 소비 + ACK (XACK)
├── RedisStreamConfig.java    # 컨슈머 그룹 초기화, 리스너 컨테이너 설정
└── OrderController.java      # 발행 테스트용 REST API
```

## 실행 방법

```bash
# Redis 실행
docker run -d -p 6379:6379 redis:7

# 앱 실행
./gradlew bootRun

# 주문 이벤트 발행
curl -X POST http://localhost:8080/orders \
  -H "Content-Type: application/json" \
  -d '{"product": "MacBook", "quantity": 2}'
```

## Java 17 적용 포인트

- `OrderEvent` — `record`로 불변 도메인 모델 표현 (`@Data`/`@Value` 대체)
- `OrderController.OrderRequest` — 내부 `record`를 요청 DTO로 활용
