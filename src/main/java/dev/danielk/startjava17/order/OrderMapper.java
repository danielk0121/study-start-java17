package dev.danielk.startjava17.order;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

/**
 * MapStruct — Order 도메인 변환
 */
@Mapper(componentModel = "spring")
public interface OrderMapper {

    // OrderItemRequest → OrderItem
    OrderItem toOrderItem(OrderController.OrderItemRequest request);

    List<OrderItem> toOrderItems(List<OrderController.OrderItemRequest> requests);

    // OrderItem → OrderItemResponse
    OrderController.OrderItemResponse toItemResponse(OrderItem item);

    // Order → OrderResponse (status: enum→String)
    @Mapping(target = "status", expression = "java(order.status().name())")
    OrderController.OrderResponse toResponse(Order order);

    List<OrderController.OrderResponse> toResponseList(List<Order> orders);
}
