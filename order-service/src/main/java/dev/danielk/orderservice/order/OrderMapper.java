package dev.danielk.orderservice.order;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

/**
 * MapStruct — Order 도메인 변환
 *
 * LocalDateTime(도메인) → OffsetDateTime(DTO) 변환:
 *   도메인/영속 레이어는 LocalDateTime을 유지하고,
 *   API 응답 시 시스템 기본 ZoneId를 붙여 OffsetDateTime으로 노출한다.
 */
@Mapper(componentModel = "spring")
public interface OrderMapper {

    OrderItem toOrderItem(OrderController.OrderItemRequest request);

    List<OrderItem> toOrderItems(List<OrderController.OrderItemRequest> requests);

    OrderController.OrderItemResponse toItemResponse(OrderItem item);

    @Mapping(target = "status",    expression = "java(order.status().name())")
    @Mapping(target = "createdAt", expression = "java(order.createdAt() != null ? order.createdAt().atZone(java.time.ZoneId.systemDefault()).toOffsetDateTime() : null)")
    @Mapping(target = "updatedAt", expression = "java(order.updatedAt() != null ? order.updatedAt().atZone(java.time.ZoneId.systemDefault()).toOffsetDateTime() : null)")
    OrderController.OrderResponse toResponse(Order order);

    List<OrderController.OrderResponse> toResponseList(List<Order> orders);
}
