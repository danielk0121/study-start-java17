# 쇼핑몰 프론트엔드 (frontapp) 실행 가이드

백엔드 개발자를 위한 React + TypeScript 프로젝트 가이드입니다. Java/Spring 환경과 비교하여 설명합니다.

## 1. 사전 준비 (Prerequisites)

이 앱을 실행하려면 컴퓨터에 **Node.js**가 설치되어 있어야 합니다.
- 설치 확인: 터미널에서 `node -v` 입력
- 권장 버전: v18 이상

## 2. 실행 명령어 (Commands)

Spring의 Gradle 명령어와 대응되는 npm 명령어입니다. `frontapp` 폴더 안에서 실행하세요.

| 작업 | 명령어 | 설명 | Spring (Gradle) 대응 |
| :--- | :--- | :--- | :--- |
| **의존성 설치** | `npm install` | `package.json`에 적힌 라이브러리 다운로드 | `./gradlew build` (의존성 다운로드 단계) |
| **앱 실행** | `npm run dev` | 개발 서버 실행 (기본 포트: 5173) | `./gradlew bootRun` |
| **빌드** | `npm run build` | 배포용 정적 파일(HTML/JS) 생성 | `./gradlew build` (jar 생성) |

---

## 3. 코드 구조 이해 (Project Structure)

백엔드 개발자의 시선에서 본 주요 폴더와 파일의 역할입니다.

- **`index.html`**: 앱의 뼈대가 되는 유일한 HTML 파일입니다. 모든 React 화면은 이 파일의 `<div id="root"></div>` 안에 동적으로 그려집니다.
- **`src/main.tsx`**: Java의 `public static void main`과 같습니다. 앱이 시작되는 진입점입니다.
- **`src/App.tsx`**: 전체 앱의 레이아웃과 **라우팅(URL 경로 설정)**을 담당합니다. Spring의 `Interceptor`나 `SecurityConfig`와 유사한 역할을 수행합니다.
- **`src/pages/`**: 실제 화면 하나하나를 담당하는 컴포넌트들입니다. Spring의 **Controller + View** 역할을 합쳐놓은 것과 비슷합니다.
- **`src/types/`**: 데이터 모델을 정의하는 곳입니다. Java의 **DTO(record/class)**와 1:1로 대응됩니다.
- **`package.json`**: 프로젝트 설정 및 라이브러리 관리 파일입니다. Gradle의 **`build.gradle`**과 같은 역할을 합니다.

---

## 4. 코드 수정 팁

- 화면은 **TSX (TypeScript + XML)** 형식을 사용합니다. 
- HTML 태그를 그대로 사용할 수 있어 백엔드 개발자도 쉽게 수정할 수 있습니다. 
- 예: `<div>`, `<h1>`, `<button>` 등
- 수정 후 파일을 저장하면 화면에 **실시간으로 반영(Hot Reload)**됩니다.

## 5. 백엔드 API 연동

현재 앱은 `http://localhost:8080` (백엔드 기본 포트)와 통신하도록 설계될 예정입니다. 백엔드 서버가 켜져 있어야 실제 데이터를 볼 수 있습니다.
