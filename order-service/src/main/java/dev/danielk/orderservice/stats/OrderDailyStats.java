package dev.danielk.orderservice.stats;

public record OrderDailyStats(
        String orderDate,        // yyyy-MM-dd
        String orderMonth,       // yyyy-MM
        int dayOfWeek,           // 1=일 2=월 ... 7=토
        long totalOrders,
        long confirmed,
        long pending,
        long cancelled
) {}
