package dev.danielk.orderservice.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * JPA Auditing 활성화
 *
 * @EnableJpaAuditing이 있어야 @CreatedDate / @LastModifiedDate 어노테이션이 동작한다.
 * SpringBootApplication 클래스에 함께 두면 @WebMvcTest 슬라이스 테스트에서도 로드되어
 * JpaAuditingHandler를 못 찾는 에러가 발생하므로 별도 @Configuration 클래스로 분리한다.
 */
@Configuration
@EnableJpaAuditing
public class JpaConfig {
}
