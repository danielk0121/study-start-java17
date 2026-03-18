# [PRD-BACKEND] 백엔드 기술 상세 명세 (Backend-Specific)

## 0. 표준 작업 프로세스 (Development Workflow)
요구사항 변경 시 다음 순서를 엄수한다. **스펙이 코드보다 우선**하며, **도메인 모델이 설계의 중심**이 되어야 한다.

1. **PRD 수정** ([`specs/PRD.md`](./PRD.md))
   - 비즈니스 유스케이스와 기술 명세를 업데이트한다.
   - 프로젝트의 방향과 '무엇을(What)' 할지 정의하는 최상위 단계이다.
2. **DB 스펙 수정** ([`specs/erd.dbml`](./erd.dbml))
   - 도메인 모델 및 DB 스키마를 설계한다. (DDD)
3. **API 스펙 수정** ([`specs/openapi/`](./openapi/))
   - 서비스별 YAML 파일을 수정하여 인터페이스를 정의한다. (SDD)
4. **이벤트 명세 수정** ([`specs/events.toml`](./events.toml))
   - 서비스 간 비동기 메시지 구조를 정의한다. (EDD)
5. **구현 및 검증**
   - 설계 완료 후 실제 Java 코드를 구현하고 테스트를 수행한다.

---

## 1. 개발 방법론 (Development Methodologies)

### 1.1. 스펙 주도 개발 (SDD - Spec Driven Development)
- **기준 문서**: `specs/openapi/*.yaml` (서비스별 독립 관리)
- **원칙**:
    - Controller 코드를 먼저 작성하지 않는다.
    - 기능 변경 시 해당 서비스의 `openapi/*.yaml` 스펙을 우선 수정한다.
    - 구현된 코드는 정의된 API 스펙을 100% 준수해야 한다.

### 1.2. 도메인 주도 개발 (DDD - Domain Driven Development)
- **기준 문서**: `specs/erd.dbml`
- **원칙**:
    - DB 설계 및 Entity 작성 시 `erd.dbml`을 최우선 참고 및 수정한다.
    - 비즈니스 로직은 최대한 도메인 모델(Entity, record) 내부에 응집시킨다.

### 1.3. 이벤트 주도 개발 (EDD - Event Driven Development)
- **기준 문서**: `specs/events.toml`
- **메커니즘**: Redis Streams를 메시지 브로커로 활용하여 서비스 간 비동기 이벤트를 처리한다.

---

## 2. 기술 구현 명세 (Technical Specifications)

### 2.1. 보안 및 인증 구현
- **비밀번호 저장**: 회원가입 시 비밀번호는 **BCrypt**로 해싱하여 저장한다.
- **관리자 가입 보안**: MANAGER 권한 가입 시, 사전에 정의된 관리자 인증 코드를 검증한다.
- **로그인 메커니즘**: 로그인 성공 시 Access/Refresh Token을 발급하여 인증을 유지한다.
- **JWT 인가**: 토큰 내 권한 정보를 기반으로 서비스별 기능 접근을 제어한다.

### 2.2. 데이터 및 인터페이스 구현
- **배송지 정보 복사**: 주문 생성 시점의 배송지 정보를 주문 데이터에 복사하여 스냅샷으로 보관한다.
- **통계 쿼리**: QueryDSL을 활용하여 복합적인 데이터 통계 기능을 구현한다.
- **분산 추적**: Sleuth와 Zipkin을 연동하여 서비스 간 호출 흐름을 가시화한다.
- **페이지네이션**: Spring Data의 `Pageable` 표준 형식을 사용한다.

---

## 3. 비기능 요구사항 (Non-Functional Requirements)
- **관측 가능성(Observability)**: 모든 요청은 `traceId`를 로그에 포함하며, Zipkin을 통해 시각화한다.
- **성능**: 쓰기 작업과 읽기 작업을 명확히 분리하여 DB 부하를 최적화한다.
- **표준 응답**: 성공 시 데이터 객체, 실패 시 `ErrorResponse` record 형식을 전역적으로 사용한다.

---

## 4. E2E 테스트 가이드 (E2E Testing Guide)
- **테스트 기준**: `specs/PRD.md`에 정의된 핵심 유스케이스를 기준으로 검증한다.
- **테스트 방법**: **Locust**를 사용하여 시나리오 기반의 E2E 및 부하 테스트를 수행한다.

---

## 5. 도메인 모델링 가이드 (DDD Context)
- **Entity**: 식별자(ID)를 가지며 생명주기가 있는 객체 (Member, Product, Order, ShippingAddress).
- **Value Object (VO)**: 속성값으로만 정의되는 불변 객체. Java `record` 사용.
- **Aggregate**: 데이터 변경의 단위. `Order`는 하위 `OrderItem`과 하나의 애그리거트로 관리된다.
