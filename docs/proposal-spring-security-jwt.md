# 제안: Spring Security + JWT 인증/인가 적용

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

## 적용 범위

### 1단계: 비밀번호 추가 및 BCrypt 해싱

`Member` 도메인과 `MemberEntity`에 `password` 필드를 추가하고,
회원가입 시 BCrypt로 해싱하여 저장한다.

**변경 대상:**

| 파일 | 변경 내용 |
|---|---|
| `Member.java` | `password` 필드 추가 |
| `MemberEntity.java` | `password` 컬럼 추가 |
| `MemberController.java` | `JoinRequest`에 `password` 필드 추가 |
| `MemberService.java` | `join()` 메서드에서 BCrypt 해싱 처리 |
| `MemberMapper.java` | `MemberResponse`에서 `password` 제외 매핑 |
| Flyway | `V5__add_member_password.sql` — `password` 컬럼 추가 |

### 2단계: Spring Security 설정

`spring-boot-starter-security` 의존성을 추가하고
JWT 기반 Stateless 인증을 구성한다.

**신규 파일:**

```
src/main/java/dev/danielk/startjava17/
├── auth/
│   ├── AuthController.java       # POST /auth/login — JWT 발급
│   ├── AuthService.java          # 인증 처리, JWT 생성
│   ├── JwtProvider.java          # JWT 생성 / 파싱 / 검증
│   ├── JwtAuthFilter.java        # OncePerRequestFilter — 요청마다 JWT 검증
│   └── SecurityConfig.java       # SecurityFilterChain 설정
```

**SecurityConfig 인가 정책:**

| 경로 | 접근 |
|---|---|
| `POST /members` | 누구나 (회원가입) |
| `POST /auth/login` | 누구나 (로그인) |
| `GET /actuator/**` | 누구나 (헬스체크) |
| 그 외 모든 요청 | 인증 필요 |

### 3단계: JWT 기반 회원 정보 조회

로그인 후 발급받은 AccessToken으로 `GET /members/{id}` 호출 시
JWT에서 추출한 사용자 정보를 기반으로 응답한다.

추가로 `GET /members/me` 엔드포인트를 도입해 토큰의 주인이 직접 자신의 정보를 조회하도록 한다.

### 4단계: 테스트

Spring Security가 적용된 환경에서 MockMvc 기반 통합 테스트를 작성한다.

---

## 기술 선택

### JWT 라이브러리: jjwt (io.jsonwebtoken)

Spring Boot 2.7.x 환경에서 가장 널리 사용되는 Java JWT 라이브러리.
`jjwt-api` + `jjwt-impl` + `jjwt-jackson` 3개 아티팩트로 구성된다.

```groovy
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

AccessToken만 사용한다. RefreshToken은 별도 저장소가 필요하므로 이번 범위에서 제외한다.

---

## 목표 흐름

```
[회원가입]
  POST /members  { email, name, password }
    → BCrypt 해싱 후 DB 저장
    → MemberResponse 반환 (password 필드 제외)

[로그인]
  POST /auth/login  { email, password }
    → DB에서 회원 조회 → BCrypt 비교
    → 일치 시 JWT AccessToken 발급
    → { accessToken: "eyJ..." } 반환

[인증된 요청]
  GET /members/me
    Authorization: Bearer eyJ...
    → JwtAuthFilter: 토큰 파싱 → SecurityContext에 인증 정보 주입
    → Controller: SecurityContext에서 memberId 추출 → 회원 조회 → 응답
```

---

## 작업 목록

### 1단계: 비밀번호 필드 추가

- [ ] `Member` record에 `password` 필드 추가
- [ ] `MemberEntity`에 `password` 컬럼 추가
- [ ] `MemberController.JoinRequest`에 `password` 필드 추가
- [ ] `MemberService.join()`에서 BCrypt 해싱 후 저장
- [ ] `MemberMapper` — `MemberResponse` 매핑 시 `password` 제외
- [ ] Flyway `V5__add_member_password.sql` 작성

### 2단계: Spring Security + JWT 설정

- [ ] `build.gradle`에 `spring-boot-starter-security`, `jjwt` 의존성 추가
- [ ] `JwtProvider` 작성 — 토큰 생성 / 파싱 / 만료 검증
- [ ] `JwtAuthFilter` 작성 — `Authorization` 헤더에서 토큰 추출 및 SecurityContext 주입
- [ ] `SecurityConfig` 작성 — `SecurityFilterChain`, 인가 정책, CSRF 비활성화 (Stateless)
- [ ] `application.yml`에 JWT 설정 추가 (`jwt.secret`, `jwt.expiration-ms`)

### 3단계: 로그인 API

- [ ] `AuthController` 작성 — `POST /auth/login`
- [ ] `AuthService` 작성 — 이메일/비밀번호 검증 후 JWT 발급
- [ ] `LoginRequest` record, `LoginResponse` record 정의

### 4단계: 인증 기반 회원 조회

- [ ] `GET /members/me` 엔드포인트 추가 — SecurityContext에서 memberId 추출
- [ ] 기존 `GET /members/{id}` — 인증 필요로 변경

### 5단계: 테스트

- [ ] `AuthControllerRestDocsTest` — 로그인 성공/실패 시나리오 + REST Docs 스니펫 생성
- [ ] `MemberControllerRestDocsTest` 수정 — `@WithMockUser` 또는 실제 JWT 헤더 주입
- [ ] `SecurityIntegrationTest` — 미인증 요청 401, 권한 없는 요청 403 검증

---

## 핵심 고려사항

### password 필드와 record 불변성

`Member` record는 불변이므로 `password`는 조회 응답에 노출되지 않도록
`MemberMapper`에서 `MemberResponse` 변환 시 명시적으로 제외해야 한다.

### 기존 InMemoryRepository와의 공존

`MemberInMemoryRepository`는 테스트용 구현체다.
`password` 필드 추가 시 이 구현체도 함께 수정해야 하며,
테스트에서 비밀번호 해싱이 중복 실행되지 않도록 주의한다.

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
1. 비밀번호 필드 추가 + BCrypt 해싱 → 빌드/기존 테스트 통과 확인
2. Spring Security 의존성 추가 → 기존 테스트 401 실패 확인 (의도된 동작)
3. SecurityConfig 작성 + JwtProvider + JwtAuthFilter 구현
4. 기존 RestDocs 테스트 수정 (@WithMockUser / JWT 헤더 주입)
5. 로그인 API 구현 + AuthControllerRestDocsTest 작성
6. GET /members/me 구현 + 테스트
7. 전체 빌드 및 테스트 통과 후 커밋
```
