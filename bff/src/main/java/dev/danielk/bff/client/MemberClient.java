package dev.danielk.bff.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "member-service", url = "${feign.member-service.url}")
public interface MemberClient {

    @GetMapping("/members/{id}")
    MemberResponse findById(@PathVariable Long id);

    record MemberResponse(Long id, String name, String email, String role) {}
}
