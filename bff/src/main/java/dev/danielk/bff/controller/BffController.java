package dev.danielk.bff.controller;

import dev.danielk.bff.client.MemberClient;
import dev.danielk.bff.client.OrderClient;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/bff")
public class BffController {

    private final MemberClient memberClient;
    private final OrderClient orderClient;

    public record MemberWithOrders(
            MemberClient.MemberResponse member,
            List<OrderClient.OrderResponse> orders
    ) {}

    @GetMapping("/members/{id}/with-orders")
    public ResponseEntity<MemberWithOrders> memberWithOrders(@PathVariable Long id) {
        var member = memberClient.findById(id);
        var orders = orderClient.findAll(id);
        return ResponseEntity.ok(new MemberWithOrders(member, orders));
    }
}
