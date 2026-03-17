# 제안: Order 도메인 독립 서비스 분리

## 현황

현재 모든 도메인(Member, Product, Order, Stats, Stream)이 단일 Spring Boot 애플리케이션 안에 패키지로 구성되어 있다.

```
dev.danielk.startjava17/
├── member/
├── product/
├── order/          ← 분리 대상
├── stats/          ← Order 기반 통계 (함께 이동 검토 필요)
└── stream/         ← Order 이벤트 Redis Streams
```

Order 도메인의 현재 의존 관계:

```
Order ──→ Member (memberId 외래키 참조)
Order ──→ Product (OrderItem.productId 외래키 참조)
Order ──→ OrderEvent (Redis Stream 발행)
Stats ──→ Order (주문 통계 쿼리)
```

---

## 분리 방식 비교

### 방식 1: Gradle 멀티 모듈

하나의 레포지토리 안에서 모듈을 분리한다.

```
start-java17/                      ← 루트 프로젝트
├── settings.gradle
├── common/                        ← 공통 (ErrorResponse, GlobalExceptionHandler 등)
│   └── build.gradle
├── member-service/                ← Member + Product (조회 API 제공)
│   └── build.gradle
└── order-service/                 ← Order + Stats + Stream
    └── build.gradle
```

**장점**
- 레포지토리 하나로 관리 — 빌드/테스트 통합 용이
- 모듈 간 코드 공유 가능 (common 모듈)
- 현재 코드베이스에서 리팩토링 비용이 낮음

**단점**
- 배포 단위는 여전히 같은 레포지토리 — 진정한 서비스 분리는 아님
- 모듈 간 의존성 경계가 느슨해질 위험

---

### 방식 2: 별도 레포지토리 (권장)

`order-service`를 완전히 별도 레포지토리로 분리한다.

```
study-start-java17/        ← 기존 (Member, Product 담당)
study-order-service/       ← 신규 (Order, Stats, Stream 담당)
```

**장점**
- 배포 파이프라인 완전 독립
- 서비스 간 계약(API)이 명확해짐
- 실제 MSA 운영 패턴 학습에 적합

**단점**
- 초기 구성 비용 (레포지토리, CI, Docker, 설정 파일 등)
- Member/Product 조회를 HTTP API로 대체해야 함

---

## 권장 방향: 별도 레포지토리

학습 목적에서 실제 서비스 분리 경험을 얻으려면 별도 레포지토리가 적합하다.
멀티 모듈은 패키지 분리 수준에 그쳐 MSA의 핵심 과제(서비스 간 통신, 데이터 독립)를 경험하기 어렵다.

---

## 목표 아키텍처

```
[클라이언트]
     │
     ├──→ start-java17 (port 8080)
     │        Member API  /members/**
     │        Product API /products/**
     │
     └──→ order-service (port 8081)
              Order API   /orders/**
              Stats API   /stats/**
              Redis Stream 이벤트 발행/소비
```

서비스 간 통신:
- Order 생성 시 Member/Product 유효성 검증 → `order-service`가 `start-java17`을 HTTP 호출
- 통신 방식: **FeignClient** (동기) 또는 **WebClient** (비동기)

---

## 분리 작업 목록

### 1단계: order-service 레포지토리 생성

- [ ] `study-order-service` 레포지토리 생성
- [ ] Spring Boot 2.7.18 + Java 17 기본 구성
- [ ] Gradle 빌드 설정 (JPA, Redis, QueryDSL, MapStruct, Flyway)
- [ ] Docker Compose 구성 (MySQL, Redis)
- [ ] 포트 8081로 설정

### 2단계: Order 코드 이전

이전 대상:

| 패키지/파일 | 설명 |
|---|---|
| `order/` 전체 | Order 도메인, 엔티티, 서비스, 컨트롤러, 레포지토리 |
| `stream/` 전체 | OrderEvent, Producer, Consumer, RedisStreamConfig |
| `stats/` 전체 | StatsController, StatsService, StatsQueryRepository |
| `config/QueryDslConfig` | QueryDSL 설정 |
| `config/CacheConfig` (일부) | ORDER, ORDER_LIST 캐시 설정 |
| `common/` | ErrorResponse, GlobalExceptionHandler (복사 또는 공통 라이브러리화) |
| Flyway 마이그레이션 | orders, order_items, order_events 테이블 관련 SQL |

### 3단계: 서비스 간 통신 구현

Order 생성 시 Member, Product 존재 여부를 `start-java17`에 HTTP로 조회한다.

**FeignClient 예시:**
```java
@FeignClient(name = "member-service", url = "${services.member.url}")
public interface MemberClient {
    @GetMapping("/members/{id}")
    MemberResponse findById(@PathVariable Long id);
}

@FeignClient(name = "product-service", url = "${services.product.url}")
public interface ProductClient {
    @GetMapping("/products/{id}")
    ProductResponse findById(@PathVariable Long id);
}
```

**설정:**
```yaml
# order-service application.yml
services:
  member:
    url: http://localhost:8080
  product:
    url: http://localhost:8080
```

### 4단계: DB 분리

현재 단일 MySQL 스키마를 서비스별로 분리한다.

| 서비스 | 스키마 | 테이블 |
|---|---|---|
| start-java17 | `start_java17` | members, products |
| order-service | `order_service` | orders, order_items, order_events |

> 통계 뷰(`V4__stats_views.sql`)는 orders/order_items만 참조하므로 order-service로 이전한다.

### 5단계: 기존 서비스(start-java17) 정리

- [ ] `order/` 패키지 삭제
- [ ] `stream/` 패키지 삭제
- [ ] `stats/` 패키지 삭제
- [ ] `CacheNames`에서 ORDER, ORDER_LIST 제거
- [ ] Flyway에서 orders 관련 마이그레이션 제거 (또는 별도 스키마로 분리)

---

## 핵심 고려사항

### 데이터 정합성

Order 생성 시 Member/Product가 존재하는지 검증이 필요하다.
외래키가 DB 수준에서 강제되지 않으므로 애플리케이션 레벨에서 처리해야 한다.

### 장애 격리

`start-java17`이 다운됐을 때 Order 조회/취소는 정상 동작해야 한다.
Member/Product 조회는 Order 생성 시에만 필요하므로, 조회 서비스 장애 시 주문 생성만 실패하도록 설계한다.

### 분산 트랜잭션

현재는 단순 HTTP 호출로 충분하다.
향후 결제, 재고 차감 등이 추가되면 Outbox 패턴 또는 Saga 패턴 도입을 검토한다.
(이미 TODO에 "Transactional Outbox 패턴"이 등록되어 있음)

---

## 단계별 실행 순서 (권장)

```
1. 별도 레포지토리 생성 + 기본 골격 구성
2. Order/Stats/Stream 코드 이전 (DB는 아직 공유)
3. DB 스키마 분리
4. FeignClient로 Member/Product 조회 연동
5. start-java17에서 Order 관련 코드 제거
6. Docker Compose로 두 서비스 함께 실행 검증
```
