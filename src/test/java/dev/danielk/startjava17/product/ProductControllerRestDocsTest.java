package dev.danielk.startjava17.product;

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

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.restdocs.mockmvc.MockMvcRestDocumentation.documentationConfiguration;
import static org.springframework.restdocs.mockmvc.RestDocumentationRequestBuilders.delete;
import static org.springframework.restdocs.mockmvc.RestDocumentationRequestBuilders.get;
import static org.springframework.restdocs.mockmvc.RestDocumentationRequestBuilders.post;
import static org.springframework.restdocs.mockmvc.RestDocumentationRequestBuilders.put;
import static org.springframework.restdocs.operation.preprocess.Preprocessors.*;
import static org.springframework.restdocs.payload.PayloadDocumentation.*;
import static org.springframework.restdocs.request.RequestDocumentation.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ProductController.class)
@ExtendWith(RestDocumentationExtension.class)
class ProductControllerRestDocsTest {

    private MockMvc mockMvc;

    @Autowired WebApplicationContext context;
    @Autowired ObjectMapper objectMapper;
    @MockBean  ProductService productService;
    @MockBean  ProductMapper productMapper;

    private static final java.time.LocalDateTime LDT_NOW = java.time.LocalDateTime.of(2026, 3, 16, 12, 0, 0);
    private static final OffsetDateTime ODT_NOW = LDT_NOW.atZone(java.time.ZoneId.systemDefault()).toOffsetDateTime();

    private static final Product MACBOOK =
            new Product(1L, "MacBook Pro", new BigDecimal("2000000"), 10, ProductCategory.ELECTRONICS, LDT_NOW, LDT_NOW);
    private static final ProductController.ProductResponse MACBOOK_RESPONSE =
            new ProductController.ProductResponse(1L, "MacBook Pro", new BigDecimal("2000000"), 10, "ELECTRONICS", ODT_NOW, ODT_NOW);

    @BeforeEach
    void setUp(RestDocumentationContextProvider restDocumentation) {
        this.mockMvc = MockMvcBuilders.webAppContextSetup(context)
                .apply(documentationConfiguration(restDocumentation))
                .build();
    }

    @Test
    @DisplayName("POST /products — 상품 등록")
    void register() throws Exception {
        when(productMapper.toProduct(any(ProductController.RegisterRequest.class))).thenReturn(MACBOOK);
        when(productService.register(any())).thenReturn(MACBOOK);
        when(productMapper.toResponse(MACBOOK)).thenReturn(MACBOOK_RESPONSE);

        mockMvc.perform(post("/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"MacBook Pro","price":2000000,"stock":10,"category":"ELECTRONICS"}
                                """))
                .andExpect(status().isOk())
                .andDo(MockMvcRestDocumentationWrapper.document("products-register",
                        ResourceSnippetParameters.builder()
                                .requestSchema(Schema.schema("ProductRegisterRequest"))
                                .responseSchema(Schema.schema("ProductResponse")),
                        preprocessRequest(prettyPrint()),
                        preprocessResponse(prettyPrint()),
                        requestFields(
                                fieldWithPath("name").description("상품명"),
                                fieldWithPath("price").description("가격"),
                                fieldWithPath("stock").description("초기 재고 수량"),
                                fieldWithPath("category").description("카테고리 (ELECTRONICS | CLOTHING | FOOD | BOOKS | ETC)")
                        ),
                        responseFields(
                                fieldWithPath("id").description("상품 ID"),
                                fieldWithPath("name").description("상품명"),
                                fieldWithPath("price").description("가격"),
                                fieldWithPath("stock").description("재고 수량"),
                                fieldWithPath("category").description("카테고리"),
                                fieldWithPath("createdAt").description("등록 일시"),
                                fieldWithPath("updatedAt").description("최종 수정 일시")
                        )
                ));
    }

    @Test
    @DisplayName("GET /products/{id} — 상품 단건 조회")
    void findById() throws Exception {
        when(productService.findById(1L)).thenReturn(MACBOOK);
        when(productMapper.toResponse(MACBOOK)).thenReturn(MACBOOK_RESPONSE);

        mockMvc.perform(get("/products/{id}", 1L))
                .andExpect(status().isOk())
                .andDo(MockMvcRestDocumentationWrapper.document("products-find-by-id",
                        ResourceSnippetParameters.builder()
                                .responseSchema(Schema.schema("ProductResponse")),
                        preprocessRequest(prettyPrint()),
                        preprocessResponse(prettyPrint()),
                        pathParameters(parameterWithName("id").description("상품 ID")),
                        responseFields(
                                fieldWithPath("id").description("상품 ID"),
                                fieldWithPath("name").description("상품명"),
                                fieldWithPath("price").description("가격"),
                                fieldWithPath("stock").description("재고 수량"),
                                fieldWithPath("category").description("카테고리"),
                                fieldWithPath("createdAt").description("등록 일시"),
                                fieldWithPath("updatedAt").description("최종 수정 일시")
                        )
                ));
    }

    @Test
    @DisplayName("GET /products — 상품 목록 조회")
    void findAll() throws Exception {
        Product jeans = new Product(2L, "청바지", new BigDecimal("50000"), 100, ProductCategory.CLOTHING, LDT_NOW, LDT_NOW);
        ProductController.ProductResponse jeansResponse =
                new ProductController.ProductResponse(2L, "청바지", new BigDecimal("50000"), 100, "CLOTHING", ODT_NOW, ODT_NOW);

        when(productService.findAll()).thenReturn(List.of(MACBOOK, jeans));
        when(productMapper.toResponseList(any())).thenReturn(List.of(MACBOOK_RESPONSE, jeansResponse));

        mockMvc.perform(get("/products"))
                .andExpect(status().isOk())
                .andDo(MockMvcRestDocumentationWrapper.document("products-find-all",
                        ResourceSnippetParameters.builder()
                                .responseSchema(Schema.schema("ProductResponse")),
                        preprocessRequest(prettyPrint()),
                        preprocessResponse(prettyPrint()),
                        responseFields(
                                fieldWithPath("[].id").description("상품 ID"),
                                fieldWithPath("[].name").description("상품명"),
                                fieldWithPath("[].price").description("가격"),
                                fieldWithPath("[].stock").description("재고 수량"),
                                fieldWithPath("[].category").description("카테고리"),
                                fieldWithPath("[].createdAt").description("등록 일시"),
                                fieldWithPath("[].updatedAt").description("최종 수정 일시")
                        )
                ));
    }

    @Test
    @DisplayName("PUT /products/{id} — 상품 수정")
    void update() throws Exception {
        Product updated = new Product(1L, "MacBook Pro M3", new BigDecimal("2500000"), 20, ProductCategory.ELECTRONICS, LDT_NOW, LDT_NOW);
        ProductController.ProductResponse updatedResponse =
                new ProductController.ProductResponse(1L, "MacBook Pro M3", new BigDecimal("2500000"), 20, "ELECTRONICS", ODT_NOW, ODT_NOW);

        when(productMapper.toProduct(any(ProductController.UpdateRequest.class))).thenReturn(updated);
        when(productService.update(eq(1L), any())).thenReturn(updated);
        when(productMapper.toResponse(updated)).thenReturn(updatedResponse);

        mockMvc.perform(put("/products/{id}", 1L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"MacBook Pro M3","price":2500000,"stock":20,"category":"ELECTRONICS"}
                                """))
                .andExpect(status().isOk())
                .andDo(MockMvcRestDocumentationWrapper.document("products-update",
                        ResourceSnippetParameters.builder()
                                .requestSchema(Schema.schema("ProductUpdateRequest"))
                                .responseSchema(Schema.schema("ProductResponse")),
                        preprocessRequest(prettyPrint()),
                        preprocessResponse(prettyPrint()),
                        pathParameters(parameterWithName("id").description("상품 ID")),
                        requestFields(
                                fieldWithPath("name").description("상품명"),
                                fieldWithPath("price").description("가격"),
                                fieldWithPath("stock").description("재고 수량"),
                                fieldWithPath("category").description("카테고리")
                        ),
                        responseFields(
                                fieldWithPath("id").description("상품 ID"),
                                fieldWithPath("name").description("상품명"),
                                fieldWithPath("price").description("가격"),
                                fieldWithPath("stock").description("재고 수량"),
                                fieldWithPath("category").description("카테고리"),
                                fieldWithPath("createdAt").description("등록 일시"),
                                fieldWithPath("updatedAt").description("최종 수정 일시")
                        )
                ));
    }

    @Test
    @DisplayName("DELETE /products/{id} — 상품 삭제")
    void deleteProduct() throws Exception {
        doNothing().when(productService).delete(1L);

        mockMvc.perform(delete("/products/{id}", 1L))
                .andExpect(status().isNoContent())
                .andDo(MockMvcRestDocumentationWrapper.document("products-delete",
                        ResourceSnippetParameters.builder(),
                        pathParameters(parameterWithName("id").description("상품 ID"))
                ));
    }
}
