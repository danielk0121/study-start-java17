# 연구조사: CQRS + Event Sourcing

> CQRS(Command Query Responsibility Segregation)와 Event Sourcing을 조사한다.
> 이 프로젝트는 이미 CQRS의 단순한 형태를 적용하고 있으며, Event Sourcing은 현재 구조와의 관계를 파악하는 것이 목표다.

---

## 1. CQRS

Command와 Query를 분리하는 패턴이다.

```
기존 방식:
Service → Repository → DB (읽기/쓰기 동일한 모델)

CQRS:
Command (쓰기) → CommandService → Write DB
Query  (읽기) → QueryService  → Read DB (또는 별도 뷰)
```

이 프로젝트에서 이미 부분적으로 적용하고 있다.

```java
// @Transactional(readOnly = true) = Query 분리
// QueryDSL 통계 API (/stats/**) = Read 전용 모델 (Projections)
```

이게 CQRS의 가장 단순한 형태다. 동일한 DB를 쓰되 읽기/쓰기 모델만 분리한 것.

---

## 2. Event Sourcing

DB에 현재 상태 대신 이벤트 이력 자체를 저장하는 패턴이다.

```
기존: orders 테이블 → { status: "CANCELLED" }

Event Sourcing:
order_events 테이블 →
  { event: "ORDER_CREATED",   at: "10:00" }
  { event: "PAYMENT_DONE",    at: "10:05" }
  { event: "ORDER_CANCELLED", at: "10:10" }

현재 상태 = 이벤트를 처음부터 재생(replay)해서 계산
```

**장점:** 모든 변경 이력이 보존됨, 특정 시점 상태 복원 가능

**단점:** 현재 상태 조회 시 이벤트 전체를 재생해야 해서 느림

---

## 3. Event Sourcing이 CQRS와 함께 쓰이는 이유

그래서 **CQRS로 읽기 전용 뷰(Read Model)를 별도로 만들어 조회 성능을 보완한다.**

```
Write: order_events에 이벤트 저장 (Event Sourcing)
Read:  이벤트를 구독해서 orders_view 테이블 동기화 (CQRS Read Model)
```

즉 **Event Sourcing이 Write 모델이고, CQRS Read Model이 Query 모델**이다.

---

## 4. 이 프로젝트와의 관계

이 프로젝트에 `order_events` 테이블이 이미 있어서 Event Sourcing의 출발점 구조는 갖고 있다.

```sql
-- 현재: Redis Stream 메시지를 RDB에 기록하는 용도
-- order_events: { orderId, event, payload, createdAt }
```

다만 현재는 현재 상태(orders 테이블)와 이벤트(order_events)를 병행 관리하는 구조라 순수한 Event Sourcing은 아니다. 순수 Event Sourcing이라면 orders 테이블 없이 order_events만으로 현재 상태를 계산해야 한다.

CQRS만 먼저 제대로 적용해보는 게 현실적인 순서다.

---

## 5. 적용 난이도와 판단

| 단계 | 내용 | 난이도 |
|---|---|---|
| 현재 (부분 CQRS) | `@Transactional(readOnly)` + QueryDSL 분리 | 완료 |
| CQRS 심화 | Read Model 별도 테이블/저장소 | 중간 |
| Event Sourcing | 상태 대신 이벤트만 저장 + Read Model 동기화 | 높음 |

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
