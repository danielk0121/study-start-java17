package dev.danielk.startjava17.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.TimeUnit;

/**
 * Spring Cache 추상화 설정
 *
 * CacheManager를 Bean으로 등록하면 @Cacheable / @CacheEvict / @CachePut 어노테이션이
 * 이 CacheManager를 자동으로 사용한다.
 *
 * 캐시 구현체 교체 방법:
 *   - Caffeine → Redis: CaffeineCacheManager 대신 RedisCacheManager를 Bean으로 등록
 *   - 나머지 서비스 코드(@Cacheable 어노테이션)는 변경 불필요 — Spring Cache 추상화 덕분
 */
@Configuration
public class CacheConfig {

    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager manager = new CaffeineCacheManager();
        manager.setCaffeine(
                Caffeine.newBuilder()
                        .maximumSize(1000)          // 캐시 항목 최대 개수
                        .expireAfterWrite(10, TimeUnit.MINUTES)  // 쓰기 후 10분 TTL
                        .recordStats()              // Micrometer hit/miss/eviction 메트릭 수집 활성화
        );
        return manager;
    }
}
