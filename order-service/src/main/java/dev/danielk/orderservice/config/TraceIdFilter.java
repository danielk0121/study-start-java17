package dev.danielk.orderservice.config;

import org.slf4j.MDC;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

/**
 * 모든 HTTP 응답 헤더에 X-Trace-Id를 추가하는 필터.
 *
 * Sleuth가 MDC에 자동으로 traceId를 주입하므로, 이 필터는
 * MDC에서 값을 읽어 클라이언트가 볼 수 있도록 응답 헤더에 실어줌.
 *
 * 활용 예:
 *   - 클라이언트가 에러 발생 시 X-Trace-Id 값을 지원팀에 전달
 *   - 서버 로그에서 동일한 traceId로 요청 전체 흐름 추적
 */
@Component
public class TraceIdFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        // Sleuth가 MDC에 자동 주입한 traceId를 응답 헤더에 노출
        var traceId = MDC.get("traceId");
        if (traceId != null) {
            response.setHeader("X-Trace-Id", traceId);
        }
        filterChain.doFilter(request, response);
    }
}
