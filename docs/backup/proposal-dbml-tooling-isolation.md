# 제안: DBML 툴링을 하위 디렉토리로 격리

## 문제

현재 DBML 검증을 위한 Node/npm 관련 파일들이 Java 프로젝트 루트에 위치해 있어 어색하다.

```
프로젝트 루트/
├── node_modules/       ← Java 프로젝트와 무관한 JS 의존성
├── package.json        ← Node 프로젝트 설정
├── package-lock.json   ← Node 잠금 파일
└── scripts/
    └── validate-dbml.sh
```

## 제안: `tools/dbml/`로 격리

Node/npm 관련 파일 전체를 `tools/dbml/` 하위로 이동한다.

### 목표 디렉토리 구조

```
프로젝트 루트/
└── tools/
    └── dbml/
        ├── package.json
        ├── package-lock.json
        ├── node_modules/        ← .gitignore 처리
        └── validate.sh          ← 기존 scripts/validate-dbml.sh 이동
```

### 변경 작업 목록

1. `tools/dbml/` 디렉토리 생성
2. `package.json`, `package-lock.json` → `tools/dbml/`로 이동
3. `scripts/validate-dbml.sh` → `tools/dbml/validate.sh`로 이동
   - 스크립트 내 경로 변수(`REPO_ROOT`, `DBML_CLI`) 수정 필요
4. `package.json`의 `validate-dbml` 스크립트 경로 수정
5. `.gitignore` 수정: `node_modules/` → `tools/dbml/node_modules/`
6. `CLAUDE.md` 및 `README.md`의 명령어 경로 수정

### 수정 후 사용법

```bash
# 초기 설치 (최초 1회)
cd tools/dbml && npm install

# 검증 실행 (프로젝트 루트에서)
bash tools/dbml/validate.sh                   # docs/ 전체 .dbml 검증
bash tools/dbml/validate.sh docs/erd.dbml     # 특정 파일만 검증
```

또는 npm script로 실행:

```bash
cd tools/dbml && npm run validate-dbml
```

### 기대 효과

- 프로젝트 루트가 Java/Gradle 파일만 남아 구조가 명확해진다.
- `scripts/` 디렉토리가 비워지면 함께 제거 가능하다.
- `.gitignore`의 `node_modules/` 패턴도 범위가 명확해진다.

## 참고: Docker 기반 대안

로컬에 Node를 설치하지 않으려면 `@dbml/cli`를 Docker로 실행하는 방법도 있다.

```bash
docker run --rm -v "$(pwd)/docs:/docs" ghcr.io/holistics/dbml-cli:latest dbml2sql /docs/erd.dbml --db mysql
```

단, `@dbml/cli` 공식 Docker 이미지가 없어 별도 `Dockerfile` 관리가 필요하므로
현재 프로젝트 규모에서는 `tools/dbml/` 격리 방식이 더 간단하다.
