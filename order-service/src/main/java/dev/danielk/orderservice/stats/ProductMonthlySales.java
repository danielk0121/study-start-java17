package dev.danielk.orderservice.stats;

public record ProductMonthlySales(
        String orderMonth,       // yyyy-MM
        Long productId,
        String productName,
        String category,
        long totalQuantity,
        long orderCount
) {}
