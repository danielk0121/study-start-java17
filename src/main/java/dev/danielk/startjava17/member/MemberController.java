package dev.danielk.startjava17.member;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.List;

@RestController
@RequestMapping("/members")
public class MemberController {

    private final MemberService service;
    private final MemberMapper mapper;

    public MemberController(MemberService service, MemberMapper mapper) {
        this.service = service;
        this.mapper = mapper;
    }

    public record JoinRequest(String email, String name) {}
    public record UpdateRequest(String name) {}
    public record MemberResponse(Long id, String email, String name, String role,
                                     OffsetDateTime createdAt, OffsetDateTime updatedAt) {}

    @PostMapping
    public ResponseEntity<MemberResponse> join(@RequestBody JoinRequest request) {
        return ResponseEntity.ok(mapper.toResponse(service.join(request.email(), request.name())));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MemberResponse> findById(@PathVariable Long id) {
        return ResponseEntity.ok(mapper.toResponse(service.findById(id)));
    }

    @GetMapping
    public ResponseEntity<List<MemberResponse>> findAll() {
        return ResponseEntity.ok(mapper.toResponseList(service.findAll()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MemberResponse> update(@PathVariable Long id, @RequestBody UpdateRequest request) {
        return ResponseEntity.ok(mapper.toResponse(service.update(id, request.name())));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
