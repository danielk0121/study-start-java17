package dev.danielk.startjava17.stream;

import org.junit.jupiter.api.*;
import org.springframework.data.redis.connection.RedisStandaloneConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.connection.stream.*;
import org.springframework.data.redis.core.StringRedisTemplate;
import redis.embedded.RedisServer;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * =====================================================================
 * [Mock 테스트] 임베디드 Redis를 사용한 Redis Streams 학습 예제
 * =====================================================================
 *
 * - Docker 없이 실행 가능. JVM 프로세스 안에서 실제 Redis 바이너리를 실행함.
 * - 라이브러리: com.github.codemonstur:embedded-redis
 * - 실행 방법: ./gradlew test --tests "*.RedisStreamsMockTest"
 *
 * 테스트 구성:
 *   STEP 1. 스트림 생성 & 프로듀싱 (XADD)
 *   STEP 2. 컨슈머 그룹 생성 (XGROUP CREATE)
 *   STEP 3. 컨슈머 그룹 기반 메시지 소비 (XREADGROUP)
 *   STEP 4. ACK — 처리 완료 확인 (XACK)
 *   STEP 5. 전체 흐름 통합
 *
 * Redis Streams 핵심 명령어 대응표:
 *   XADD       → opsForStream().add()
 *   XGROUP     → opsForStream().createGroup()
 *   XREADGROUP → opsForStream().read(Consumer, ...)
 *   XACK       → opsForStream().acknowledge()
 *   XLEN       → opsForStream().size()
 *   XPENDING   → opsForStream().pending()
 */
class RedisStreamsMockTest {

    private static final int REDIS_PORT  = 16379; // 운영 포트(6379)와 충돌 방지
    private static final String STREAM   = "mock:order-stream";
    private static final String GROUP    = "mock:order-group";
    private static final String CONSUMER = "mock-consumer-1";

    private static RedisServer embeddedRedis;
    private static StringRedisTemplate redisTemplate;
    private static LettuceConnectionFactory connectionFactory;

    // -----------------------------------------------------------------------
    // 클래스 단위 setUp/tearDown — 임베디드 Redis는 테스트 클래스 당 한 번만 기동
    // -----------------------------------------------------------------------

    @BeforeAll
    static void startEmbeddedRedis() throws IOException {
        embeddedRedis = new RedisServer(REDIS_PORT);
        embeddedRedis.start();

        // 임베디드 Redis에 연결할 StringRedisTemplate 직접 생성
        var config = new RedisStandaloneConfiguration("localhost", REDIS_PORT);
        connectionFactory = new LettuceConnectionFactory(config);
        connectionFactory.afterPropertiesSet();

        redisTemplate = new StringRedisTemplate(connectionFactory);
        redisTemplate.afterPropertiesSet();
    }

    @AfterAll
    static void stopEmbeddedRedis() throws IOException {
        connectionFactory.destroy();
        embeddedRedis.stop();
    }

    @BeforeEach
    void cleanStream() {
        // 테스트 간 격리: 스트림 키 삭제
        redisTemplate.delete(STREAM);
    }

    // -----------------------------------------------------------------------
    // STEP 1. 스트림에 메시지 발행 (XADD)
    // -----------------------------------------------------------------------

    @Test
    @DisplayName("[Mock] STEP 1 - XADD: 메시지를 발행하면 타임스탬프 기반 RecordId가 반환된다")
    void step1_xadd() {
        // XADD mock:order-stream * orderId order-001 product MacBook quantity 1
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

        System.out.println("[Mock STEP 1] 발행 RecordId: " + recordId);
    }

    // -----------------------------------------------------------------------
    // STEP 2. 컨슈머 그룹 생성 (XGROUP CREATE)
    // -----------------------------------------------------------------------

    @Test
    @DisplayName("[Mock] STEP 2 - XGROUP CREATE: 컨슈머 그룹을 생성할 수 있다")
    void step2_createGroup() {
        // 그룹 생성 전 스트림에 메시지 1건 추가 (스트림이 없으면 그룹 생성 불가)
        redisTemplate.opsForStream().add(
                MapRecord.create(STREAM, Map.of("orderId", "order-001", "product", "MacBook"))
        );

        // ReadOffset.from("0") → 스트림의 처음 메시지부터 소비하겠다는 의미
        // ReadOffset.latest() → 그룹 생성 이후 새로 들어오는 메시지만 소비
        redisTemplate.opsForStream().createGroup(STREAM, ReadOffset.from("0"), GROUP);

        // XINFO GROUPS: 그룹 생성 확인
        var groups = redisTemplate.opsForStream().groups(STREAM);
        assertThat(groups).hasSize(1);
        assertThat(groups.get(0).groupName()).isEqualTo(GROUP);

        System.out.println("[Mock STEP 2] 그룹명: "   + groups.get(0).groupName()
                + " | 컨슈머 수: "   + groups.get(0).consumerCount()
                + " | 미처리 메시지: " + groups.get(0).pendingCount());
    }

    // -----------------------------------------------------------------------
    // STEP 3. 컨슈머 그룹으로 메시지 소비 (XREADGROUP)
    // -----------------------------------------------------------------------

    @Test
    @DisplayName("[Mock] STEP 3 - XREADGROUP: 소비한 메시지는 PEL(미처리 목록)에 등록된다")
    void step3_xreadgroup() {
        // 준비: 스트림 + 그룹 + 메시지 3건
        redisTemplate.opsForStream().createGroup(STREAM, ReadOffset.from("0"), GROUP);
        redisTemplate.opsForStream().add(MapRecord.create(STREAM, Map.of("orderId", "order-001", "product", "MacBook")));
        redisTemplate.opsForStream().add(MapRecord.create(STREAM, Map.of("orderId", "order-002", "product", "iPad")));
        redisTemplate.opsForStream().add(MapRecord.create(STREAM, Map.of("orderId", "order-003", "product", "iPhone")));

        // XREADGROUP GROUP mock:order-group mock-consumer-1 COUNT 10 STREAMS mock:order-stream >
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

        records.forEach(r -> System.out.println("[Mock STEP 3] 수신 | id=" + r.getId() + " | " + r.getValue()));
        System.out.println("[Mock STEP 3] PEL 크기 (ACK 대기 중): " + pending.size());
    }

    // -----------------------------------------------------------------------
    // STEP 4. ACK — 처리 완료 확인 (XACK)
    // -----------------------------------------------------------------------

    @Test
    @DisplayName("[Mock] STEP 4 - XACK: ACK 후 PEL에서 메시지가 제거된다")
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

        System.out.println("[Mock STEP 4] ACK 전 PEL: " + beforeAck + " → ACK 후 PEL: " + afterAck);
    }

    // -----------------------------------------------------------------------
    // STEP 5. 전체 흐름 통합 — 생성 → 발행 → 소비 → ACK
    // -----------------------------------------------------------------------

    @Test
    @DisplayName("[Mock] STEP 5 - [전체 흐름] 스트림 생성 → 발행 → 컨슈머 그룹 소비 → ACK")
    void step5_fullFlow() {
        // 1단계: 컨슈머 그룹 생성
        //   - 스트림 키가 없으면 MKSTREAM 옵션으로 자동 생성
        //   - Spring Data Redis의 createGroup은 내부적으로 MKSTREAM을 사용하지 않으므로
        //     더미 메시지를 먼저 추가하거나, try-catch로 감싸야 함
        redisTemplate.opsForStream().add(MapRecord.create(STREAM, Map.of("init", "true")));
        redisTemplate.opsForStream().createGroup(STREAM, ReadOffset.from("0"), GROUP);
        System.out.println("[Mock STEP 5] 1. 컨슈머 그룹 생성 완료: " + GROUP);

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
            System.out.printf("[Mock STEP 5] 2. 발행 | id=%-25s | %s x%d%n",
                    id, order.product(), order.quantity());
        }

        // 3단계: 컨슈머 그룹으로 소비 (XREADGROUP) — init 메시지 포함 4건
        List<MapRecord<String, Object, Object>> consumed = redisTemplate.opsForStream().read(
                Consumer.from(GROUP, CONSUMER),
                StreamReadOptions.empty().count(10),
                StreamOffset.create(STREAM, ReadOffset.lastConsumed())
        );
        assertThat(consumed).hasSize(4); // init 1건 + 주문 3건
        consumed.forEach(r -> System.out.printf("[Mock STEP 5] 3. 소비 | id=%-25s | %s%n",
                r.getId(), r.getValue()));

        // 4단계: 전체 ACK (XACK)
        RecordId[] ids = consumed.stream().map(MapRecord::getId).toArray(RecordId[]::new);
        redisTemplate.opsForStream().acknowledge(STREAM, GROUP, ids);

        long pendingAfter = redisTemplate.opsForStream()
                .pending(STREAM, Consumer.from(GROUP, CONSUMER), Range.unbounded(), 10).size();
        assertThat(pendingAfter).isEqualTo(0);
        System.out.println("[Mock STEP 5] 4. ACK 완료 → PEL: " + pendingAfter + "건");

        // ACK 후에도 스트림 메시지는 삭제되지 않음 (카프카 로그 보존과 동일)
        // 삭제: XDEL <id> 또는 XTRIM MAXLEN <count>
        assertThat(redisTemplate.opsForStream().size(STREAM)).isEqualTo(4);
        System.out.println("[Mock STEP 5] 5. 스트림 보존 메시지: "
                + redisTemplate.opsForStream().size(STREAM) + "건 (ACK 후에도 유지됨)");
    }
}
