package dev.danielk.orderservice.stats;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/stats")
public class StatsController {

    private final StatsService service;

    // GET /stats/orders/monthly
    // GET /stats/orders/monthly?month=2025-12  (특정 월 필터)
    @GetMapping("/orders/monthly")
    public ResponseEntity<List<OrderMonthlyStats>> orderMonthly(
            @RequestParam(required = false) String month) {
        var stats = service.getOrderMonthlyStats(month);
        return ResponseEntity.ok(stats);
    }

    // GET /stats/orders/daily?month=2025-12
    @GetMapping("/orders/daily")
    public ResponseEntity<List<OrderDailyStats>> orderDaily(
            @RequestParam String month) {
        var stats = service.getOrderDailyStats(month);
        return ResponseEntity.ok(stats);
    }

    // GET /stats/orders/day-of-week
    @GetMapping("/orders/day-of-week")
    public ResponseEntity<List<OrderDailyStats>> orderDayOfWeek() {
        var stats = service.getOrderDayOfWeekStats();
        return ResponseEntity.ok(stats);
    }

    // GET /stats/products/monthly?month=2025-12
    @GetMapping("/products/monthly")
    public ResponseEntity<List<ProductMonthlySales>> productMonthly(
            @RequestParam String month) {
        var stats = service.getProductMonthlySales(month);
        return ResponseEntity.ok(stats);
    }
}
