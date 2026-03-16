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

    public record JoinRequest(String email, String name) {}
    public record UpdateRequest(String name) {}
    public record MemberResponse(Long id, String email, String name, String role) {
        static MemberResponse from(Member member) {
            return new MemberResponse(member.id(), member.email(), member.name(), member.role().name());
        }
    }

    @PostMapping
    public ResponseEntity<MemberResponse> join(@RequestBody JoinRequest request) {
        return ResponseEntity.ok(MemberResponse.from(service.join(request.email(), request.name())));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MemberResponse> findById(@PathVariable Long id) {
        return ResponseEntity.ok(MemberResponse.from(service.findById(id)));
    }

    @GetMapping
    public ResponseEntity<List<MemberResponse>> findAll() {
        return ResponseEntity.ok(service.findAll().stream().map(MemberResponse::from).toList());
    }

    @PutMapping("/{id}")
    public ResponseEntity<MemberResponse> update(@PathVariable Long id, @RequestBody UpdateRequest request) {
        return ResponseEntity.ok(MemberResponse.from(service.update(id, request.name())));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
