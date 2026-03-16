package dev.danielk.startjava17.stream;

import org.junit.jupiter.api.*;
import org.junit.jupiter.api.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Range;
import org.springframework.data.redis.connection.stream.*;
import org.springframework.data.redis.core.StringRedisTemplate;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * =====================================================================
 * [Docker 통합 테스트] 실제 Redis를 사용한 Redis Streams 학습 예제
 * =====================================================================
 *
 * - 실행 전 Docker Redis가 localhost:6379에 기동되어 있어야 합니다.
 *   $ docker run -d -p 6379:6379 redis:7
 *
 * - Spring Boot 컨텍스트를 완전히 로드하므로 application.properties의
 *   설정값과 Bean 연결을 실제 환경에서 검증할 수 있습니다.
 *
 * - 실행 방법: ./gradlew test --tests "*.RedisStreamsIntegrationTest"
 *
 * Mock 테스트(RedisStreamsMockTest)와의 차이:
 *   - Mock: 임베디드 Redis (Docker 불필요, 빠름, CI 환경 적합)
 *   - 통합:  실제 Redis   (Docker 필요, 운영 환경과 동일, 검증 목적)
 *
 * Redis Streams 핵심 명령어 대응표:
 *   XADD       → opsForStream().add()
 *   XGROUP     → opsForStream().createGroup()
 *   XREADGROUP → opsForStream().read(Consumer, ...)
 *   XACK       → opsForStream().acknowledge()
 *   XLEN       → opsForStream().size()
 *   XPENDING   → opsForStream().pending()
 */
@Tag("docker-redis")
@SpringBootTest
class RedisStreamsIntegrationTest {

    // 테스트 전용 스트림/그룹 — 운영 스트림(application.properties)과 분리
    private static final String STREAM   = "it:order-stream";
    private static final String GROUP    = "it:order-group";
    private static final String CONSUMER = "it-consumer-1";

    @Autowired
    StringRedisTemplate redisTemplate;

    @BeforeEach
    void cleanStream() {
        redisTemplate.delete(STREAM);
    }

    @AfterEach
    void tearDown() {
        redisTemplate.delete(STREAM);
    }

    // -----------------------------------------------------------------------
    // STEP 1. 스트림에 메시지 발행 (XADD)
    // -----------------------------------------------------------------------

    @Test
    @DisplayName("[통합] STEP 1 - XADD: 메시지를 발행하면 타임스탬프 기반 RecordId가 반환된다")
    void step1_xadd() {
        // XADD it:order-stream * orderId order-001 product MacBook quantity 1
        RecordId recordId = redisTemplate.opsForStream().add(
                MapRecord.create(STREAM, Map.of(
                        "orderId",  "order-001",
                        "product",  "MacBook",
                        "quantity", "1"
                ))
        );

        // RecordId 형식: "밀리초타임스탬프-시퀀스번호" (예: 1700000000000-0)
        assertThat(recordId).isNotNull();
        assertThat(recordId.getValue()).matches("\\d+-\\d+");

        // XLEN: 스트림에 쌓인 메시지 수 확인
        assertThat(redisTemplate.opsForStream().size(STREAM)).isEqualTo(1);

        System.out.println("[통합 STEP 1] 발행 RecordId: " + recordId);
    }

    // -----------------------------------------------------------------------
    // STEP 2. 컨슈머 그룹 생성 (XGROUP CREATE)
    // -----------------------------------------------------------------------

    @Test
    @DisplayName("[통합] STEP 2 - XGROUP CREATE: 컨슈머 그룹을 생성할 수 있다")
    void step2_createGroup() {
        // 스트림이 없으면 그룹 생성 불가 → 더미 메시지 먼저 추가
        redisTemplate.opsForStream().add(
                MapRecord.create(STREAM, Map.of("orderId", "order-001", "product", "MacBook"))
        );

        // ReadOffset.from("0") → 스트림의 처음 메시지부터 소비하겠다는 의미
        // ReadOffset.latest() → 그룹 생성 이후 새로 들어오는 메시지만 소비
        redisTemplate.opsForStream().createGroup(STREAM, ReadOffset.from("0"), GROUP);

        // XINFO GROUPS: 그룹 생성 확인
        var groups = redisTemplate.opsForStream().groups(STREAM);
        assertThat(groups.size()).isEqualTo(1);
        assertThat(groups.get(0).groupName()).isEqualTo(GROUP);

        System.out.println("[통합 STEP 2] 그룹명: "    + groups.get(0).groupName()
                + " | 컨슈머 수: "    + groups.get(0).consumerCount()
                + " | 미처리 메시지: " + groups.get(0).pendingCount());
    }

    // -----------------------------------------------------------------------
    // STEP 3. 컨슈머 그룹으로 메시지 소비 (XREADGROUP)
    // -----------------------------------------------------------------------

    @Test
    @DisplayName("[통합] STEP 3 - XREADGROUP: 소비한 메시지는 PEL(미처리 목록)에 등록된다")
    void step3_xreadgroup() {
        // 준비: 스트림 + 그룹 + 메시지 3건
        redisTemplate.opsForStream().createGroup(STREAM, ReadOffset.from("0"), GROUP);
        redisTemplate.opsForStream().add(MapRecord.create(STREAM, Map.of("orderId", "order-001", "product", "MacBook")));
        redisTemplate.opsForStream().add(MapRecord.create(STREAM, Map.of("orderId", "order-002", "product", "iPad")));
        redisTemplate.opsForStream().add(MapRecord.create(STREAM, Map.of("orderId", "order-003", "product", "iPhone")));

        // XREADGROUP GROUP it:order-group it-consumer-1 COUNT 10 STREAMS it:order-stream >
        // ReadOffset.lastConsumed() = ">" : 이 컨슈머가 아직 읽지 않은 새 메시지만 가져옴
        List<MapRecord<String, Object, Object>> records = redisTemplate.opsForStream().read(
                Consumer.from(GROUP, CONSUMER),
                StreamReadOptions.empty().count(10),
                StreamOffset.create(STREAM, ReadOffset.lastConsumed())
        );

        assertThat(records).hasSize(3);

        // XREADGROUP 이후 ACK 전: 메시지가 PEL에 등록됨 (처리 중 상태)
        // 카프카에서 poll()은 했지만 commitOffset()을 아직 하지 않은 상태와 동일
        PendingMessages pending = redisTemplate.opsForStream()
                .pending(STREAM, Consumer.from(GROUP, CONSUMER), Range.unbounded(), 10);
        assertThat(pending.size()).isEqualTo(3);

        records.forEach(r -> System.out.println("[통합 STEP 3] 수신 | id=" + r.getId() + " | " + r.getValue()));
        System.out.println("[통합 STEP 3] PEL 크기 (ACK 대기 중): " + pending.size());
    }

    // -----------------------------------------------------------------------
    // STEP 4. ACK — 처리 완료 확인 (XACK)
    // -----------------------------------------------------------------------

    @Test
    @DisplayName("[통합] STEP 4 - XACK: ACK 후 PEL에서 메시지가 제거된다")
    void step4_xack() {
        // 준비
        redisTemplate.opsForStream().createGroup(STREAM, ReadOffset.from("0"), GROUP);
        redisTemplate.opsForStream().add(MapRecord.create(STREAM, Map.of("orderId", "order-001", "product", "MacBook")));
        redisTemplate.opsForStream().add(MapRecord.create(STREAM, Map.of("orderId", "order-002", "product", "iPad")));

        List<MapRecord<String, Object, Object>> records = redisTemplate.opsForStream().read(
                Consumer.from(GROUP, CONSUMER),
                StreamReadOptions.empty().count(10),
                StreamOffset.create(STREAM, ReadOffset.lastConsumed())
        );

        // ACK 전 PEL: 2건
        long beforeAck = redisTemplate.opsForStream()
                .pending(STREAM, Consumer.from(GROUP, CONSUMER), Range.unbounded(), 10).size();
        assertThat(beforeAck).isEqualTo(2);

        // XACK: 첫 번째 메시지만 처리 완료 확인
        redisTemplate.opsForStream().acknowledge(STREAM, GROUP, records.get(0).getId());

        // ACK 후 PEL: 1건만 남음
        long afterAck = redisTemplate.opsForStream()
                .pending(STREAM, Consumer.from(GROUP, CONSUMER), Range.unbounded(), 10).size();
        assertThat(afterAck).isEqualTo(1);

        System.out.println("[통합 STEP 4] ACK 전 PEL: " + beforeAck + " → ACK 후 PEL: " + afterAck);
    }

    // -----------------------------------------------------------------------
    // STEP 5. 전체 흐름 통합 — 생성 → 발행 → 소비 → ACK
    // -----------------------------------------------------------------------

    @Test
    @DisplayName("[통합] STEP 5 - [전체 흐름] 스트림 생성 → 발행 → 컨슈머 그룹 소비 → ACK")
    void step5_fullFlow() {
        // 1단계: 컨슈머 그룹 생성
        redisTemplate.opsForStream().createGroup(STREAM, ReadOffset.from("0"), GROUP);
        System.out.println("[통합 STEP 5] 1. 컨슈머 그룹 생성 완료: " + GROUP);

        // 2단계: 메시지 3건 발행 (XADD)
        var orders = List.of(
                OrderEvent.of("order-A", "MacBook Pro", 1),
                OrderEvent.of("order-B", "iPad Air",   2),
                OrderEvent.of("order-C", "iPhone 15",  3)
        );
        for (var order : orders) {
            RecordId id = redisTemplate.opsForStream().add(
                    MapRecord.create(STREAM, Map.of(
                            "orderId",  order.orderId(),
                            "product",  order.product(),
                            "quantity", String.valueOf(order.quantity())
                    ))
            );
            System.out.printf("[통합 STEP 5] 2. 발행 | id=%-25s | %s x%d%n",
                    id, order.product(), order.quantity());
        }
        assertThat(redisTemplate.opsForStream().size(STREAM)).isEqualTo(3);

        // 3단계: 컨슈머 그룹으로 소비 (XREADGROUP)
        List<MapRecord<String, Object, Object>> consumed = redisTemplate.opsForStream().read(
                Consumer.from(GROUP, CONSUMER),
                StreamReadOptions.empty().count(10),
                StreamOffset.create(STREAM, ReadOffset.lastConsumed())
        );
        assertThat(consumed).hasSize(3);
        consumed.forEach(r -> System.out.printf("[통합 STEP 5] 3. 소비 | id=%-25s | %s%n",
                r.getId(), r.getValue()));

        // 소비 후 PEL 확인
        long pendingBefore = redisTemplate.opsForStream()
                .pending(STREAM, Consumer.from(GROUP, CONSUMER), Range.unbounded(), 10).size();
        assertThat(pendingBefore).isEqualTo(3);
        System.out.println("[통합 STEP 5] 4. ACK 대기(PEL): " + pendingBefore + "건");

        // 4단계: 전체 ACK (XACK)
        RecordId[] ids = consumed.stream().map(MapRecord::getId).toArray(RecordId[]::new);
        redisTemplate.opsForStream().acknowledge(STREAM, GROUP, ids);

        long pendingAfter = redisTemplate.opsForStream()
                .pending(STREAM, Consumer.from(GROUP, CONSUMER), Range.unbounded(), 10).size();
        assertThat(pendingAfter).isEqualTo(0);
        System.out.println("[통합 STEP 5] 5. ACK 완료 → PEL: " + pendingAfter + "건");

        // ACK 후에도 스트림 메시지는 삭제되지 않음
        assertThat(redisTemplate.opsForStream().size(STREAM)).isEqualTo(3);
        System.out.println("[통합 STEP 5] 6. 스트림 보존 메시지: "
                + redisTemplate.opsForStream().size(STREAM) + "건 (ACK 후에도 유지됨)");
    }
}
