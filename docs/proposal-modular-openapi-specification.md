# [Proposal] OpenAPI 모듈화 및 서비스별 스펙 관리 방안

## 1. 배경 및 문제 제기
현재 프로젝트는 `member-service`, `auth-service`, `order-service`, `bff` 등 4개의 독립적인 마이크로서비스로 구성되어 있으나, 모든 API 스펙이 하나의 `openapi.yaml` 파일에 집중되어 있습니다. 이는 다음과 같은 문제점을 야기합니다.
- **관심사의 분리(SoC) 부족**: 특정 서비스의 변경이 전체 스펙 파일에 영향을 줌.
- **가독성 저하**: 서비스가 확장될수록 단일 파일의 크기가 비대해짐.
- **SDD 원칙의 모호성**: 특정 서비스의 Controller를 수정할 때 어떤 부분의 스펙을 참조해야 하는지 직관적이지 않음.

## 2. 모듈화 제안 (3가지 방식)

### 방식 A: 서비스별 완전 분리 (추천)
- **구조**: `specs/openapi/` 폴더 내에 서비스별 독립 YAML 파일 생성.
  - `auth-service.yaml`, `member-service.yaml`, `order-service.yaml`, `bff.yaml`
- **장점**: 각 서비스의 독립적인 배포 및 수정이 용이하며 SDD 원칙이 가장 명확함.

### 방식 B: $ref를 활용한 계층형 구조
- **구조**: 루트 `openapi.yaml`은 지도의 역할만 수행하고, 세부 경로는 외부 파일을 참조.
- **장점**: 전체 시스템의 API 현황을 한눈에 보면서도 상세 내용은 분리 관리 가능.

### 방식 C: 도메인 API vs BFF API 이원화
- **구조**: 실제 기능을 담당하는 도메인 서비스(Core)와 클라이언트 대응용 BFF의 스펙을 성격에 따라 분리.
- **장점**: 내부 서비스 간 통신용 API와 외부 노출용 API의 보안 및 데이터 형식을 다르게 관리 가능.

## 3. 권장 아키텍처 및 폴더 구조

본 프로젝트의 **SDD(스펙 주도 개발)** 철학을 극대화하기 위해 **방식 A**를 기반으로 한 아래 구조를 권장합니다.

```text
specs/
└── openapi/
    ├── auth-service.yaml    # 인증/인가 도메인 스펙
    ├── member-service.yaml  # 회원 도메인 및 통계 스펙
    ├── order-service.yaml   # 주문 및 재고 도메인 스펙
    ├── bff.yaml             # 프론트엔드 대응용 API 조합 스펙
    └── common.yaml          # 공통 ErrorResponse, DTO 스펙 (공유 모델)
```

## 4. SDD 실천 지침 (Guidelines)

1. **스펙 우선 수정**: 특정 서비스(예: `order-service`)의 기능을 수정하거나 추가할 때, 반드시 `specs/openapi/order-service.yaml`을 먼저 수정한다.
2. **독립성 유지**: 서비스 간 중복되는 모델이 있더라도 가능한 각 서비스 스펙 내에서 정의하거나 `common.yaml`을 참조하여 의존성을 최소화한다.
3. **BFF 역할 명확화**: BFF 스펙은 여러 도메인 서비스의 응답을 어떻게 조합(Aggregation)하는지에 집중하며, 도메인 고유의 비즈니스 로직 스펙은 각 서비스 파일에 둔다.

## 5. 향후 작업 계획 (Roadmap)
- [ ] 기존 `specs/openapi.yaml` 분석 및 서비스별 파편화
- [ ] `specs/openapi/` 폴더 구조 생성 및 파일 분리
- [ ] 서비스별 Controller 코드와 분리된 스펙 간의 정합성 검증
- [ ] Swagger UI에서 각 서비스별 스펙을 선택해서 볼 수 있도록 설정 (Select-box 연동 예정)
