package com.back.domain.member.member.controller;

import com.back.domain.member.member.service.MemberService;
import org.hamcrest.Matchers;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithUserDetails;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.handler;

@ActiveProfiles("test")
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class AuthTestControllerTest {

    @Autowired
    private MockMvc mvc;

    @Autowired
    private MemberService memberService;

    // ---------- public(성공) ----------
    @Test
    @DisplayName("Public 성공 - 누구나 가능")
    void t1_public() throws Exception {
        ResultActions resultActions = mvc.perform(get("/api/v1/test/public"))
                .andDo(print());

        resultActions
                //실행처 확인
                .andExpect(handler().handlerType(AuthTestController.class))
                .andExpect(handler().methodName("publicEndpoint"))

                //상태 코드 확인
                .andExpect(status().isOk())

                //응답 데이터 확인
                .andExpect(jsonPath("$.resultCode").value("200"))
                .andExpect(jsonPath("$.msg").value("누구나 접근 가능"));
    }



    // ---------- auth(성공 / 실패-인증X / 실패-활성X) ----------
    @Test
    @WithUserDetails("client1")
    @DisplayName("Auth 성공 - 인증 + 활성 계정")
    void t2_auth() throws Exception {
        ResultActions resultActions = mvc.perform(get("/api/v1/test/auth"))
                .andDo(print());

        resultActions
                //실행처 확인
                .andExpect(handler().handlerType(AuthTestController.class))
                .andExpect(handler().methodName("authenticatedUserEndpoint"))

                //상태 코드 확인
                .andExpect(status().isOk())

                //응답 데이터 확인
                .andExpect(jsonPath("$.resultCode").value("200"))
                .andExpect(jsonPath("$.msg").value(Matchers.containsString("인증된 사용자 접근 성공")))
                .andExpect(jsonPath("$.data.name").value("클라이언트1"))
                .andExpect(jsonPath("$.data.role").value("CLIENT"))
                .andExpect(jsonPath("$.data.status").value("ACTIVE"));
    }

    @Test
    @DisplayName("Auth 실패 - 인증되지 않은 사용자")
    void t3_auth_fail_noLogin() throws Exception {
        ResultActions resultActions = mvc.perform(get("/api/v1/test/auth"))
                .andDo(print());

        resultActions
                //상태 코드 확인
                .andExpect(status().isUnauthorized())

                //응답 데이터 확인
                .andExpect(jsonPath("$.resultCode").value("401-1"))
                .andExpect(jsonPath("$.msg").value("로그인 후 이용해주세요."));
    }

    @Test
    @WithUserDetails("client2") // INACTIVE 계정
    @DisplayName("Auth 실패 - 비활성 계정")
    void t4_auth_fail_Inactive() throws Exception {
        ResultActions resultActions = mvc.perform(get("/api/v1/test/auth"))
                .andDo(print());

        resultActions
                //실행처 확인
                .andExpect(handler().handlerType(AuthTestController.class))
                .andExpect(handler().methodName("authenticatedUserEndpoint"))
                
                //상태 코드 확인
                .andExpect(status().isForbidden())
                
                //응답 데이터 확인
                .andExpect(jsonPath("$.resultCode").value("403-2"))
                .andExpect(jsonPath("$.msg").value("비활성 계정입니다."));
    }



    // ---------- client 테스트 (성공 / 실패-인증X / 실패-권한X / 실패-활성X) ----------
    @Test
    @WithUserDetails("client1")
    @DisplayName("Client 성공")
    void t5_client() throws Exception {
        ResultActions resultActions = mvc.perform(get("/api/v1/test/auth/client"))
                .andDo(print());

        resultActions
                //실행처 확인
                .andExpect(handler().handlerType(AuthTestController.class))
                .andExpect(handler().methodName("clientEndpoint"))
                
                //상태 코드 확인
                .andExpect(status().isOk())
                
                //응답 데이터 확인
                .andExpect(jsonPath("$.resultCode").value("200"))
                .andExpect(jsonPath("$.msg").value("클라이언트 접근 성공"))
                .andExpect(jsonPath("$.data.name").value("클라이언트1"))
                .andExpect(jsonPath("$.data.role").value("CLIENT"))
                .andExpect(jsonPath("$.data.status").value("ACTIVE"));
    }

    @Test
    @DisplayName("Client 실패 - 인증되지 않은 사용자")
    void t6_client_fail_noLogin() throws Exception {
        ResultActions resultActions = mvc.perform(get("/api/v1/test/auth/client"))
                .andDo(print());

        resultActions
                //상태 코드 확인
                .andExpect(status().isUnauthorized())
                
                .andExpect(jsonPath("$.resultCode").value("401-1"))
                .andExpect(jsonPath("$.msg").value("로그인 후 이용해주세요."));
    }

    @Test
    @WithUserDetails("freelancer1")
    @DisplayName("Client 실패 - 다른 역할")
    void t7_client_fail_role() throws Exception {
        ResultActions resultActions = mvc.perform(get("/api/v1/test/auth/client"))
                .andDo(print());

        resultActions
                //상태 코드 확인
                .andExpect(status().isForbidden())
                
                //응답 데이터 확인
                .andExpect(jsonPath("$.resultCode").value("403-1"))
                .andExpect(jsonPath("$.msg").value("권한이 없습니다."));
    }

    @Test
    @WithUserDetails("client2")
    @DisplayName("Client 실패 - 비활성 계정")
    void t8_client_fail_inactive() throws Exception {
        ResultActions resultActions = mvc.perform(get("/api/v1/test/auth/client"))
                .andDo(print());

        resultActions
                //실행처 확인
                .andExpect(handler().handlerType(AuthTestController.class))
                .andExpect(handler().methodName("clientEndpoint"))

                //상태 코드 확인
                .andExpect(status().isForbidden())

                //응답 데이터 확인
                .andExpect(jsonPath("$.resultCode").value("403-2"))
                .andExpect(jsonPath("$.msg").value("비활성 계정입니다."));
    }

    // ---------- Me 테스트 (성공 / 실패-인증X / 실패-활성X) ----------
    @Test
    @WithUserDetails("client1")
    @DisplayName("내 정보 조회 성공")
    void t9_me_success() throws Exception {
        ResultActions resultActions = mvc.perform(get("/api/v1/test/auth/me"))
                .andDo(print());

        resultActions
                //실행처 확인
                .andExpect(handler().handlerType(AuthTestController.class))
                .andExpect(handler().methodName("myInfo"))

                //상태 코드 확인
                .andExpect(status().isOk())

                //응답 데이터 확인
                .andExpect(jsonPath("$.resultCode").value("200"))
                .andExpect(jsonPath("$.msg").value("내 정보 조회 성공"))
                .andExpect(jsonPath("$.data.name").value("클라이언트1"));
    }
    
    @Test
    @DisplayName("내 정보 조회 실패 - 인증되지 않은 사용자")
    void t10_me_fail_noLogin() throws Exception {
        ResultActions resultActions = mvc.perform(get("/api/v1/test/auth/me"))
                .andDo(print());

        resultActions
                //상태 코드 확인
                .andExpect(status().isUnauthorized())

                //응답 데이터 확인
                .andExpect(jsonPath("$.resultCode").value("401-1"))
                .andExpect(jsonPath("$.msg").value("로그인 후 이용해주세요."));
    }
}
