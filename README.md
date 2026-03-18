# 프로젝트 개요
- 자바 17 기반 MSA 학습 프로젝트
- **개발의 중심(Source of Truth)**은 `specs/` 폴더 내의 명세 문서들입니다.

---

# 개발 핵심 문서 (Source of Truth)

이 프로젝트는 **스펙 주도 개발(SDD)**과 **도메인 주도 개발(DDD)**을 지향합니다. 

모든 개발 작업은 아래 문서들을 기준으로 진행됩니다.

| 문서 | 경로 | 역할 | 방법론 |
| :--- | :--- | :--- | :--- |
| **PRD** | [`specs/PRD.md`](./specs/PRD.md) | 비즈니스 요구사항 및 개발 방법론 가이드 | **Project Guide** |
| **API Spec** | [`specs/openapi.yaml`](./specs/openapi.yaml) | REST API 인터페이스 정의 (Controller 구현의 기준) | **SDD** |
| **DB Spec** | [`specs/erd.dbml`](./specs/erd.dbml) | 데이터베이스 스키마 및 도메인 모델 정의 | **DDD** |
| **Event Spec** | [`specs/events.toml`](./specs/events.toml) | Redis Streams 비동기 이벤트 명세 정의 | **EDD** |

---

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
- [ ] 멀티 모듈 아키텍처 전환 — member-service / order-service / auth-service / bff 분리 ([설계 문서](./specs/proposal-multimodule-architecture.md) - 예정)
- [ ] 서비스 간 통신 — FeignClient / WebClient 패턴 적용
- [ ] 도메인 이벤트 / Transactional Outbox 패턴 — 주문 생성 후 이벤트 유실 방지 ([설계 문서](./specs/proposal-distributed-transaction-patterns.md) - 예정)
- [x] Spring Security + JWT 인증/인가 적용 — auth-service 전담, 서비스 간 내부 통신 인증 없음 ([설계 문서](./specs/proposal-spring-security-jwt.md) - 예정)
  - [x] 회원가입 시 비밀번호 저장 (BCrypt 해싱)
  - [x] JWT 발급 / 검증 (로그인 → AccessToken + RefreshToken 반환)
  - [x] JWT 기반 회원 정보 조회 (`Authorization: Bearer <token>`) — `GET /members/me`
  - [ ] Spring Security 통합 테스트 (`@SpringBootTest` + MockMvc SecurityContext)
- [ ] MSA API 문서 — 서비스별 Swagger + 통합 뷰 ([제안 문서](./specs/proposal-api-docs-msa.md) - 예정)
- [ ] Circuit Breaker (Resilience4j) — FeignClient 호출 장애 시 연쇄 장애 방지 ([연구조사 문서](./docs/search-circuit-breaker.md))
- [x] 분산 추적 — 멀티 모듈 전환 후 서비스 간 Sleuth traceId 전파 동작 확인 ([연구조사 문서](./docs/search-distributed-tracing.md))
  - [x] bff / auth-service Sleuth + Zipkin 적용
  - [x] Zipkin docker-compose 추가 (`:9411`)
  - [x] 모든 서비스 traceId 로그 패턴 통일
- [ ] OSIV(Open Session In View) 적용 테스트 ([연구조사 문서](docs/search-osiv.md))
- [ ] 부하 테스트 (Locust) — 샘플 랜덤 데이터를 활용한 e2e 시나리오 ([제안 문서](./specs/proposal-locust-load-test.md) - 예정)
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

## 인프라만 실행 (MySQL + Redis + Zipkin)

로컬에서 앱을 직접 실행할 때 인프라만 Docker로 띄웁니다.

```bash
docker compose -f infra/docker-compose/docker-compose.yml up -d mysql redis zipkin
```

이후 앱 실행:

```bash
./gradlew bootRun
```

## 전체 실행 (MySQL + Redis + App + Nginx + Zipkin)

앱까지 컨테이너로 함께 실행합니다.

```bash
docker compose -f infra/docker-compose/docker-compose.yml up -d
```

## 종료

```bash
# 컨테이너 중지 (볼륨 유지)
docker compose -f infra/docker-compose/docker-compose.yml down

# 컨테이너 + 볼륨 모두 삭제 (DB 초기화 후 Flyway 재적용 필요 시)
docker compose -f infra/docker-compose/docker-compose.yml down -v
```

## Flyway 마이그레이션

앱 기동 시 Flyway가 미적용 마이그레이션을 자동으로 순서대로 실행합니다.
상세 내용은 [`specs/flyway.md`](./specs/flyway.md)를 참고하세요.

## 포트 정보

| 서비스 | 포트 | 비고 |
|---|---|---|
| Nginx (Gateway) | 80 | 서비스 통합 진입점 |
| BFF | 8000 | Frontend용 API 조합 |
| Member Service | 8080 | 회원 도메인 |
| Order Service | 8081 | 주문 도메인 |
| Auth Service | 8082 | 인증/인가 도메인 |
| MySQL | 3306 | DB |
| Redis | 6379 | MQ / Cache |
| Zipkin | 9411 | Distributed Tracing |

---

# ERD

DBML 형식으로 관리하며, 모든 도메인 모델의 기준이 됩니다.

- **스펙 파일**: [`specs/erd.dbml`](./specs/erd.dbml)
- **다이어그램 보기**: [dbdiagram.io](https://dbdiagram.io/d)에 파일 내용 붙여넣기

**DBML 검증**

```bash
bash tools/dbml/validate.sh specs/erd.dbml
```

---

# API 문서

OpenAPI 3.0 스펙으로 정의되어 있으며, 모든 Controller 구현의 기준이 됩니다.

- **스펙 파일**: [`specs/openapi.yaml`](./specs/openapi.yaml)
- **Swagger Editor**: [editor.swagger.io](https://editor.swagger.io/?url=https://raw.githubusercontent.com/danielk0121/study-start-java17/master/specs/openapi.yaml)

---

# Redis Streams (EDD)

이벤트 주도 개발을 위한 명세는 TOML 형식으로 관리합니다.

- **스펙 파일**: [`specs/events.toml`](./specs/events.toml)
