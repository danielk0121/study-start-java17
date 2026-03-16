# 개선 제안 — Java Spring JPA API 서버 관점

현재 프로젝트(README 기준)를 일반적인 Java Spring JPA MSA API 서버와 비교했을 때
부족하거나 추가가 필요한 항목을 우선순위별로 정리합니다.

---

## 🔴 높은 우선순위 (실제 운영 시 필수)

### 1. 인증 / 인가

**현황:** 모든 API가 인증 없이 열려 있음. Spring Security가 TODO에만 존재.

**필요 이유:**
- 회원 정보 수정/삭제, 주문 생성 등 민감한 API가 누구나 호출 가능한 상태
- MSA 환경에서는 서비스 간 호출에도 토큰 검증이 필요

**제안:**
- Spring Security + JWT (Access Token / Refresh Token)
- `MemberRole`(USER / ADMIN) 기반 엔드포인트 접근 제어
- `/members`, `/products`, `/orders` 별 권한 분리

---

### 2. 글로벌 예외 처리

**현황:** `@RestControllerAdvice` 없음. 예외 발생 시 스택트레이스가 클라이언트에 그대로 노출됨.

**필요 이유:**
- `IllegalArgumentException` → 500 응답으로 내부 구조 노출
- API 소비자 입장에서 에러 원인을 파악할 수 없음

**제안:**
```
@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(IllegalArgumentException.class)
    → 400 Bad Request + { "code": "INVALID_ARGUMENT", "message": "..." }

    @ExceptionHandler(IllegalStateException.class)
    → 409 Conflict

    @ExceptionHandler(Exception.class)
    → 500 Internal Server Error (메시지 노출 없이)
}
```
- 표준 에러 응답 record: `ErrorResponse(String code, String message, OffsetDateTime timestamp)`

---

### 3. 입력값 검증 (Bean Validation)

**현황:** `@Valid` / `@Validated` 미적용. 검증 로직이 도메인 compact constructor에만 존재.

**필요 이유:**
- 잘못된 요청이 Service / 도메인까지 진입한 뒤 500으로 터짐
- Controller 진입 시점에서 400으로 조기 차단해야 함

**제안:**
```java
// 요청 DTO에 Bean Validation 어노테이션 추가
public record JoinRequest(
    @NotBlank @Email String email,
    @NotBlank @Size(max = 100) String name
) {}

// Controller에 @Valid 추가
public ResponseEntity<MemberResponse> join(@RequestBody @Valid JoinRequest request)
```
- `MethodArgumentNotValidException` → GlobalExceptionHandler에서 400 처리

---

### 4. DB 스키마 형상관리 (Flyway)

**현황:** `ddl-auto: none` 설정이지만 Flyway / Liquibase 없음. 스키마 변경 이력 추적 불가.

**필요 이유:**
- 팀 협업 시 스키마 변경을 수동으로 공유해야 함
- 배포 환경마다 스키마 불일치 발생 가능
- docker-compose로 MySQL을 띄워도 테이블이 없어 앱이 즉시 오류 발생

**제안:**
```
src/main/resources/db/migration/
├── V1__create_members.sql
├── V2__create_products.sql
├── V3__create_orders.sql
└── V4__create_order_items.sql
```
```yaml
spring:
  flyway:
    enabled: true
    locations: classpath:db/migration
```

---

## 🟡 중간 우선순위 (MSA 서버로서 필요)

### 5. 트랜잭션 전략

**현황:** Service 메서드에 `@Transactional` 어노테이션 없음.

**필요 이유:**
- JPA 구현체가 `@Primary`로 활성화된 상태에서 트랜잭션 없이 여러 쿼리 실행 시 정합성 보장 안 됨
- `findById()` 후 도메인 로직 → `repository.update()` 사이에 예외 발생 시 롤백 불가

**제안:**
```java
@Transactional(readOnly = true)  // 조회 메서드
public Member findById(Long id) { ... }

@Transactional                   // 쓰기 메서드
public Member join(String email, String name) { ... }
```

---

### 6. 페이지네이션

**현황:** `findAll()`이 전체 목록을 한 번에 반환.

**필요 이유:**
- 상품/주문이 수만 건 이상 쌓이면 OOM 위험
- 클라이언트가 필요한 만큼만 요청할 수 없음

**제안:**
```java
// Repository 인터페이스
Page<Member> findAll(Pageable pageable);

// 요청: GET /members?page=0&size=20&sort=createdAt,desc
// 응답: { "content": [...], "totalElements": 100, "totalPages": 5 }
```

---

### 7. 환경별 설정 분리 및 시크릿 관리

**현황:** `application.yml` 하나에 모든 설정. DB 비밀번호 평문 노출.

**필요 이유:**
- local / dev / prod 환경이 같은 DB를 바라볼 위험
- 비밀번호가 Git에 커밋되면 보안 사고

**제안:**
```
src/main/resources/
├── application.yml          # 공통 설정
├── application-local.yml    # 로컬 전용 (embedded DB 등)
└── application-prod.yml     # 운영 전용 (환경변수 참조)
```
```yaml
# application-prod.yml
spring:
  datasource:
    password: ${DB_PASSWORD}  # 환경변수 또는 AWS Secrets Manager 참조
```

---

### 8. QueryDSL (동적 쿼리)

**현황:** TODO에 있지만 미구현. 현재 단순 전체 조회만 가능.

**필요 이유:**
- 상품 카테고리 필터, 주문 상태 필터, 날짜 범위 검색 등 동적 조건 불가
- Spring Data JPA의 `Specification`은 복잡해지면 가독성 저하

**제안:**
```java
// 상품 검색 예시
QProduct product = QProduct.product;
BooleanBuilder builder = new BooleanBuilder();
if (category != null) builder.and(product.category.eq(category));
if (minPrice != null) builder.and(product.price.goe(minPrice));
return queryFactory.selectFrom(product).where(builder).fetch();
```

---

## 🟢 낮은 우선순위 (완성도 향상)

### 9. Actuator / 헬스체크

**현황:** `spring-boot-starter-actuator` 미적용.

**필요 이유:**
- 쿠버네티스 liveness / readiness probe 불가
- Prometheus + Grafana 메트릭 수집 불가
- `/actuator/health` 없어 로드밸런서 헬스체크 대응 불가

**제안:**
```yaml
management:
  endpoints:
    web:
      exposure:
        include: health, info, metrics, prometheus
  endpoint:
    health:
      show-details: when-authorized
```

---

### 10. 서비스 간 통신 (FeignClient / WebClient)

**현황:** 단일 서비스 내부에서만 동작. 외부 서비스 호출 레이어 없음.

**필요 이유:**
- MSA에서는 주문 서비스가 회원 서비스 / 상품 서비스를 HTTP로 호출하는 패턴이 일반적
- 현재는 모든 도메인이 한 프로세스 안에 있어 MSA 통신 구조 학습 불가

**제안:**
- `spring-cloud-starter-openfeign` 추가
- `MemberClient`, `ProductClient` 인터페이스 작성
- Resilience4j Circuit Breaker 연동

---

### 11. 도메인 이벤트 / Transactional Outbox 패턴

**현황:** 주문 생성 시 Redis Stream 발행이 Service에서 직접 분리되어 있지 않음.

**필요 이유:**
- DB 저장과 이벤트 발행이 단일 트랜잭션으로 묶이지 않으면 유실 가능
- 트랜잭션 커밋 후 이벤트를 발행해야 정합성 보장

**제안:**
```java
// Spring ApplicationEventPublisher 활용
@Transactional
public Order place(...) {
    Order saved = repository.save(...);
    eventPublisher.publishEvent(new OrderPlacedEvent(saved));  // 트랜잭션 커밋 후 발행
    return saved;
}

// @TransactionalEventListener(phase = AFTER_COMMIT)
public void onOrderPlaced(OrderPlacedEvent event) {
    streamProducer.publish(event.order());
}
```

---

### 12. 테스트 커버리지 보강

**현황:** Controller 슬라이스 테스트(`@WebMvcTest`)와 InMemoryRepository 학습 테스트만 존재.

**부족한 테스트:**

| 테스트 유형 | 현황 | 필요 이유 |
|---|---|---|
| Service 단위 테스트 | 없음 | 비즈니스 로직 검증 |
| `@DataJpaTest` | 없음 | JPA 쿼리 / 연관관계 검증 |
| 통합 테스트 (`@SpringBootTest`) | 없음 | 전체 레이어 연동 검증 |
| E2E 시나리오 테스트 | 없음 | 주문 흐름 전체 검증 |

---

## 요약

| 분야 | 항목 | 우선순위 |
|---|---|---|
| 보안 | Spring Security + JWT | 🔴 |
| 에러 처리 | `@RestControllerAdvice` 글로벌 예외 처리 | 🔴 |
| 검증 | Bean Validation (`@Valid`) | 🔴 |
| DB 형상관리 | Flyway 마이그레이션 | 🔴 |
| 데이터 정합성 | `@Transactional` 전략 | 🟡 |
| 성능 | 페이지네이션 (`Pageable`) | 🟡 |
| 설정 | 환경별 yml 분리 / 시크릿 관리 | 🟡 |
| 조회 | QueryDSL 동적 쿼리 | 🟡 |
| 운영 | Actuator / 헬스체크 | 🟢 |
| MSA | 서비스 간 통신 (FeignClient) | 🟢 |
| 아키텍처 | 도메인 이벤트 / Outbox 패턴 | 🟢 |
| 테스트 | Service 단위 / `@DataJpaTest` / 통합 | 🟢 |

**권장 적용 순서:** 글로벌 예외 처리 → Bean Validation → `@Transactional` → Flyway → Security → 페이지네이션 → QueryDSL → Actuator
