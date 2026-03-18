package dev.danielk.orderservice.stats;

public record OrderMonthlyStats(
        String orderMonth,       // yyyy-MM
        long totalOrders,
        long confirmed,
        long pending,
        long cancelled,
        double cancelRatePct
) {}
