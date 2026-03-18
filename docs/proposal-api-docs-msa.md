# 제안: MSA 환경 API 문서 전략 — 서비스별 Swagger + 통합 뷰

## 현황

모놀리틱 구조에서 MSA로 분리됨에 따라, API 문서도 서비스별로 독립 관리가 필요하다.
현재 `docs/openapi.yaml`은 모놀리틱 기준으로 작성된 단일 파일이며, 멀티 모듈 전환 후에는 유효하지 않다.

---

## 목표

1. 각 서비스가 자체 Swagger UI를 제공한다.
2. 여러 서비스의 API 문서를 한 화면에서 통합해서 볼 수 있다.

---

## 서비스별 Swagger (springdoc-openapi)

각 서비스(auth-service, member-service, order-service, bff)에 `springdoc-openapi-ui`를 적용한다.

### 의존성 추가 (각 서비스 build.gradle)

```groovy
implementation 'org.springdoc:springdoc-openapi-ui:1.7.0'
```

### 접근 URL

| 서비스 | Swagger UI | OpenAPI JSON |
|---|---|---|
| auth-service | `http://localhost:8082/swagger-ui/index.html` | `http://localhost:8082/v3/api-docs` |
| member-service | `http://localhost:8080/swagger-ui/index.html` | `http://localhost:8080/v3/api-docs` |
| order-service | `http://localhost:8081/swagger-ui/index.html` | `http://localhost:8081/v3/api-docs` |
| bff | `http://localhost:8000/swagger-ui/index.html` | `http://localhost:8000/v3/api-docs` |

### application.yml 설정

Spring Security가 적용된 서비스에서는 Swagger 경로를 인증 예외에 추가해야 한다.

```yaml
springdoc:
  swagger-ui:
    path: /swagger-ui/index.html
  api-docs:
    path: /v3/api-docs
```

SecurityConfig에서 Swagger 경로 허용:

```java
.antMatchers("/swagger-ui/**", "/v3/api-docs/**", "/swagger-ui.html").permitAll()
```

---

## 통합 뷰 전략

### 방법 1: Swagger UI의 다중 URL 기능 (권장 — 별도 서버 불필요)

springdoc-openapi Swagger UI는 `springdoc.swagger-ui.urls` 설정으로 여러 서비스의 스펙을 하나의 UI에서 선택해서 볼 수 있다.

**bff 또는 별도 docs 서비스에 설정:**

```yaml
springdoc:
  swagger-ui:
    urls:
      - name: auth-service
        url: http://localhost:8082/v3/api-docs
      - name: member-service
        url: http://localhost:8080/v3/api-docs
      - name: order-service
        url: http://localhost:8081/v3/api-docs
    urls-primary-name: member-service
```

접근: `http://localhost:8000/swagger-ui/index.html` → 상단 드롭다운으로 서비스 전환 가능.

**장점:**
- 추가 인프라 없음
- springdoc이 내장으로 지원
- 각 서비스 UI도 독립 제공

**단점:**
- 서비스가 실행 중이어야 스펙 로드 가능 (정적 파일 아님)
- 서비스 URL이 브라우저에서 직접 접근 가능해야 함 (CORS 설정 필요)

---

### 방법 2: 정적 OpenAPI 파일 통합 (오프라인/CI 친화적)

각 서비스 빌드 시 `v3/api-docs` 스펙을 `docs/` 폴더에 저장하고, Swagger Editor 또는 ReDoc으로 열람.

**파일 구조:**

```
docs/
├── api/
│   ├── auth-service.yaml
│   ├── member-service.yaml
│   ├── order-service.yaml
│   └── bff.yaml
```

**스펙 추출 스크립트 (서비스 실행 중일 때):**

```bash
curl http://localhost:8082/v3/api-docs.yaml -o docs/api/auth-service.yaml
curl http://localhost:8080/v3/api-docs.yaml -o docs/api/member-service.yaml
curl http://localhost:8081/v3/api-docs.yaml -o docs/api/order-service.yaml
curl http://localhost:8000/v3/api-docs.yaml -o docs/api/bff.yaml
```

**장점:**
- 서비스 미실행 상태에서도 열람 가능
- GitHub에서 링크로 공유 가능 (Swagger Editor URL 방식)
- CI에서 자동 추출 후 커밋 가능

**단점:**
- 스펙이 코드와 별도 관리되므로 동기화 누락 위험

---

### 방법 3: Swagger Aggregator 도구 (대규모 팀)

`swagger-merger`, `openapi-merge-cli` 같은 도구로 여러 스펙을 하나의 파일로 병합.
학습 프로젝트 규모에서는 불필요.

---

## 권장 접근 방식

| 단계 | 내용 |
|---|---|
| 1단계 | 각 서비스에 `springdoc-openapi-ui` 의존성 추가 + SecurityConfig 허용 경로 추가 |
| 2단계 | bff의 `application.yml`에 `springdoc.swagger-ui.urls` 설정으로 통합 드롭다운 뷰 구성 |
| 3단계 | (선택) 스펙 추출 스크립트로 `docs/api/*.yaml` 생성 후 커밋 |

---

## CORS 고려사항

Swagger UI가 다른 포트의 `/v3/api-docs`를 직접 호출하므로, 각 서비스에 CORS 허용이 필요하다.
로컬 개발 환경 기준으로만 허용하고, 운영에서는 Nginx 프록시를 통해 단일 도메인으로 노출하는 것이 안전하다.

```java
// SpringDoc CORS 설정 예시 (로컬용)
@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenApi() {
        return new OpenAPI()
                .info(new Info()
                        .title("서비스명 API")
                        .version("1.0.0"));
    }
}
```

```yaml
# application-local.yml
spring:
  web:
    cors:
      allowed-origins: "http://localhost:8000"
      allowed-methods: GET
      allowed-paths: /v3/api-docs/**
```

---

## 작업 목록

- [ ] 각 서비스 `build.gradle`에 `springdoc-openapi-ui:1.7.0` 추가
- [ ] 각 서비스 `SecurityConfig`에 Swagger 경로 허용 추가
- [ ] bff `application.yml`에 `springdoc.swagger-ui.urls` 설정 (통합 드롭다운)
- [ ] 로컬 CORS 설정 추가 (bff → 각 서비스 `/v3/api-docs` 호출 허용)
- [ ] (선택) `infra/scripts/export-api-docs.sh` — 스펙 추출 스크립트 작성
