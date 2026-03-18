package dev.danielk.memberservice.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.annotation.PostConstruct;
import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.security.Key;
import java.util.List;

@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtProperties jwtProperties;
    private Key signingKey;

    @PostConstruct
    void init() {
        signingKey = Keys.hmacShaKeyFor(jwtProperties.getSecret().getBytes());
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        var authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            var token = authHeader.substring(7);
            var claims = parseToken(token);
            if (claims != null) {
                var memberId = claims.getSubject();
                var role = (String) claims.get("role");
                var authorities = List.of(new SimpleGrantedAuthority("ROLE_" + role));
                var authentication = new UsernamePasswordAuthenticationToken(memberId, null, authorities);
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        }

        filterChain.doFilter(request, response);
    }

    private Claims parseToken(String token) {
        try {
            return Jwts.parserBuilder()
                    .setSigningKey(signingKey)
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (Exception e) {
            return null;
        }
    }
}
