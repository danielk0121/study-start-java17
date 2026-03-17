# 연구조사: CQRS + Event Sourcing

> CQRS(Command Query Responsibility Segregation)와 Event Sourcing을 조사한다.
> 이 프로젝트는 이미 CQRS의 단순한 형태를 적용하고 있으며, Event Sourcing은 현재 구조와의 관계를 파악하는 것이 목표다.

---

## 1. CQRS

Command(쓰기)와 Query(읽기)의 책임을 분리하는 패턴.

### 기존 방식

```
Service → Repository → DB
(읽기/쓰기 동일한 모델, 동일한 경로)
```

### CQRS

```
Command (쓰기) → CommandService → Write DB
Query  (읽기) → QueryService  → Read DB (또는 별도 뷰/캐시)
```

### 왜 분리하는가

읽기와 쓰기는 요구사항이 다르다.

| 항목 | 쓰기 (Command) | 읽기 (Query) |
|---|---|---|
| 트랜잭션 | 필요 | 불필요 (`readOnly = true`) |
| 모델 | 도메인 엔티티 | 응답에 최적화된 DTO/뷰 |
| 성능 요구 | 정확성 우선 | 속도 우선 |
| 확장 방향 | 수직 확장 | 수평 확장 (Read Replica) |

---

## 2. 이 프로젝트의 CQRS 적용 현황

이미 부분적으로 적용하고 있다.

```java
// Query 분리: @Transactional(readOnly = true) 기본 적용
// Command 분리: 쓰기 메서드에만 @Transactional

// Read 전용 모델: QueryDSL 통계 API (/stats/**)
// Projections.constructor + record 조합으로 조회 전용 DTO 반환
```

이게 CQRS의 가장 단순한 형태다. 동일한 DB를 쓰되 읽기/쓰기 모델만 분리한 것.

### 완전한 CQRS로 가면

```
OrderCommandService  → orders 테이블 (쓰기)
OrderQueryService    → orders_view 또는 Read Replica (읽기)
```

Read DB를 별도로 두거나 Elasticsearch 같은 검색에 최적화된 저장소를 Query 전용으로 사용한다.

---

## 3. Event Sourcing

DB에 현재 상태 대신 이벤트 이력 자체를 저장하는 패턴.

### 기존 방식

```
orders 테이블:
{ id: 1, status: "CANCELLED", updatedAt: "10:10" }
← 현재 상태만 저장. 어떤 경로로 CANCELLED가 됐는지 알 수 없음
```

### Event Sourcing

```
order_events 테이블:
{ event: "ORDER_CREATED",   memberId: 1, at: "10:00" }
{ event: "PAYMENT_DONE",    amount: 5000, at: "10:05" }
{ event: "ORDER_CANCELLED", reason: "품절", at: "10:10" }

현재 상태 = 이벤트를 처음부터 재생(replay)해서 계산
```

### 장점

- 모든 변경 이력이 보존됨 — 감사(audit) 로그가 자동으로 생김
- 특정 시점의 상태 복원 가능 (time travel)
- 이벤트를 다른 서비스가 구독해서 파생 데이터 생성 가능

### 단점

- 현재 상태 조회 시 이벤트 전체를 재생해야 해서 느림
- 이벤트 스키마 변경이 어려움 (과거 이벤트와 호환 유지 필요)
- 구현 복잡도가 매우 높음

---

## 4. Event Sourcing이 CQRS와 함께 쓰이는 이유

Event Sourcing만 쓰면 읽기가 느리다. 이벤트를 모두 재생해야 현재 상태를 알 수 있기 때문이다.

CQRS의 Read Model을 함께 쓰면 이 문제를 해결한다.
**이벤트로 쓰고, 읽기 전용 뷰(orders_view)를 별도로 만들어 조회 성능을 보완하는 것이 핵심이다.**

```
[쓰기]
주문 취소 요청
  → order_events에 ORDER_CANCELLED 이벤트 저장 (Event Sourcing)

[읽기 동기화]
  → 이벤트 구독 → orders_view 테이블 업데이트 (CQRS Read Model)

[읽기]
주문 조회 요청
  → orders_view에서 바로 조회 (빠름, 이벤트 replay 불필요)
```

즉 **Event Sourcing이 Write 모델이고, CQRS Read Model이 Query 모델**이다.

Event Sourcing 단독으로는 읽기가 느려서 실용적이지 않다. CQRS Read Model(읽기 전용 뷰)이 없으면 주문 1건 조회할 때마다 이벤트 전체를 처음부터 재생해야 한다. 두 패턴을 함께 쓰는 이유가 바로 이것이다.

---

## 5. 이 프로젝트와의 관계

이 프로젝트의 `order_events` 테이블이 Event Sourcing의 출발점 구조를 갖고 있다.

```sql
-- 현재: Redis Stream 메시지를 RDB에 기록하는 용도
-- order_events: { orderId, event, payload, createdAt }
```

다만 현재는 현재 상태(orders 테이블)와 이벤트(order_events)를 병행 관리하는 구조라 순수한 Event Sourcing은 아니다. 순수 Event Sourcing이라면 orders 테이블 없이 order_events만으로 현재 상태를 계산해야 한다.

---

## 6. 적용 난이도와 판단

| 단계 | 내용 | 난이도 |
|---|---|---|
| 현재 (부분 CQRS) | `@Transactional(readOnly)` + QueryDSL 분리 | 완료 |
| CQRS 심화 | Read Model 별도 테이블/저장소 | 중간 |
| Event Sourcing | 상태 대신 이벤트만 저장 + Read Model 동기화 | 높음 |

CQRS 심화부터 순서대로 적용하는 게 현실적이다. Event Sourcing은 이벤트 스키마 설계와 replay 로직, Read Model 동기화까지 고려해야 해서 서비스 복잡도가 충분히 높을 때 도입하는 게 맞다.

---

> ⚠️ **작업 전제 조건 — 반드시 확인할 것**
>
> CQRS 심화와 Event Sourcing은 **결제 서비스를 추가한 이후에 작업해야 의미가 있다.**
>
> 현재 도메인(주문 생성/취소)만으로는 Write/Read 분리의 실익이 크지 않다.
> 결제 → 재고 차감 → 주문 확정처럼 여러 서비스에 걸친 상태 변화가 생겨야
> Event Sourcing의 이벤트 이력 관리와 CQRS Read Model 동기화가 실질적인 가치를 가진다.
>
> **결제 서비스 추가 전에 이 작업을 시작하지 않는다.**
