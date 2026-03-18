package dev.danielk.memberservice.member;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 서비스 내부 전용 API — Nginx 라우팅에 포함되지 않음
 * auth-service가 로그인 시 회원 인증 정보를 조회하는 용도
 */
@RequiredArgsConstructor
@RestController
@RequestMapping("/internal/members")
public class InternalMemberController {

    private final MemberService memberService;
    private final PasswordEncoder passwordEncoder;

    public record AuthenticateRequest(String email, String password) {}
    public record AuthenticateResponse(Long id, String role) {}

    @PostMapping("/authenticate")
    public ResponseEntity<AuthenticateResponse> authenticate(@RequestBody AuthenticateRequest request) {
        var member = memberService.findByEmail(request.email())
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 회원입니다."));

        if (!passwordEncoder.matches(request.password(), member.password())) {
            throw new IllegalArgumentException("비밀번호가 일치하지 않습니다.");
        }

        return ResponseEntity.ok(new AuthenticateResponse(member.id(), member.role().name()));
    }
}
