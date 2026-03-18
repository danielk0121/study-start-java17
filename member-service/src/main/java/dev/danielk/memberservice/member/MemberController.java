package dev.danielk.memberservice.member;

import lombok.RequiredArgsConstructor;

import javax.validation.Valid;
import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/members")
public class MemberController {

    private final MemberService service;
    private final AddressService addressService;
    private final MemberMapper mapper;

    public record JoinRequest(@Email(message = "올바른 이메일 형식이 아닙니다.") @NotBlank(message = "이메일은 필수입니다.") String email,
                              @NotBlank(message = "이름은 필수입니다.") String name,
                              @NotBlank(message = "비밀번호는 필수입니다.") String password) {}
    public record UpdateRequest(@NotBlank(message = "이름은 필수입니다.") String name) {}
    public record MemberResponse(Long id, String email, String name, String role,
                                     OffsetDateTime createdAt, OffsetDateTime updatedAt) {}

    public record AddressRequest(@NotBlank(message = "별명은 필수입니다.") String nickname,
                                 @NotBlank(message = "주소는 필수입니다.") String address,
                                 @NotBlank(message = "우편번호는 필수입니다.") String zipCode) {}
    public record AddressResponse(Long id, String nickname, String address, String zipCode) {}

    @PostMapping
    public ResponseEntity<MemberResponse> join(@RequestBody @Valid JoinRequest request) {
        var member = service.join(request.email(), request.name(), request.password());
        var response = mapper.toResponse(member);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<MemberResponse> me(@AuthenticationPrincipal String memberId) {
        var member = service.findById(Long.parseLong(memberId));
        var response = mapper.toResponse(member);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<MemberResponse> findById(@PathVariable Long id) {
        var member = service.findById(id);
        var response = mapper.toResponse(member);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<MemberResponse>> findAll() {
        var members = service.findAll();
        var response = mapper.toResponseList(members);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/page")
    public ResponseEntity<Page<MemberResponse>> findAllPaged(@PageableDefault(size = 20) Pageable pageable) {
        var page = service.findAll(pageable).map(mapper::toResponse);
        return ResponseEntity.ok(page);
    }

    @PutMapping("/{id}")
    public ResponseEntity<MemberResponse> update(@PathVariable Long id, @RequestBody @Valid UpdateRequest request) {
        var member = service.update(id, request.name());
        var response = mapper.toResponse(member);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return ResponseEntity.noContent().build();
    }

    // --- 배송지 관리 API ---

    @GetMapping("/{id}/addresses")
    public ResponseEntity<List<AddressResponse>> getAddresses(@PathVariable Long id) {
        var addresses = addressService.findByMemberId(id).stream()
                .map(a -> new AddressResponse(a.id(), a.nickname(), a.address(), a.zipCode()))
                .toList();
        return ResponseEntity.ok(addresses);
    }

    @PostMapping("/{id}/addresses")
    public ResponseEntity<AddressResponse> addAddress(@PathVariable Long id, @RequestBody @Valid AddressRequest request) {
        var address = addressService.create(id, Address.create(request.nickname(), request.address(), request.zipCode()));
        return ResponseEntity.ok(new AddressResponse(address.id(), address.nickname(), address.address(), address.zipCode()));
    }

    @PutMapping("/{id}/addresses/{addressId}")
    public ResponseEntity<AddressResponse> updateAddress(@PathVariable Long id, @PathVariable Long addressId, @RequestBody @Valid AddressRequest request) {
        var address = addressService.update(addressId, new Address(addressId, request.nickname(), request.address(), request.zipCode()));
        return ResponseEntity.ok(new AddressResponse(address.id(), address.nickname(), address.address(), address.zipCode()));
    }

    @DeleteMapping("/{id}/addresses/{addressId}")
    public ResponseEntity<Void> deleteAddress(@PathVariable Long id, @PathVariable Long addressId) {
        addressService.delete(addressId);
        return ResponseEntity.noContent().build();
    }
}
