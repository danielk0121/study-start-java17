package dev.danielk.authservice.service;

import dev.danielk.authservice.entity.RefreshTokenEntity;
import dev.danielk.authservice.repository.MemberReadRepository;
import dev.danielk.authservice.repository.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@RequiredArgsConstructor
@Service
public class AuthService {

    private final MemberReadRepository memberReadRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtService jwtService;

    @Transactional
    public TokenResponse login(String email) {
        var member = memberReadRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다: " + email));

        var accessToken = jwtService.generateAccessToken(member.getId(), member.getEmail());
        var refreshToken = createRefreshToken(member.getId());

        return new TokenResponse(accessToken, refreshToken);
    }

    @Transactional
    public TokenResponse refresh(String refreshToken) {
        var tokenEntity = refreshTokenRepository.findByToken(refreshToken)
                .orElseThrow(() -> new IllegalArgumentException("유효하지 않은 리프레시 토큰입니다."));

        if (tokenEntity.isExpired()) {
            refreshTokenRepository.delete(tokenEntity);
            throw new IllegalArgumentException("만료된 리프레시 토큰입니다.");
        }

        var member = memberReadRepository.findById(tokenEntity.getMemberId())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));

        // 기존 리프레시 토큰 삭제 후 새로 발급
        refreshTokenRepository.delete(tokenEntity);
        var accessToken = jwtService.generateAccessToken(member.getId(), member.getEmail());
        var newRefreshToken = createRefreshToken(member.getId());

        return new TokenResponse(accessToken, newRefreshToken);
    }

    public boolean validateToken(String token) {
        return jwtService.isValid(token);
    }

    @Transactional
    public void logout(Long memberId) {
        refreshTokenRepository.deleteByMemberId(memberId);
    }

    private String createRefreshToken(Long memberId) {
        var token = UUID.randomUUID().toString();
        var expiresAt = LocalDateTime.now().plusDays(7);
        var entity = new RefreshTokenEntity(memberId, token, expiresAt);
        refreshTokenRepository.save(entity);
        return token;
    }

    public record TokenResponse(String accessToken, String refreshToken) {}
}
