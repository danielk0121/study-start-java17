package dev.danielk.orderservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import java.util.List;

@FeignClient(name = "member-service", url = "${feign.member-service.url}")
public interface MemberClient {

    @GetMapping("/members/{id}")
    MemberResponse findById(@PathVariable Long id);

    @GetMapping("/members/{id}/addresses")
    List<AddressResponse> getAddresses(@PathVariable Long id);

    record MemberResponse(Long id, String name, String email) {}
    record AddressResponse(Long id, String nickname, String address, String zipCode) {}
}
