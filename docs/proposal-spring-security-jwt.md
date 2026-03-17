# 제안: Spring Security + JWT 인증/인가 적용

> 멀티 모듈 아키텍처(`docs/proposal-multimodule-architecture.md`) 기준으로 작성한다.
> 인증은 auth-service가 전담하며, 서비스 간 내부 통신에는 인증을 적용하지 않는다.

## 현황

현재 모든 API 엔드포인트가 인증 없이 누구나 접근 가능하다.
`Member` 도메인에 비밀번호 필드가 없으며, 로그인 기능이 존재하지 않는다.

```
현재 Member record 필드:
  id, email, name, role, createdAt, updatedAt

현재 MemberController 엔드포인트 (모두 인증 없음):
  POST   /members        회원가입 (email, name만 입력)
  GET    /members/{id}   회원 조회
  GET    /members        회원 목록 조회
  PUT    /members/{id}   회원 정보 수정
  DELETE /members/{id}   회원 삭제
```

---

## 인증 구조 원칙

> **클라이언트 ↔ 서비스 구간에서만 JWT 인증을 적용한다. 서비스 간 내부 통신(FeignClient)에는 인증을 적용하지 않는다.**

| 구간 | 인증 여부 | 방식 |
|---|---|---|
| 클라이언트 → Nginx → 각 서비스 | **O** | auth-service가 발급한 JWT를 `Authorization` 헤더에 포함 |
| 서비스 → 서비스 (FeignClient) | **X** | 내부 네트워크 신뢰 (Docker network / k8s ClusterIP) |

---

## 모듈별 역할 분담

### auth-service (신규)

인증 전담 모듈. 토큰 발급과 검증 로직을 모두 여기서 관리한다.

```
auth-service/src/main/java/dev/danielk/auth/
├── AuthController.java       # POST /auth/login, POST /auth/refresh
├── AuthService.java          # 인증 처리, JWT 생성, refresh token 관리
├── JwtProvider.java          # JWT 생성 / 파싱 / 검증 (공통 라이브러리로 추출 가능)
└── domain/
    └── RefreshToken.java     # refresh_tokens 테이블 엔티티
```

### member-service (기존 + 변경)

비밀번호 필드 추가 및 Spring Security 필터 설치.
토큰 발급은 하지 않고 **검증만** 수행한다.

```
member-service/src/main/java/dev/danielk/member/
├── config/
│   ├── SecurityConfig.java   # SecurityFilterChain — 인가 정책
│   └── JwtAuthFilter.java    # OncePerRequestFilter — JWT 검증 후 SecurityContext 주입
└── member/
    └── MemberController.java # GET /members/me 추가
```

### order-service (기존 + 변경)

member-service와 동일하게 Spring Security 필터만 설치한다.

```
order-service/src/main/java/dev/danielk/order/
└── config/
    ├── SecurityConfig.java
    └── JwtAuthFilter.java
```

### common (공통 라이브러리)

`JwtProvider`를 common 모듈에 두면 auth-service, member-service, order-service가 모두 공유할 수 있다.

```
common/src/main/java/dev/danielk/common/
└── auth/
    └── JwtProvider.java      # JWT 생성 / 파싱 / 검증
```

### db-migration (Flyway 전담)

비밀번호 컬럼 추가와 refresh_tokens 테이블 생성을 담당한다.

```
V5__add_member_password.sql   # members 테이블에 password 컬럼 추가
V6__create_auth.sql           # refresh_tokens 테이블 생성
```

---

## 적용 범위

### 1단계: 비밀번호 추가 및 BCrypt 해싱

`Member` 도메인과 `MemberEntity`에 `password` 필드를 추가하고,
회원가입 시 BCrypt로 해싱하여 저장한다.

**변경 대상 (member-service):**

| 파일 | 변경 내용 |
|---|---|
| `Member.java` | `password` 필드 추가 |
| `MemberEntity.java` | `password` 컬럼 추가 |
| `MemberController.java` | `JoinRequest`에 `password` 필드 추가 |
| `MemberService.java` | `join()` 메서드에서 BCrypt 해싱 처리 |
| `MemberMapper.java` | `MemberResponse`에서 `password` 제외 매핑 |

**변경 대상 (db-migration):**

| 파일 | 변경 내용 |
|---|---|
| `V5__add_member_password.sql` | `members` 테이블에 `password VARCHAR(255) NOT NULL` 컬럼 추가 |
| `V6__create_auth.sql` | `refresh_tokens` 테이블 생성 |

```sql
-- V6__create_auth.sql
-- auth-service 전용 테이블
-- member_id는 members 테이블과 논리적 관계이나 FK 제약 없음 (서비스 간 경계 원칙)
CREATE TABLE refresh_tokens (
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    member_id   BIGINT       NOT NULL,
    token       VARCHAR(512) NOT NULL UNIQUE,
    expires_at  DATETIME     NOT NULL,
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_refresh_tokens_member_id (member_id),
    INDEX idx_refresh_tokens_token (token)
);
```

### 2단계: JwtProvider (common 모듈)

auth-service, member-service, order-service가 모두 공유한다.

**신규 파일 (common):**

```
common/src/main/java/dev/danielk/common/auth/JwtProvider.java
```

### 3단계: auth-service 구현

로그인 API와 RefreshToken 갱신 API를 구현한다.

**신규 파일 (auth-service):**

```
auth-service/src/main/java/dev/danielk/auth/
├── AuthController.java       # POST /auth/login, POST /auth/refresh
├── AuthService.java          # 이메일/비밀번호 검증, JWT 발급, refresh token 저장
├── LoginRequest.java         # record: email, password
├── LoginResponse.java        # record: accessToken, refreshToken
└── domain/
    ├── RefreshToken.java     # JPA 엔티티
    └── RefreshTokenRepository.java
```

**auth-service SecurityConfig 인가 정책:**

| 경로 | 접근 |
|---|---|
| `POST /auth/login` | 누구나 |
| `POST /auth/refresh` | 누구나 |
| `GET /actuator/**` | 누구나 |
| 그 외 | 인증 필요 |

### 4단계: member-service, order-service에 JWT 필터 설치

토큰 발급은 하지 않고 검증만 수행한다.
`JwtAuthFilter`가 `Authorization: Bearer <token>` 헤더를 파싱해 `SecurityContext`에 주입한다.

**신규 파일 (member-service, order-service 동일 구조):**

```
config/
├── SecurityConfig.java
└── JwtAuthFilter.java
```

**member-service SecurityConfig 인가 정책:**

| 경로 | 접근 |
|---|---|
| `POST /members` | 누구나 (회원가입) |
| `GET /actuator/**` | 누구나 |
| 그 외 | 인증 필요 |

### 5단계: 인증 기반 회원 조회

`GET /members/me` 엔드포인트를 추가해 토큰의 주인이 자신의 정보를 조회하도록 한다.

### 6단계: 테스트

Spring Security가 적용된 환경에서 MockMvc 기반 통합 테스트를 작성한다.

---

## 기술 선택

### JWT 라이브러리: jjwt (io.jsonwebtoken)

Spring Boot 2.7.x 환경에서 가장 널리 사용되는 Java JWT 라이브러리.
`jjwt-api` + `jjwt-impl` + `jjwt-jackson` 3개 아티팩트로 구성된다.

```groovy
// common/build.gradle
implementation 'io.jsonwebtoken:jjwt-api:0.11.5'
runtimeOnly    'io.jsonwebtoken:jjwt-impl:0.11.5'
runtimeOnly    'io.jsonwebtoken:jjwt-jackson:0.11.5'
```

### 토큰 구조

| Claim | 값 | 설명 |
|---|---|---|
| `sub` | `member.id()` (문자열) | 표준 subject — 회원 식별자 |
| `role` | `member.role().name()` | 인가용 권한 정보 |
| `iat` | 발급 시각 | 표준 issued-at |
| `exp` | 발급 시각 + 유효기간 | 표준 expiration |

AccessToken과 RefreshToken 모두 사용한다.
RefreshToken은 auth-service의 `refresh_tokens` 테이블에 저장하여 관리한다.

---

## 목표 흐름

```
[회원가입]
  POST /members  { email, name, password }
    → member-service: BCrypt 해싱 후 DB 저장
    → MemberResponse 반환 (password 필드 제외)

[로그인]
  POST /auth/login  { email, password }
    → auth-service: member-service FeignClient로 회원 조회 (인증 없이 내부 호출)
    → BCrypt 비교
    → 일치 시 AccessToken + RefreshToken 발급
    → RefreshToken은 refresh_tokens 테이블에 저장
    → { accessToken: "eyJ...", refreshToken: "eyJ..." } 반환

[토큰 갱신]
  POST /auth/refresh  { refreshToken: "eyJ..." }
    → auth-service: refresh_tokens 테이블에서 유효성 확인
    → 새 AccessToken 발급
    → { accessToken: "eyJ..." } 반환

[인증된 요청]
  GET /members/me
    Authorization: Bearer eyJ...
    → Nginx → member-service
    → JwtAuthFilter: 토큰 파싱 → SecurityContext에 인증 정보 주입
    → Controller: SecurityContext에서 memberId 추출 → 회원 조회 → 응답
```

---

## 작업 목록

### 1단계: 비밀번호 필드 추가 (member-service + db-migration)

- [ ] `Member` record에 `password` 필드 추가
- [ ] `MemberEntity`에 `password` 컬럼 추가
- [ ] `MemberController.JoinRequest`에 `password` 필드 추가
- [ ] `MemberService.join()`에서 BCrypt 해싱 후 저장
- [ ] `MemberMapper` — `MemberResponse` 매핑 시 `password` 제외
- [ ] db-migration: `V5__add_member_password.sql` 작성
- [ ] db-migration: `V6__create_auth.sql` 작성

### 2단계: JwtProvider (common 모듈)

- [ ] `common/build.gradle`에 `jjwt` 의존성 추가
- [ ] `JwtProvider` 작성 — 토큰 생성 / 파싱 / 만료 검증

### 3단계: auth-service 구현

- [ ] `auth-service/build.gradle`에 `spring-boot-starter-security`, `common` 의존성 추가
- [ ] `RefreshToken` JPA 엔티티 작성
- [ ] `AuthService` 작성 — member-service FeignClient 호출, BCrypt 비교, JWT 발급, RefreshToken 저장
- [ ] `AuthController` 작성 — `POST /auth/login`, `POST /auth/refresh`
- [ ] `SecurityConfig` 작성 — `/auth/**`, `/actuator/**` 허용, 나머지 인증 필요
- [ ] `application.yml`에 JWT 설정 추가 (`jwt.secret`, `jwt.expiration-ms`, `jwt.refresh-expiration-ms`)

### 4단계: member-service, order-service JWT 필터 설치

- [ ] `member-service/build.gradle`에 `spring-boot-starter-security`, `common` 의존성 추가
- [ ] `JwtAuthFilter` 작성 — `Authorization` 헤더에서 토큰 추출 및 SecurityContext 주입
- [ ] `SecurityConfig` 작성 — `POST /members`, `/actuator/**` 허용, 나머지 인증 필요
- [ ] `order-service`에 동일하게 적용

### 5단계: 인증 기반 회원 조회

- [ ] `GET /members/me` 엔드포인트 추가 — SecurityContext에서 memberId 추출
- [ ] 기존 `GET /members/{id}` — 인증 필요로 변경

### 6단계: 테스트

- [ ] `AuthControllerRestDocsTest` — 로그인 성공/실패, 토큰 갱신 시나리오 + REST Docs 스니펫
- [ ] `MemberControllerRestDocsTest` 수정 — `@WithMockUser` 또는 실제 JWT 헤더 주입
- [ ] 미인증 요청 401, 권한 없는 요청 403 검증

---

## 핵심 고려사항

### auth-service의 member-service 의존

로그인 시 auth-service가 이메일로 회원을 조회하고 BCrypt 비교를 해야 한다.
이때 password 해시값이 필요하므로 member-service가 내부 전용 API를 별도로 제공해야 한다.

```
POST /internal/members/authenticate  { email, password }
  → BCrypt 비교 후 MemberInfo 반환 (id, role 포함)
```

이 엔드포인트는 Nginx 라우팅에 포함하지 않고 서비스 내부 네트워크에서만 접근 가능하도록 한다.

### JwtProvider 위치 결정

| 방식 | 장점 | 단점 |
|---|---|---|
| common 모듈에 배치 | 코드 중복 없음, 시크릿 키 일관성 | common이 보안 로직을 가짐 |
| 각 서비스에 복사 | 서비스 간 완전 독립 | 코드 중복, 시크릿 키 동기화 필요 |

학습 프로젝트 규모에서는 **common 모듈에 배치**하는 것이 현실적이다.

### password 필드와 record 불변성

`Member` record는 불변이므로 `password`는 조회 응답에 노출되지 않도록
`MemberMapper`에서 `MemberResponse` 변환 시 명시적으로 제외해야 한다.

### 기존 RestDocs 테스트 영향

Spring Security 적용 시 기존 `MemberControllerRestDocsTest` 등이 401로 실패한다.
테스트에서 `@WithMockUser` 어노테이션 또는 `SecurityMockMvcRequestPostProcessors.jwt()`를
사용해 인증 컨텍스트를 주입해야 한다.

### CSRF

REST API + Stateless JWT 구조이므로 CSRF 보호를 비활성화한다.
세션을 사용하지 않으므로 `SessionCreationPolicy.STATELESS`로 설정한다.

---

## 단계별 실행 순서 (권장)

```
1. db-migration: V5, V6 SQL 작성 → ./gradlew :db-migration:bootRun 확인
2. member-service: 비밀번호 필드 추가 + BCrypt 해싱 → 빌드/기존 테스트 통과 확인
3. common: JwtProvider 작성
4. auth-service: Spring Security + JWT 발급 + RefreshToken 구현
   → POST /auth/login 동작 확인
5. member-service: Spring Security 필터 설치
   → 기존 테스트 401 실패 확인 (의도된 동작)
   → @WithMockUser / JWT 헤더 주입으로 테스트 수정
6. order-service: Spring Security 필터 설치
7. GET /members/me 구현 + 테스트
8. 전체 빌드 및 테스트 통과 후 커밋
```
