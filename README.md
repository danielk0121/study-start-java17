# 목적
- 자바 17 시작
- 특징, 주의점, 새로운 기능 테스트

# TODO
- [x] 롬복 제거
  - [x] 데이터 클래스 (@Data, @Value, java17 record 등)
  - [x] ToString
  - [x] 생성자
  - [x] 빌더
- [x] MapStruct
- [ ] QueryDSL — 동적 쿼리 (카테고리 필터, 날짜 범위 검색 등)
- [x] Redis Streams (프로듀서/컨슈머/컨슈머 그룹)
- [ ] 부하 테스트 (Locust) — 샘플 랜덤 데이터를 활용한 e2e 시나리오
- [ ] 네이버 Pinpoint APM 연동 및 샘플 테스트 보고서 문서 작성
- [ ] Spring Security + JWT 인증/인가 적용
- [ ] Locale / Global Timezone 설정 적용
- [ ] OSIV(Open Session In View) 적용 테스트
- [ ] 글로벌 예외 처리 — `@RestControllerAdvice` + 표준 에러 응답 형식
- [ ] Bean Validation — `@Valid` / `@NotBlank` 등 Controller 진입 시점 입력값 검증
- [ ] Flyway — DB 스키마 마이그레이션 이력 관리
- [ ] `@Transactional` 전략 적용 — 쓰기/읽기 분리 (`readOnly = true`)
- [ ] 페이지네이션 — `Pageable` + `Page<T>` 적용
- [ ] 환경별 설정 분리 — `application-local.yml` / `application-prod.yml` 분리 및 시크릿 환경변수화
- [ ] Actuator / 헬스체크 — `/actuator/health` 및 Prometheus 메트릭 엔드포인트
- [ ] 서비스 간 통신 — FeignClient / WebClient 패턴 적용
- [ ] 도메인 이벤트 / Transactional Outbox 패턴 — 주문 생성 후 이벤트 유실 방지
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

# 컨테이너 + 볼륨 모두 삭제
docker compose down -v
```

## 포트 정보

| 서비스 | 포트 |
|---|---|
| App | 8080 |
| MySQL | 3306 |
| Redis | 6379 |

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

## 테스트

| 라이브러리 | 버전 | 용도 |
|---|---|---|
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
- Swagger UI: http://localhost:8080/swagger-ui.html
- OpenAPI JSON: http://localhost:8080/v3/api-docs

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
