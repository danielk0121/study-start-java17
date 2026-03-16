package dev.danielk.startjava17.order;

import com.epages.restdocs.apispec.MockMvcRestDocumentationWrapper;
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

    private static final LocalDateTime NOW = LocalDateTime.of(2026, 3, 16, 12, 0, 0);

    @BeforeEach
    void setUp(RestDocumentationContextProvider restDocumentation) {
        this.mockMvc = MockMvcBuilders.webAppContextSetup(context)
                .apply(documentationConfiguration(restDocumentation))
                .build();
    }

    @Test
    @DisplayName("POST /orders — 주문 생성")
    void place() throws Exception {
        when(orderService.place(1L, 1L, 2))
                .thenReturn(new Order(1L, 1L, 1L, 2, OrderStatus.PENDING, NOW));

        mockMvc.perform(post("/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"memberId": 1, "productId": 1, "quantity": 2}
                                """))
                .andExpect(status().isOk())
                .andDo(MockMvcRestDocumentationWrapper.document("orders-place",
                        preprocessRequest(prettyPrint()), preprocessResponse(prettyPrint()),
                        requestFields(
                                fieldWithPath("memberId").description("회원 ID"),
                                fieldWithPath("productId").description("상품 ID"),
                                fieldWithPath("quantity").description("주문 수량 (1 이상)")
                        ),
                        responseFields(
                                fieldWithPath("id").description("주문 ID"),
                                fieldWithPath("memberId").description("회원 ID"),
                                fieldWithPath("productId").description("상품 ID"),
                                fieldWithPath("quantity").description("주문 수량"),
                                fieldWithPath("status").description("주문 상태 (PENDING | CONFIRMED | CANCELLED)"),
                                fieldWithPath("createdAt").description("주문 일시")
                        )
                ));
    }

    @Test
    @DisplayName("GET /orders/{id} — 주문 단건 조회")
    void findById() throws Exception {
        when(orderService.findById(1L))
                .thenReturn(new Order(1L, 1L, 1L, 2, OrderStatus.PENDING, NOW));

        mockMvc.perform(get("/orders/{id}", 1L))
                .andExpect(status().isOk())
                .andDo(MockMvcRestDocumentationWrapper.document("orders-find-by-id",
                        preprocessResponse(prettyPrint()),
                        pathParameters(parameterWithName("id").description("주문 ID")),
                        responseFields(
                                fieldWithPath("id").description("주문 ID"),
                                fieldWithPath("memberId").description("회원 ID"),
                                fieldWithPath("productId").description("상품 ID"),
                                fieldWithPath("quantity").description("주문 수량"),
                                fieldWithPath("status").description("주문 상태"),
                                fieldWithPath("createdAt").description("주문 일시")
                        )
                ));
    }

    @Test
    @DisplayName("GET /orders — 주문 목록 조회")
    void findAll() throws Exception {
        when(orderService.findAll()).thenReturn(List.of(
                new Order(1L, 1L, 1L, 2, OrderStatus.PENDING, NOW),
                new Order(2L, 2L, 2L, 1, OrderStatus.CONFIRMED, NOW)
        ));

        mockMvc.perform(get("/orders"))
                .andExpect(status().isOk())
                .andDo(MockMvcRestDocumentationWrapper.document("orders-find-all",
                        preprocessResponse(prettyPrint()),
                        responseFields(
                                fieldWithPath("[].id").description("주문 ID"),
                                fieldWithPath("[].memberId").description("회원 ID"),
                                fieldWithPath("[].productId").description("상품 ID"),
                                fieldWithPath("[].quantity").description("주문 수량"),
                                fieldWithPath("[].status").description("주문 상태"),
                                fieldWithPath("[].createdAt").description("주문 일시")
                        )
                ));
    }

    @Test
    @DisplayName("PATCH /orders/{id}/cancel — 주문 취소")
    void cancelOrder() throws Exception {
        when(orderService.cancel(1L))
                .thenReturn(new Order(1L, 1L, 1L, 2, OrderStatus.CANCELLED, NOW));

        mockMvc.perform(patch("/orders/{id}/cancel", 1L))
                .andExpect(status().isOk())
                .andDo(MockMvcRestDocumentationWrapper.document("orders-cancel",
                        preprocessResponse(prettyPrint()),
                        pathParameters(parameterWithName("id").description("주문 ID")),
                        responseFields(
                                fieldWithPath("id").description("주문 ID"),
                                fieldWithPath("memberId").description("회원 ID"),
                                fieldWithPath("productId").description("상품 ID"),
                                fieldWithPath("quantity").description("주문 수량"),
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
                        pathParameters(parameterWithName("id").description("주문 ID"))
                ));
    }
}
