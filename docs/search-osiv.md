# OSIV (Open Session In View)

OSIV(Open Session In View)는 JPA(또는 하이버네이트) 애플리케이션에서 영속성 컨텍스트(Persistence Context)와 데이터베이스 커넥션의 생존 범위를 HTTP 요청의 시작부터 뷰(View) 렌더링 또는 API 응답이 끝날 때까지 길게 열어두는 패턴입니다. Spring 환경에서는 주로 Open EntityManager In View라고도 불립니다.

OSIV를 켜고 끄는 것에 따라 애플리케이션의 동작 방식과 성능에 큰 차이가 발생합니다.

---

## 1. OSIV ON (스프링 부트 기본값)

- **동작 방식:** 사용자 요청이 들어와 필터(Filter)나 인터셉터(Interceptor)를 거칠 때 영속성 컨텍스트를 생성하고 DB 커넥션을 가져옵니다. 이후 Controller, Service(트랜잭션 시작/종료), View 렌더링 단계까지 계속 커넥션을 유지하다가 응답이 나갈 때 닫습니다.
- **장점:** Service 계층의 트랜잭션이 종료된 후에도 영속성 컨텍스트가 살아있으므로, Controller나 View 계층에서 지연 로딩(Lazy Loading)을 자유롭게 사용할 수 있습니다. 코드를 작성하기 매우 편리해집니다.
- **단점 (치명적):** 너무 오랫동안 DB 커넥션을 물고 있습니다. Controller에서 외부 API를 호출하거나 처리 시간이 긴 로직이 있다면, 그 시간 동안 DB 커넥션을 반환하지 못합니다. 트래픽이 많아지면 DB 커넥션 풀(Connection Pool)이 빠르게 고갈되어 애플리케이션 장애로 이어질 수 있습니다.

```
HTTP 요청 시작
    │
    ▼
[Filter / Interceptor] ← 영속성 컨텍스트 생성, DB 커넥션 획득
    │
    ▼
[Controller]           ← 지연 로딩 가능
    │
    ▼
[Service] @Transactional 시작 ~ 종료
    │
    ▼
[Controller] 응답 직전  ← 지연 로딩 가능 (커넥션 아직 유지 중)
    │
    ▼
HTTP 응답 완료          ← 영속성 컨텍스트 종료, DB 커넥션 반환
```

---

## 2. OSIV OFF (`spring.jpa.open-in-view=false`)

- **동작 방식:** Service 계층에서 `@Transactional`을 만나 트랜잭션이 시작될 때 영속성 컨텍스트와 DB 커넥션을 가져오고, 트랜잭션이 끝날 때 영속성 컨텍스트를 닫고 커넥션도 즉시 반환합니다.
- **장점:** DB 커넥션을 트랜잭션 범위 내에서만 짧게 유지하므로 리소스를 낭비하지 않아 트래픽이 많은 대규모 서비스에서도 안정적인 성능을 발휘합니다.
- **단점:** 트랜잭션이 끝난 Controller나 View 계층에서는 지연 로딩을 사용할 수 없어 `LazyInitializationException`이 발생합니다.

```
HTTP 요청 시작
    │
    ▼
[Filter / Interceptor]
    │
    ▼
[Controller]
    │
    ▼
[Service] @Transactional 시작
    │  ← 영속성 컨텍스트 생성, DB 커넥션 획득
    │  ← 지연 로딩 가능
    │
[Service] @Transactional 종료
    │  ← 영속성 컨텍스트 종료, DB 커넥션 즉시 반환
    ▼
[Controller] 응답 직전  ← 지연 로딩 불가 → LazyInitializationException
```

---

## 실무 권장 사항

스프링 부트는 기본적으로 OSIV를 켜두지만(`true`), 애플리케이션 시작 시 잠재적인 성능 이슈를 경고하는 로그(WARN)를 남깁니다.
대규모 트래픽을 다루는 실무에서는 OSIV 설정을 끄는(`false`) 것을 강력히 권장합니다.

```yaml
# application.yml
spring:
  jpa:
    open-in-view: false
```

OSIV를 껐을 때 발생하는 지연 로딩 문제는 주로 아래 두 가지 방법으로 해결합니다.

### 해결책 1 — 페치 조인(Fetch Join)

필요한 연관 엔티티를 Service/Repository 계층에서 쿼리 한 번에 모두 가져옵니다.

```java
// OrderJpaRepository
@Query("SELECT o FROM OrderEntity o JOIN FETCH o.items WHERE o.id = :id")
Optional<OrderEntity> findByIdWithItems(@Param("id") Long id);
```

### 해결책 2 — Service 계층에서 DTO 변환

트랜잭션이 끝나기 전(Service 계층 안)에 지연 로딩을 강제 초기화하여 필요한 데이터만 담은 DTO로 변환한 뒤 Controller로 넘깁니다.

```java
@Transactional(readOnly = true)
public OrderResponse findById(Long id) {
    Order order = repository.findById(id)
            .orElseThrow(...);
    // 트랜잭션 안에서 DTO 변환 → 지연 로딩 초기화됨
    return mapper.toResponse(order);
}
```

---

## 이 프로젝트에서의 적용

현재 프로젝트는 도메인 record + JPA Entity 분리 구조를 사용합니다.
`JpaRepositoryAdapter`가 `toDomain()` 호출 시 `@OneToMany` 컬렉션을 초기화하므로,
OSIV OFF 상태에서도 Service 계층 안에서 변환이 완료됩니다.

```
OrderJpaRepositoryAdapter.findById()
    └── jpaRepository.findById(id)       ← 트랜잭션 안
    └── OrderEntity.toDomain()           ← items 컬렉션 접근 → 지연 로딩 초기화
    └── Order(record) 반환               ← 영속성 컨텍스트 종료 후에도 안전
```

TODO: `spring.jpa.open-in-view=false` 설정 후 동작 검증 테스트 작성
