# 연구조사: 월 $50 이하 소규모 MSA 배포 운영 전략

> 소규모 트래픽, 소자본 서비스를 기준으로 AWS Lightsail 단일 인스턴스에서
> MSA 구조를 운영하는 현실적인 전략을 정리한다.

---

## 1. 배포 구성

```
Lightsail $40 (4vCPU, 16GB) 1대
├── k3s 컨트롤 플레인     ~500MB RAM
├── member-service        ~512MB RAM
├── order-service         ~512MB RAM
├── bff                   ~512MB RAM
├── auth-service          ~512MB RAM
├── Redis (컨테이너)       ~100MB RAM
├── MySQL 8 (컨테이너)    ~300~500MB RAM
├── Prometheus            ~200~300MB RAM
├── Grafana               ~200MB RAM
└── CloudWatch Agent      ~50MB RAM
                          ──────────────
합계                      ~4~4.5GB RAM / 여유 ~11.5GB

CloudWatch 로그: ~$5/월

총합: 약 $45/월 (한화 약 6.5만원)
```

RDS, ElastiCache 같은 AWS 관리형 서비스를 사용하지 않는 이유:
Lightsail은 AWS VPC와 네트워크가 분리되어 있어서 RDS, ElastiCache와 직접 연결이 안 된다. 피어링 설정이 가능하지만 추가 비용과 복잡도가 생긴다. 관리형 서비스가 필요해지는 시점에 EC2로 전환하는 게 맞다.

---

## 2. 오케스트레이션 — k3s 선택 이유

| 선택지 | 판단 | 이유 |
|---|---|---|
| Docker Compose | 인스턴스 장애 시 자동 복구 불가 | 컨테이너 재시작은 되지만 인스턴스 자체 장애엔 무력 |
| Docker Swarm | 소규모에서 이점 없음 | 관리 안 되는 프로젝트, 인스턴스 장애 원인이 같으면 2대도 똑같이 죽음 |
| k3s | **선택** | kubectl 문법 = k8s 그대로, 경량 (500MB), Apache 2.0 라이선스 |
| k8s (EKS) | 오버엔지니어링 | EKS 자체 비용 $70/월 추가 |

k3s는 k8s의 경량판으로 Rancher(현 SUSE)가 만들었다. 바이너리 1개, 설치 명령어 1줄로 끝난다.

```bash
# 서버 설치
curl -sfL https://get.k3s.io | sh -

# 로컬 Mac (k3d 사용)
brew install k3d
k3d cluster create mycluster
```

로컬은 k3d(Docker Desktop 위에서 k3s를 컨테이너로 띄움), 서버는 k3s 직접 설치. YAML 파일이 동일하게 동작한다.

---

## 3. 이중화를 하지 않는 이유

소규모 서비스에서 서버가 죽는 원인:
```
OOM (메모리 부족)       → 2대로 이중화해도 똑같이 죽음
애플리케이션 버그        → 2대 다 똑같이 죽음
디스크 꽉 참            → 2대 다 똑같이 죽음
AWS 데이터센터 장애      → AZ 분리로 해결하지만 소규모에선 과도함
```

이중화는 "잠깐의 다운타임도 매출에 직결"되는 규모가 됐을 때 고려한다.
그 전까지는 Prometheus + Grafana 알람으로 장애를 빠르게 감지하고 원인을 파악해서 재발을 막는 게 현실적이다.

---

## 4. 로깅/모니터링 전략

| 도구 | 용도 | 선택 이유 |
|---|---|---|
| Prometheus + Grafana | 메트릭 모니터링 (CPU, 메모리, JVM) | 경량, 자체 운영 가능 |
| CloudWatch | 로그 디버깅 | 설정 없음, traceId/userId 검색 가능, 소규모 월 $5 수준 |
| ELK / Loki | 미사용 | 대용량 + 고사양 필요, 독립적 가치 구간이 좁음 |
| APM (Pinpoint) | 추후 도입 | 트래픽이 충분히 커지면 그때 도입 |

ELK/Loki가 독립적으로 의미 있는 구간:
"CloudWatch는 비싸고 APM은 아직 이른" 중간 어딘가인데, 대부분의 서비스는 그 구간을 짧게 지나가거나 건너뛴다.

---

## 5. MySQL 백업 전략

RDS 없이 컨테이너 MySQL을 운영하는 경우 k3s CronJob으로 백업한다.

```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: mysql-backup
spec:
  schedule: "0 * * * *"  # 매시 정각
  jobTemplate:
    spec:
      template:
        spec:
          containers:
          - name: backup
            image: mysql:8
            command:
            - /bin/sh
            - -c
            - |
              mysqldump --single-transaction -h mysql -u root -p$MYSQL_ROOT_PASSWORD \
                --all-databases | gzip | aws s3 cp - s3://버킷명/backup-$(date +%Y%m%d-%H%M).sql.gz
```

- `--single-transaction`: InnoDB MVCC를 활용해 잠금 없이 덤프. 덤프 중 INSERT/UPDATE 정상 동작
- 매시 정각 실행 → 최대 데이터 손실 59분
- 7일치 보관 기준 S3 비용 월 $2 수준
- 결제 데이터 손실 시 PG사 내역으로 수동 보정 가능

---

## 6. DB 용량 추정 (상품 100만건, 사용자 10만건, 주문 10만건)

```
상품 테이블 100만건
├── id, name, price, stock, category, description, createdAt...
└── 100만 × 500 bytes = 약 500MB
    인덱스 포함 → 약 1~1.5GB

사용자 테이블 10만건
├── id, email, password, name, phone, address, createdAt...
└── 10만 × 300 bytes = 약 30MB
    인덱스 포함 → 약 50~100MB

주문 테이블 10만건
├── id, memberId, productId, quantity, status, totalPrice, createdAt...
└── 10만 × 200 bytes = 약 20MB
    인덱스 포함 → 약 50MB

order_events 테이블 (주문당 3~5개 이벤트)
└── 30~50만건 × 500 bytes = 약 150~250MB

전체 합계: 약 1.5~2GB
mysqldump 압축 후: 약 300~500MB
```

S3 백업 비용 (1시간마다, 7일 보관):
```
500MB × 24회 × 7일 = 84GB → 약 $2/월
```

Lightsail 160GB SSD 안에 충분히 들어가는 용량이다.

---

## 7. Lightsail vs EC2

```
EC2:
- 초 단위 과금
- 보안그룹, VPC, IAM 등 세밀한 설정 필요
- RDS, ElastiCache 등 AWS 관리형 서비스와 VPC 내에서 직접 연결 가능
- 고급 AWS 서비스 연동 자유로움

Lightsail:
- 월정액 고정 ($40 = 4vCPU, 16GB, 160GB SSD)
- 방화벽, 고정IP, DNS 등 기본적인 것만 제공, 설정 단순
- AWS VPC와 네트워크가 분리되어 있어서 RDS, ElastiCache 직접 연결 안 됨
  → 피어링 설정으로 연결 가능하지만 추가 비용과 복잡도 발생
- S3는 연결 가능 — S3는 VPC 리소스가 아니라 인터넷 엔드포인트라서 어디서든 HTTPS로 접근 가능
- 내부적으로는 EC2 기반
- Lightsail 인스턴스를 EC2로 내보내는 기능 제공 (마이그레이션 가능)
```

비용 비교:
```
EC2 t3.small × 10인스턴스: 약 $166/월
Lightsail $40 단일 인스턴스: $40/월
```

Lightsail을 선택하는 기준: RDS, ElastiCache 없이 전부 컨테이너로 자체 운영하는 경우.
EC2로 전환하는 기준: RDS나 ElastiCache 같은 AWS 관리형 서비스가 필요해지는 시점.

---

## 8. 로컬 k3s 테스트 환경 (Mac)

minikube 대신 k3d를 쓰는 이유:
- minikube: 로컬 학습 전용, 재시작 시 클러스터 상태 초기화, 실제 서버 운영 불가
- k3d: Docker Desktop 위에서 k3s를 컨테이너로 띄움, 서버와 동일한 YAML 사용 가능

```bash
# 사전 조건: Docker Desktop 실행 중

# k3d 설치
brew install k3d

# 클러스터 생성
k3d cluster create mycluster

# kubectl 바로 사용 가능
kubectl get nodes
```

Mac에서 Docker Desktop이 내부적으로 Linux VM을 띄우고 그 안에서 Docker가 돌아가는 구조라서 k3d도 그 안에서 동작한다. 로컬에서 작성한 YAML 파일을 서버 k3s에 그대로 적용할 수 있다.

---

## 9. 오케스트레이션 선택 과정

```
1. Docker Swarm 검토
   → 여러 인스턴스를 묶어서 노드 장애 시 자동 복구
   → 문제: 소규모에서 서버가 죽는 원인(OOM, 버그)이 같으면 2대도 똑같이 죽음
   → 문제: Docker가 k8s에 밀려 사실상 관리 안 되는 프로젝트
   → 탈락

2. Docker Compose 검토
   → restart: always로 컨테이너 개별 자동 재시작
   → 문제: 인스턴스 자체가 죽으면 Docker도 죽어서 자동 복구 불가
   → 인스턴스 1대 단일 운영에서는 충분하지만 오케스트레이션 기능 없음
   → 보류

3. Nomad 검토
   → k8s보다 단순, Docker/JAR/바이너리 직접 실행 가능
   → 문제: HashiCorp BSL 라이선스 변경 (2023년) — 실사용 제약은 없지만 커뮤니티 분위기 나빠짐
   → 문제: 인지도 낮아서 레퍼런스 부족, k8s 지식이 이전 안 됨
   → 탈락

4. k3s 선택
   → k8s 경량판 (컨트롤 플레인 ~500MB), 바이너리 1개, 설치 1줄
   → kubectl 문법 100% 동일 → k8s 학습 그대로 적용, EKS 전환 시 재사용 가능
   → Apache 2.0 라이선스 (완전 오픈소스)
   → 로컬: k3d (Docker Desktop 위), 서버: k3s 직접 설치, YAML 동일
   → 선택
```

---

## 10. 확장 시나리오

```
1단계: 현재 구성 ($45/월)
       Lightsail $40 단일 인스턴스 + k3s + MySQL 컨테이너

2단계: 트래픽 증가
       Lightsail $40 → $80 스펙업 (4vCPU, 16GB → 8vCPU, 32GB)

3단계: DB 부담 증가
       MySQL 컨테이너 → RDS 분리
       Lightsail → EC2 전환 (VPC 내에서 RDS 연결)

4단계: 서비스 규모 커짐
       EC2 + EKS (k3s → 풀 k8s)
       이중화, 오토스케일링 도입
```

각 단계마다 전면 재설계 없이 스펙업 또는 서비스 분리만 하면 된다.

---

## 11. CDN — CloudFront vs Cloudflare

CloudFront는 VPC 리소스가 아니라 엣지 네트워크 서비스라서 Lightsail에서도 연동 가능하다. Lightsail 고정 IP를 CloudFront 오리진으로 설정하면 된다.

```
클라이언트 → CloudFront → Lightsail 인스턴스
```

| 항목 | CloudFront | Cloudflare |
|---|---|---|
| 비용 | 트래픽 과금 (소규모는 프리티어 커버) | 무료 플랜이 강력 (트래픽 비용 없음) |
| HTTPS | ACM 무료 인증서 | 무료 |
| DDoS 방어 | AWS Shield Standard 기본 포함 | 무료 플랜에 기본 포함 |
| WAF | 유료 | 무료 플랜에 기본 포함 |
| DNS 관리 | Route 53 별도 | 한 곳에서 통합 관리 |
| AWS 연동 | S3, ALB, Lambda@Edge 등 긴밀한 연동 | 해당 없음 |
| 엣지 컴퓨팅 | Lambda@Edge | Cloudflare Workers |

Lightsail 단일 인스턴스에서 비용 최소화가 목표라면 Cloudflare 무료 플랜이 현실적이다. CloudFront는 S3, ALB, Lambda@Edge 등 AWS 생태계를 깊게 쓸수록 가치가 올라간다.

---

## 12. Cloudflare 무료 플랜 심화 — R2 vs S3

### CloudFront 아웃바운드 과금 구조

CloudFront를 쓴다고 아웃바운드가 무료가 되는 게 아니다.

```
S3 → CloudFront         : 무료 (AWS 내부 전송, 오리진 fetch)
CloudFront → 클라이언트 : 유료 (아웃바운드 과금)
```

S3에서 CloudFront로 데이터를 가져오는 오리진 fetch는 무료지만, CloudFront에서 최종 클라이언트로 나가는 아웃바운드는 트래픽 과금이 발생한다.

### R2 vs S3

Cloudflare R2는 전송료(Egress Fee) 철폐를 목표로 출시된 S3 호환 오브젝트 스토리지다.

| 항목 | S3 + CloudFront | Cloudflare R2 |
|---|---|---|
| 아웃바운드 비용 | CloudFront → 클라이언트 구간 과금 | 무료 (무제한) |
| 스토리지 무료 티어 | 5GB/월 (12개월) | 10GB/월 (영구) |
| 요청 무료 티어 | — | Class A(쓰기) 100만 회, Class B(읽기) 1,000만 회/월 |
| S3 API 호환 | — | 호환 (코드 변경 최소화) |
| AWS 생태계 연동 | Lambda, ECS 등 긴밀한 연동 | 해당 없음 |

### Cloudflare 무료 플랜 조합

```
클라이언트 → Cloudflare CDN → Lightsail   : CDN 캐싱, HTTPS, DDoS, WAF 무료
R2 → 클라이언트                            : 아웃바운드 무료 (스토리지 10GB/월)
```

AWS만 쓸 때는 CloudFront 아웃바운드 비용이 트래픽 늘수록 쌓이는데, Cloudflare로 가면 그 부분이 통째로 0원이 된다.

### R2 무료 티어 용량 추정

1000×1000 JPG 이미지 평균 용량 300KB 기준:

```
10GB = 10,000,000KB
10,000,000KB ÷ 300KB = 약 33,333회/월
                      = 약 1,111회/일
```

월 3만 3천 번 이미지 요청까지 무료 티어 안에 들어온다. 10GB를 초과해도 아웃바운드는 여전히 무료이고 추가 스토리지는 GB당 $0.015다.
