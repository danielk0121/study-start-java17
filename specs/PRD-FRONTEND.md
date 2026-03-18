# [PRD-FRONTEND] 프론트엔드 기술 상세 명세 (Frontend-Specific)

## 1. 개요
본 문서는 `PRD.md`에 정의된 유스케이스를 구현하기 위한 프론트엔드(`front-app`, `frontbeta-app`)의 기술적 상세 내용을 다룹니다.

## 2. 화면 구성 및 라우팅 (Screen Architecture)
- **Home (/front/)**: 상품 목록 탐색 및 장바구니 담기.
- **Cart (/front/cart)**: 장바구니 항목 편집 및 주문 프로세스 진입.
- **OrderList (/front/orders)**: 본인의 주문 이력 확인.
- **AddressManagement (/front/addresses)**: 배송지 목록 관리.
- **MyPage (/front/mypage)**: 프로필 정보 조회.
- **Login/Register (/front/login, /front/register)**: 인증 처리.

## 3. 기술 스택 및 구현 전략
- **프레임워크**: React + Vite + TypeScript.
- **상태 관리**: React Context API 및 `useState`를 활용한 로컬 상태 관리.
- **API 연동**: Axios 기반의 중앙 집중형 API 클라이언트 구성.
- **디자인**: Vanilla CSS 활용, 기능 중심의 깔끔한 UI/UX 지향.
- **인증**: JWT 기반 인증 (LocalStorage에 Access Token 보관 및 헤더 전송).

## 4. 기획 및 검증 전략 (Prototyping)
- **`frontbeta-app`**: 
    - Flyway 샘플 데이터를 하드코딩된 Mock 데이터로 활용하여 신규 유스케이스를 조기에 시각화함.
    - 배포 경로: `/study-start-java17/frontbeta/`
- **`front-app`**:
    - `frontbeta-app`에서 검증된 UI를 이관하고 실제 백엔드 API를 연동함.
    - 배포 경로: `/study-start-java17/front/`

## 5. 주요 구현 상세
- **데이터 바인딩**: 모든 데이터는 `PRD.md`의 유스케이스와 `specs/openapi/` 명세를 100% 준수함.
- **에러 처리**: 전역 에러 바운더리 및 Toast 메시지를 통한 사용자 알림.
- **성능 최적화**: React.memo 및 이미지 최적화를 통한 렌더링 부하 최소화.
