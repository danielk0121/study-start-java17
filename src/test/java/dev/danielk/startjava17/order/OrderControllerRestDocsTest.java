package dev.danielk.startjava17.order;

import com.epages.restdocs.apispec.MockMvcRestDocumentationWrapper;
import com.epages.restdocs.apispec.ResourceSnippetParameters;
import com.epages.restdocs.apispec.Schema;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.restdocs.RestDocumentationContextProvider;
import org.springframework.restdocs.RestDocumentationExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.restdocs.mockmvc.MockMvcRestDocumentation.documentationConfiguration;
import static org.springframework.restdocs.mockmvc.RestDocumentationRequestBuilders.*;
import static org.springframework.restdocs.operation.preprocess.Preprocessors.*;
import static org.springframework.restdocs.payload.PayloadDocumentation.*;
import static org.springframework.restdocs.request.RequestDocumentation.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(OrderController.class)
@ExtendWith(RestDocumentationExtension.class)
class OrderControllerRestDocsTest {

    private MockMvc mockMvc;

    @Autowired WebApplicationContext context;
    @Autowired ObjectMapper objectMapper;
    @MockBean  OrderService orderService;
    @MockBean  OrderMapper orderMapper;

    private static final LocalDateTime NOW = LocalDateTime.of(2026, 3, 16, 12, 0, 0);

    private static final List<OrderItem> ITEMS = List.of(
            new OrderItem(1L, 2),
            new OrderItem(2L, 1)
    );
    private static final List<OrderController.OrderItemResponse> ITEM_RESPONSES = List.of(
            new OrderController.OrderItemResponse(1L, 2),
            new OrderController.OrderItemResponse(2L, 1)
    );
    private static final Order ORDER =
            new Order(1L, 1L, ITEMS, OrderStatus.PENDING, NOW);
    private static final OrderController.OrderResponse ORDER_RESPONSE =
            new OrderController.OrderResponse(1L, 1L, ITEM_RESPONSES, "PENDING", NOW.toString());

    @BeforeEach
    void setUp(RestDocumentationContextProvider restDocumentation) {
        this.mockMvc = MockMvcBuilders.webAppContextSetup(context)
                .apply(documentationConfiguration(restDocumentation))
                .build();
    }

    @Test
    @DisplayName("POST /orders — 주문 생성")
    void place() throws Exception {
        when(orderMapper.toOrderItems(any())).thenReturn(ITEMS);
        when(orderService.place(eq(1L), any())).thenReturn(ORDER);
        when(orderMapper.toResponse(ORDER)).thenReturn(ORDER_RESPONSE);

        mockMvc.perform(post("/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "memberId": 1,
                                  "items": [
                                    {"productId": 1, "quantity": 2},
                                    {"productId": 2, "quantity": 1}
                                  ]
                                }
                                """))
                .andExpect(status().isOk())
                .andDo(MockMvcRestDocumentationWrapper.document("orders-place",
                        ResourceSnippetParameters.builder()
                                .requestSchema(Schema.schema("OrderPlaceRequest"))
                                .responseSchema(Schema.schema("OrderResponse")),
                        preprocessRequest(prettyPrint()),
                        preprocessResponse(prettyPrint()),
                        requestFields(
                                fieldWithPath("memberId").description("회원 ID"),
                                fieldWithPath("items").description("주문 항목 목록 (1개 이상)"),
                                fieldWithPath("items[].productId").description("상품 ID"),
                                fieldWithPath("items[].quantity").description("주문 수량 (1 이상)")
                        ),
                        responseFields(
                                fieldWithPath("id").description("주문 ID"),
                                fieldWithPath("memberId").description("회원 ID"),
                                fieldWithPath("items").description("주문 항목 목록"),
                                fieldWithPath("items[].productId").description("상품 ID"),
                                fieldWithPath("items[].quantity").description("주문 수량"),
                                fieldWithPath("status").description("주문 상태 (PENDING | CONFIRMED | CANCELLED)"),
                                fieldWithPath("createdAt").description("주문 일시")
                        )
                ));
    }

    @Test
    @DisplayName("GET /orders/{id} — 주문 단건 조회")
    void findById() throws Exception {
        when(orderService.findById(1L)).thenReturn(ORDER);
        when(orderMapper.toResponse(ORDER)).thenReturn(ORDER_RESPONSE);

        mockMvc.perform(get("/orders/{id}", 1L))
                .andExpect(status().isOk())
                .andDo(MockMvcRestDocumentationWrapper.document("orders-find-by-id",
                        ResourceSnippetParameters.builder()
                                .responseSchema(Schema.schema("OrderResponse")),
                        preprocessRequest(prettyPrint()),
                        preprocessResponse(prettyPrint()),
                        pathParameters(parameterWithName("id").description("주문 ID")),
                        responseFields(
                                fieldWithPath("id").description("주문 ID"),
                                fieldWithPath("memberId").description("회원 ID"),
                                fieldWithPath("items").description("주문 항목 목록"),
                                fieldWithPath("items[].productId").description("상품 ID"),
                                fieldWithPath("items[].quantity").description("주문 수량"),
                                fieldWithPath("status").description("주문 상태"),
                                fieldWithPath("createdAt").description("주문 일시")
                        )
                ));
    }

    @Test
    @DisplayName("GET /orders — 주문 목록 조회")
    void findAll() throws Exception {
        Order order2 = new Order(2L, 2L, List.of(new OrderItem(3L, 5)), OrderStatus.CONFIRMED, NOW);
        OrderController.OrderResponse response2 = new OrderController.OrderResponse(
                2L, 2L, List.of(new OrderController.OrderItemResponse(3L, 5)), "CONFIRMED", NOW.toString());

        when(orderService.findAll()).thenReturn(List.of(ORDER, order2));
        when(orderMapper.toResponseList(any())).thenReturn(List.of(ORDER_RESPONSE, response2));

        mockMvc.perform(get("/orders"))
                .andExpect(status().isOk())
                .andDo(MockMvcRestDocumentationWrapper.document("orders-find-all",
                        ResourceSnippetParameters.builder()
                                .responseSchema(Schema.schema("OrderResponse")),
                        preprocessRequest(prettyPrint()),
                        preprocessResponse(prettyPrint()),
                        responseFields(
                                fieldWithPath("[].id").description("주문 ID"),
                                fieldWithPath("[].memberId").description("회원 ID"),
                                fieldWithPath("[].items").description("주문 항목 목록"),
                                fieldWithPath("[].items[].productId").description("상품 ID"),
                                fieldWithPath("[].items[].quantity").description("주문 수량"),
                                fieldWithPath("[].status").description("주문 상태"),
                                fieldWithPath("[].createdAt").description("주문 일시")
                        )
                ));
    }

    @Test
    @DisplayName("PATCH /orders/{id}/cancel — 주문 취소")
    void cancelOrder() throws Exception {
        Order cancelled = new Order(1L, 1L, ITEMS, OrderStatus.CANCELLED, NOW);
        OrderController.OrderResponse cancelledResponse =
                new OrderController.OrderResponse(1L, 1L, ITEM_RESPONSES, "CANCELLED", NOW.toString());

        when(orderService.cancel(1L)).thenReturn(cancelled);
        when(orderMapper.toResponse(cancelled)).thenReturn(cancelledResponse);

        mockMvc.perform(patch("/orders/{id}/cancel", 1L))
                .andExpect(status().isOk())
                .andDo(MockMvcRestDocumentationWrapper.document("orders-cancel",
                        ResourceSnippetParameters.builder()
                                .responseSchema(Schema.schema("OrderResponse")),
                        preprocessRequest(prettyPrint()),
                        preprocessResponse(prettyPrint()),
                        pathParameters(parameterWithName("id").description("주문 ID")),
                        responseFields(
                                fieldWithPath("id").description("주문 ID"),
                                fieldWithPath("memberId").description("회원 ID"),
                                fieldWithPath("items").description("주문 항목 목록"),
                                fieldWithPath("items[].productId").description("상품 ID"),
                                fieldWithPath("items[].quantity").description("주문 수량"),
                                fieldWithPath("status").description("취소된 주문 상태 (CANCELLED)"),
                                fieldWithPath("createdAt").description("주문 일시")
                        )
                ));
    }

    @Test
    @DisplayName("DELETE /orders/{id} — 주문 삭제")
    void deleteOrder() throws Exception {
        doNothing().when(orderService).delete(1L);

        mockMvc.perform(delete("/orders/{id}", 1L))
                .andExpect(status().isNoContent())
                .andDo(MockMvcRestDocumentationWrapper.document("orders-delete",
                        ResourceSnippetParameters.builder(),
                        pathParameters(parameterWithName("id").description("주문 ID"))
                ));
    }
}
