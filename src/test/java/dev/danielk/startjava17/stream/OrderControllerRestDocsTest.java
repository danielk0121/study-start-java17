package dev.danielk.startjava17.stream;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.redis.connection.stream.RecordId;
import org.springframework.http.MediaType;
import org.springframework.restdocs.RestDocumentationContextProvider;
import org.springframework.restdocs.RestDocumentationExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.restdocs.mockmvc.MockMvcRestDocumentation.document;
import static org.springframework.restdocs.mockmvc.MockMvcRestDocumentation.documentationConfiguration;
import static org.springframework.restdocs.operation.preprocess.Preprocessors.*;
import static org.springframework.restdocs.payload.PayloadDocumentation.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Spring REST Docs 학습 예제 — OrderController
 *
 * ● 핵심 개념
 *   - @WebMvcTest: 웹 레이어(Controller)만 로드. Spring Context 전체 로드보다 빠름.
 *   - @MockBean: OrderStreamProducer를 Mock으로 대체. 실제 Redis 불필요.
 *   - RestDocumentationExtension: 테스트 실행 중 스니펫(.adoc)을 자동 생성.
 *
 * ● 스니펫 생성 경로
 *   build/generated-snippets/orders-publish/
 *   ├── curl-request.adoc       curl 호출 예시
 *   ├── http-request.adoc       원본 HTTP 요청
 *   ├── http-response.adoc      원본 HTTP 응답
 *   ├── request-body.adoc       요청 본문
 *   ├── response-body.adoc      응답 본문
 *   ├── request-fields.adoc     요청 필드 설명표
 *   └── response-body.adoc      응답 설명
 *
 * ● 최종 HTML 생성
 *   ./gradlew asciidoctor
 *   → build/docs/asciidoc/html5/index.html
 *   → 앱 실행 후 http://localhost:8080/docs/index.html 에서도 확인 가능
 */
@WebMvcTest(OrderController.class)
@ExtendWith(RestDocumentationExtension.class)
class OrderControllerRestDocsTest {

    private MockMvc mockMvc;

    @Autowired
    private WebApplicationContext context;

    @MockBean
    private OrderStreamProducer producer;

    @BeforeEach
    void setUp(RestDocumentationContextProvider restDocumentation) {
        this.mockMvc = MockMvcBuilders.webAppContextSetup(context)
                // REST Docs 확장 등록 — 이후 .andDo(document(...)) 호출 시 스니펫 생성
                .apply(documentationConfiguration(restDocumentation))
                .build();
    }

    @Test
    @DisplayName("POST /orders — 주문 이벤트 발행 API 문서 생성")
    void publishOrder() throws Exception {
        // Mock: producer.publish() 호출 시 고정 RecordId 반환
        when(producer.publish(any(OrderEvent.class)))
                .thenReturn(RecordId.of("1700000000000-0"));

        mockMvc.perform(post("/stream/orders")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "product": "MacBook Pro",
                                    "quantity": 2
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(content().string("published: 1700000000000-0"))

                // document("스니펫 디렉토리명", 문서화 설정...)
                .andDo(document("orders-publish",
                        // 요청/응답을 읽기 좋게 들여쓰기 처리
                        preprocessRequest(prettyPrint()),
                        preprocessResponse(prettyPrint()),

                        // 요청 필드 문서화 → request-fields.adoc 생성
                        requestFields(
                                fieldWithPath("product").description("상품명"),
                                fieldWithPath("quantity").description("주문 수량")
                        )
                        // 응답이 단순 String이므로 responseFields 생략
                        // JSON 응답이라면 responseFields(fieldWithPath("id").description("...")) 형태로 추가
                ));
    }
}
