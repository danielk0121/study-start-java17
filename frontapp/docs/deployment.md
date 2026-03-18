# 프론트엔드 배포 가이드 (GitHub Pages)

이 문서는 GitHub Actions를 사용하여 `frontapp`을 GitHub Pages에 자동으로 배포하는 방법을 설명합니다.

## 1. 배포 원리
- **Vite** 빌드 도구를 사용하여 프로젝트를 정적 파일(HTML, JS, CSS)로 변환합니다.
- **GitHub Actions**가 `master` 브랜치에 푸시될 때마다 빌드를 수행하고, 그 결과물을 `gh-pages` 브랜치 또는 GitHub Pages 서비스에 업로드합니다.

## 2. 사전 설정 사항

### 2.1. Vite Base 경로 설정
GitHub Pages는 보통 `https://<유저명>.github.io/<저장소명>/` 경로로 배포됩니다. 따라서 `vite.config.ts` 파일에 `base` 설정을 추가해야 합니다.

```typescript
// frontapp/vite.config.ts
export default defineConfig({
  base: '/study-start-java17/', // 저장소 이름을 입력
  // ...
})
```

### 2.2. GitHub 저장소 권한
저장소의 **Settings > Pages** 메뉴에서:
- **Build and deployment > Source**를 `GitHub Actions`로 설정하세요.

## 3. 자동 배포 설정 (CI/CD)
`.github/workflows/deploy-frontapp.yml` 파일이 배포를 담당합니다. 이 파일은 다음 과정을 수행합니다:
1. 소스코드 체크아웃
2. Node.js 환경 구축
3. 의존성 설치 (`npm install`)
4. 빌드 수행 (`npm run build`)
5. 빌드 결과물(`dist` 폴더) 배포

## 4. 로컬에서 배포 테스트
수동으로 배포를 테스트하고 싶다면 아래 명령어를 사용하세요.
```bash
cd frontapp
npm run build
# dist 폴더의 내용을 서버에 올리면 됩니다.
```
