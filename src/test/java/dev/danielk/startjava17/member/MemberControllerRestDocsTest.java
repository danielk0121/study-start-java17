package dev.danielk.startjava17.member;

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

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.restdocs.mockmvc.MockMvcRestDocumentation.document;
import static org.springframework.restdocs.mockmvc.MockMvcRestDocumentation.documentationConfiguration;
import static org.springframework.restdocs.mockmvc.RestDocumentationRequestBuilders.*;
import static org.springframework.restdocs.operation.preprocess.Preprocessors.*;
import static org.springframework.restdocs.payload.PayloadDocumentation.*;
import static org.springframework.restdocs.request.RequestDocumentation.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(MemberController.class)
@ExtendWith(RestDocumentationExtension.class)
class MemberControllerRestDocsTest {

    private MockMvc mockMvc;

    @Autowired WebApplicationContext context;
    @Autowired ObjectMapper objectMapper;
    @MockBean  MemberService memberService;

    @BeforeEach
    void setUp(RestDocumentationContextProvider restDocumentation) {
        this.mockMvc = MockMvcBuilders.webAppContextSetup(context)
                .apply(documentationConfiguration(restDocumentation))
                .build();
    }

    @Test
    @DisplayName("POST /members — 회원 가입")
    void join() throws Exception {
        when(memberService.join(any(), any()))
                .thenReturn(new Member(1L, "user@example.com", "홍길동", MemberRole.USER));

        mockMvc.perform(post("/members")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email": "user@example.com", "name": "홍길동"}
                                """))
                .andExpect(status().isOk())
                .andDo(document("members-join",
                        preprocessRequest(prettyPrint()), preprocessResponse(prettyPrint()),
                        requestFields(
                                fieldWithPath("email").description("이메일 (로그인 ID)"),
                                fieldWithPath("name").description("회원 이름")
                        ),
                        responseFields(
                                fieldWithPath("id").description("회원 ID"),
                                fieldWithPath("email").description("이메일"),
                                fieldWithPath("name").description("이름"),
                                fieldWithPath("role").description("권한 (USER | ADMIN)")
                        )
                ));
    }

    @Test
    @DisplayName("GET /members/{id} — 회원 단건 조회")
    void findById() throws Exception {
        when(memberService.findById(1L))
                .thenReturn(new Member(1L, "user@example.com", "홍길동", MemberRole.USER));

        mockMvc.perform(get("/members/{id}", 1L))
                .andExpect(status().isOk())
                .andDo(document("members-find-by-id",
                        preprocessResponse(prettyPrint()),
                        pathParameters(parameterWithName("id").description("회원 ID")),
                        responseFields(
                                fieldWithPath("id").description("회원 ID"),
                                fieldWithPath("email").description("이메일"),
                                fieldWithPath("name").description("이름"),
                                fieldWithPath("role").description("권한")
                        )
                ));
    }

    @Test
    @DisplayName("GET /members — 회원 목록 조회")
    void findAll() throws Exception {
        when(memberService.findAll()).thenReturn(List.of(
                new Member(1L, "user@example.com", "홍길동", MemberRole.USER),
                new Member(2L, "admin@example.com", "관리자", MemberRole.ADMIN)
        ));

        mockMvc.perform(get("/members"))
                .andExpect(status().isOk())
                .andDo(document("members-find-all",
                        preprocessResponse(prettyPrint()),
                        responseFields(
                                fieldWithPath("[].id").description("회원 ID"),
                                fieldWithPath("[].email").description("이메일"),
                                fieldWithPath("[].name").description("이름"),
                                fieldWithPath("[].role").description("권한")
                        )
                ));
    }

    @Test
    @DisplayName("PUT /members/{id} — 회원 정보 수정")
    void update() throws Exception {
        when(memberService.update(eq(1L), any()))
                .thenReturn(new Member(1L, "user@example.com", "홍길순", MemberRole.USER));

        mockMvc.perform(put("/members/{id}", 1L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name": "홍길순"}
                                """))
                .andExpect(status().isOk())
                .andDo(document("members-update",
                        preprocessRequest(prettyPrint()), preprocessResponse(prettyPrint()),
                        pathParameters(parameterWithName("id").description("회원 ID")),
                        requestFields(
                                fieldWithPath("name").description("변경할 이름")
                        ),
                        responseFields(
                                fieldWithPath("id").description("회원 ID"),
                                fieldWithPath("email").description("이메일"),
                                fieldWithPath("name").description("변경된 이름"),
                                fieldWithPath("role").description("권한")
                        )
                ));
    }

    @Test
    @DisplayName("DELETE /members/{id} — 회원 삭제")
    void delete() throws Exception {
        doNothing().when(memberService).delete(1L);

        mockMvc.perform(delete("/members/{id}", 1L))
                .andExpect(status().isNoContent())
                .andDo(document("members-delete",
                        pathParameters(parameterWithName("id").description("회원 ID"))
                ));
    }
}
