# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 언어 규칙

코드 관례(주석, 커밋 메시지, 변수명 등)를 제외한 모든 응답과 문서는 한글을 사용한다.

## 프로젝트 개요

Spring Boot 2.7.18 기반 Java 17 기능 탐구 프로젝트. 주요 목표:
- Lombok 제거 → Java 17 `record`로 대체 (`@Data`/`@Value`, 생성자, 빌더)
- MapStruct 통합
- QueryDSL 통합
- Java 17 스타일 테스트 패턴 적용

## 명령어

```bash
./gradlew build        # 빌드
./gradlew test         # 전체 테스트 실행
./gradlew bootRun      # 애플리케이션 실행
./gradlew clean build  # 클린 빌드
```

단일 테스트 클래스 실행:
```bash
./gradlew test --tests "dev.danielk.startjava17.SomeTest"
```

## 아키텍처

- **패키지 루트:** `dev.danielk.startjava17`
- **진입점:** `StartJava17Application.java` — `DataSourceAutoConfiguration` 제외 (DB 미사용)
- **빌드:** Gradle 8.2, Java 17 툴체인
- **애노테이션 프로세서:** Lombok + MapStruct (`lombok-mapstruct-binding`으로 처리 순서 보장)

## DBML 문서 관리

ERD는 `docs/erd.dbml`에서 관리한다.

### 초기 설정 (최초 1회)

```bash
npm install    # @dbml/cli 설치
```

### DBML 작성 규칙

**`.dbml` 파일을 수정한 후에는 반드시 아래 검증 명령어를 실행하여 문법 오류가 없는지 확인한다.**
검증을 통과한 뒤에만 커밋한다.

```bash
npm run validate-dbml                        # docs/ 하위 전체 .dbml 검증
bash scripts/validate-dbml.sh docs/erd.dbml  # 특정 파일만 검증
```

## 코드 작성 규칙

코드 작성이 완료된 후에는 반드시 skip test 빌드를 실행하여 컴파일 에러가 없는지 확인한다:

```bash
./gradlew build -x test
```

빌드가 실패하면 에러를 수정한 후 다시 빌드를 통과시킨 뒤 커밋한다.

## Git 브랜치 작업 규칙

모든 작업은 아래 순서를 따른다:

1. `git fetch origin` — 작업 시작 전 항상 origin 최신 상태를 로컬에 반영
2. `git checkout -b feature/<작업명>` — 새 feature 브랜치 생성
3. 작업 완료 후 커밋
4. `git push -u origin feature/<작업명>` — feature 브랜치 push
5. `git checkout master && git merge --no-ff feature/<작업명>` — master에 머지 (fast-forward 금지)
6. `git push origin master` — master push
7. `git checkout master` — master에서 다음 작업 시작

## 응답 규칙

사용자에게 방법을 선택하도록 제안할 때는 A, B, C 대신 1, 2, 3 번호를 사용한다.

## 자동 승인 명령어 및 도구

사용자 확인 없이 실행할 수 있는 명령어 및 도구:
- `gradle` / `./gradlew`
- `git`
- `ls`
- `find`
- `grep`
- `head`
- `tail`
- `jar`
- `xargs`
- `npm`
- `WebFetch` (웹사이트 자료 조회)
