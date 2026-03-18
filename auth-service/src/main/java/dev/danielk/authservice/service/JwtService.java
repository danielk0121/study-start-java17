package dev.danielk.authservice.service;

import dev.danielk.authservice.config.JwtProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import java.security.Key;
import java.util.Date;

@RequiredArgsConstructor
@Service
public class JwtService {

    private final JwtProperties properties;
    private Key signingKey;

    @PostConstruct
    void init() {
        signingKey = Keys.hmacShaKeyFor(properties.getSecret().getBytes());
    }

    public String generateAccessToken(Long memberId, String role) {
        var now = new Date();
        var expiry = new Date(now.getTime() + properties.getExpiration());
        return Jwts.builder()
                .setSubject(String.valueOf(memberId))
                .claim("role", role)
                .setIssuedAt(now)
                .setExpiration(expiry)
                .signWith(signingKey, SignatureAlgorithm.HS256)
                .compact();
    }

    public Claims parseToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(signingKey)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public boolean isValid(String token) {
        try {
            var claims = parseToken(token);
            return !claims.getExpiration().before(new Date());
        } catch (Exception e) {
            return false;
        }
    }
}
