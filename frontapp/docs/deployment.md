# 프론트엔드 배포 가이드 (GitHub Pages)

이 문서는 GitHub Actions를 사용하여 `frontapp`을 GitHub Pages에 자동으로 배포하는 방법을 설명합니다.

## 1. 배포 원리 및 주소
- **Vite** 빌드 도구를 사용하여 프로젝트를 정적 파일(HTML, JS, CSS)로 변환합니다.
- **GitHub Actions**가 `master` 브랜치에 푸시될 때마다 빌드를 수행하고 배포합니다.
- **배포 주소**: [https://danielk0121.github.io/study-start-java17/](https://danielk0121.github.io/study-start-java17/)

## 2. 사전 설정 사항 (필수)

### 2.1. Vite Base 경로 설정
GitHub Pages는 저장소 경로 하위에 배포되므로 `vite.config.ts` 파일에 `base` 설정이 필요합니다.

```typescript
// frontapp/vite.config.ts
export default defineConfig({
  base: '/study-start-java17/', 
  // ...
})
```

### 2.2. GitHub 저장소 권한 설정
저장소의 **Settings > Pages** 메뉴에서 반드시 아래 설정을 변경해야 합니다.
- **Build and deployment > Source**: **`GitHub Actions`**로 선택 (기본값인 `Deploy from a branch`에서 변경 필수)

## 3. 자동 배포 설정 (CI/CD)
`.github/workflows/deploy-frontapp.yml` 파일이 배포를 담당합니다.

## 4. 트러블슈팅
### HttpError: Not Found 발생 시
- 위 2.2번의 `Source` 설정이 `GitHub Actions`로 되어 있는지 확인하세요. 설정이 안 되어 있으면 Actions에서 배포 대상을 찾지 못해 에러가 발생합니다.

### 배포 후 화면이 하얗게 나올 때 (404)
- `vite.config.ts`의 `base` 경로가 저장소 이름과 정확히 일치하는지 확인하세요.
