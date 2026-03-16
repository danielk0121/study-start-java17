package dev.danielk.startjava17.stats;

public record OrderMonthlyStats(
        String orderMonth,       // yyyy-MM
        long totalOrders,
        long confirmed,
        long pending,
        long cancelled,
        double cancelRatePct
) {}
