package dev.danielk.authservice.controller;

import dev.danielk.authservice.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public record LoginRequest(String email) {}
    public record RefreshRequest(String refreshToken) {}
    public record ValidateRequest(String token) {}
    public record ValidateResponse(boolean valid) {}

    @PostMapping("/login")
    public ResponseEntity<AuthService.TokenResponse> login(@RequestBody LoginRequest request) {
        var response = authService.login(request.email());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthService.TokenResponse> refresh(@RequestBody RefreshRequest request) {
        var response = authService.refresh(request.refreshToken());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/validate")
    public ResponseEntity<ValidateResponse> validate(@RequestBody ValidateRequest request) {
        var valid = authService.validateToken(request.token());
        return ResponseEntity.ok(new ValidateResponse(valid));
    }

    @PostMapping("/logout/{memberId}")
    public ResponseEntity<Void> logout(@PathVariable Long memberId) {
        authService.logout(memberId);
        return ResponseEntity.noContent().build();
    }
}
