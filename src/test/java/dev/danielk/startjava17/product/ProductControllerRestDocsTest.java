package dev.danielk.startjava17.product;

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
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.restdocs.mockmvc.MockMvcRestDocumentation.document;
import static org.springframework.restdocs.mockmvc.MockMvcRestDocumentation.documentationConfiguration;
import static org.springframework.restdocs.mockmvc.RestDocumentationRequestBuilders.*;
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

    @BeforeEach
    void setUp(RestDocumentationContextProvider restDocumentation) {
        this.mockMvc = MockMvcBuilders.webAppContextSetup(context)
                .apply(documentationConfiguration(restDocumentation))
                .build();
    }

    @Test
    @DisplayName("POST /products — 상품 등록")
    void register() throws Exception {
        when(productService.register(any(), any(), eq(10), any()))
                .thenReturn(new Product(1L, "MacBook Pro", new BigDecimal("2000000"), 10, ProductCategory.ELECTRONICS));

        mockMvc.perform(post("/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "name": "MacBook Pro",
                                    "price": 2000000,
                                    "stock": 10,
                                    "category": "ELECTRONICS"
                                }
                                """))
                .andExpect(status().isOk())
                .andDo(document("products-register",
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
                                fieldWithPath("category").description("카테고리")
                        )
                ));
    }

    @Test
    @DisplayName("GET /products/{id} — 상품 단건 조회")
    void findById() throws Exception {
        when(productService.findById(1L))
                .thenReturn(new Product(1L, "MacBook Pro", new BigDecimal("2000000"), 10, ProductCategory.ELECTRONICS));

        mockMvc.perform(get("/products/{id}", 1L))
                .andExpect(status().isOk())
                .andDo(document("products-find-by-id",
                        preprocessResponse(prettyPrint()),
                        pathParameters(
                                parameterWithName("id").description("상품 ID")
                        ),
                        responseFields(
                                fieldWithPath("id").description("상품 ID"),
                                fieldWithPath("name").description("상품명"),
                                fieldWithPath("price").description("가격"),
                                fieldWithPath("stock").description("재고 수량"),
                                fieldWithPath("category").description("카테고리")
                        )
                ));
    }

    @Test
    @DisplayName("GET /products — 상품 목록 조회")
    void findAll() throws Exception {
        when(productService.findAll()).thenReturn(List.of(
                new Product(1L, "MacBook Pro", new BigDecimal("2000000"), 10, ProductCategory.ELECTRONICS),
                new Product(2L, "청바지", new BigDecimal("50000"), 100, ProductCategory.CLOTHING)
        ));

        mockMvc.perform(get("/products"))
                .andExpect(status().isOk())
                .andDo(document("products-find-all",
                        preprocessResponse(prettyPrint()),
                        responseFields(
                                fieldWithPath("[].id").description("상품 ID"),
                                fieldWithPath("[].name").description("상품명"),
                                fieldWithPath("[].price").description("가격"),
                                fieldWithPath("[].stock").description("재고 수량"),
                                fieldWithPath("[].category").description("카테고리")
                        )
                ));
    }
}
