package dev.danielk.startjava17.member;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/members")
public class MemberController {

    private final MemberService service;

    public MemberController(MemberService service) {
        this.service = service;
    }

    // Java 17 Record를 요청/응답 DTO로 활용
    public record JoinRequest(String email, String name) {}
    public record MemberResponse(Long id, String email, String name, String role) {
        static MemberResponse from(Member member) {
            return new MemberResponse(member.id(), member.email(), member.name(), member.role().name());
        }
    }

    @PostMapping
    public ResponseEntity<MemberResponse> join(@RequestBody JoinRequest request) {
        Member member = service.join(request.email(), request.name());
        return ResponseEntity.ok(MemberResponse.from(member));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MemberResponse> findById(@PathVariable Long id) {
        return ResponseEntity.ok(MemberResponse.from(service.findById(id)));
    }

    @GetMapping
    public ResponseEntity<List<MemberResponse>> findAll() {
        List<MemberResponse> responses = service.findAll().stream()
                .map(MemberResponse::from)
                .toList(); // Java 16+ stream().toList()
        return ResponseEntity.ok(responses);
    }
}
