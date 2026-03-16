package dev.danielk.startjava17.member;

import javax.validation.Valid;
import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
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

    public record JoinRequest(@Email(message = "올바른 이메일 형식이 아닙니다.") @NotBlank(message = "이메일은 필수입니다.") String email,
                              @NotBlank(message = "이름은 필수입니다.") String name) {}
    public record UpdateRequest(@NotBlank(message = "이름은 필수입니다.") String name) {}
    public record MemberResponse(Long id, String email, String name, String role,
                                     OffsetDateTime createdAt, OffsetDateTime updatedAt) {}

    @PostMapping
    public ResponseEntity<MemberResponse> join(@RequestBody @Valid JoinRequest request) {
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

    @GetMapping("/page")
    public ResponseEntity<Page<MemberResponse>> findAllPaged(@PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(service.findAll(pageable).map(mapper::toResponse));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MemberResponse> update(@PathVariable Long id, @RequestBody @Valid UpdateRequest request) {
        return ResponseEntity.ok(mapper.toResponse(service.update(id, request.name())));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
