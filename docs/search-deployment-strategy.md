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

소규모 DB 기준 (상품 100만건, 사용자 10만건, 주문 10만건):
```
전체 DB 용량: 약 1.5~2GB
mysqldump 압축 후: 약 300~500MB
덤프 실행 시간: 약 2~5분
```

---

## 6. 확장 시나리오

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
