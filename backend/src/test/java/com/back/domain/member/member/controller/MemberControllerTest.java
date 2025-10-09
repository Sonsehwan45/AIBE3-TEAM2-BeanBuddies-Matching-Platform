package com.back.domain.member.member.controller;

import com.back.domain.member.member.entity.Member;
import com.back.domain.member.member.service.MemberService;
import org.hamcrest.Matchers;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ActiveProfiles("test")
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
public class MemberControllerTest {
    @Autowired
    private MockMvc mvc;
    @Autowired
    private MemberService memberService;

    @Test
    @DisplayName("회원가입 성공")
    void t1_join() throws Exception {

        ResultActions resultActions = mvc
                .perform(
                        post("/api/v1/members")
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("""
                                        {
                                                "role": "CLIENT",
                                                "name" : "유저new",
                                                "username" : "userNew",
                                                "password" : "1234",
                                                "passwordConfirm" : "1234",
                                                "email" : "test@test.com"
                                        }
                                        """)
                )
                .andDo(print());

        Member member = memberService.findByUsername("userNew").get();

        resultActions
                //실행처 확인
                .andExpect(handler().handlerType(MemberController.class))
                .andExpect(handler().methodName("join"))

                //상태 코드 확인
                .andExpect(status().isCreated())

                //응답 데이터 확인
                .andExpect(jsonPath("$.resultCode").value("201-1"))
                .andExpect(jsonPath("$.msg").value("%s님 환영합니다. 회원가입이 완료되었습니다.".formatted(member.getName())))
                .andExpect(jsonPath("$.data.id").value(member.getId()))
                .andExpect(jsonPath("$.data.name").value(member.getName()))
                .andExpect(jsonPath("$.data.role").value(member.getRole().name()))
                .andExpect(jsonPath("$.data.status").value(member.getStatus().name()));

    }

    @Test
    @DisplayName("회원가입 실패 : 공백 항목 존재")
    void t2_join_exception() throws Exception {

        ResultActions resultActions = mvc.perform(
                post("/api/v1/members")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                        "role": "CLIENT",
                                        "name" : "유저new",
                                        "username" : "userNew",
                                        "password" : "1234",
                                        "passwordConfirm" : "12345",
                                        "email" : " "
                                }
                                """)
        ).andDo(print());

        resultActions
                //실행처 확인
                .andExpect(handler().handlerType(MemberController.class))
                .andExpect(handler().methodName("join"))

                //상태 코드 확인
                .andExpect(status().isBadRequest())

                //응답 데이터 확인
                .andExpect(jsonPath("$.resultCode").value("400-1"))
                .andExpect(jsonPath("$.msg").value(Matchers.containsString("email-Email-must be a well-formed email address")))
                .andExpect(jsonPath("$.msg").value(Matchers.containsString("email-NotBlank-must not be blank")));
    }

    @Test
    @DisplayName("회원가입 실패 : 이미 존재하는 회원")
    void t3_join_exception() throws Exception {

        memberService.join("CLIENT", "유저new", "userNew", "1234", "1234", "test@test.com");

        //이미 사용중인 아이디로 회원가입
        ResultActions resultActions = mvc.perform(
                post("/api/v1/members")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                        "role": "FREELANCER",
                                        "name" : "유저new2",
                                        "username" : "userNew",
                                        "password" : "1234",
                                        "passwordConfirm" : "1234",
                                        "email" : "test@test.com"
                                }
                                """)
        ).andDo(print());

        resultActions
                //실행처 확인
                .andExpect(handler().handlerType(MemberController.class))
                .andExpect(handler().methodName("join"))

                //상태 코드 확인
                .andExpect(status().isConflict())

                //응답 데이터 확인
                .andExpect(jsonPath("$.resultCode").value("409-1"))
                .andExpect(jsonPath("$.msg").value("이미 존재하는 회원입니다."));
    }

    @Test
    @DisplayName("회원가입 실패 : 비밀번호 확인 불일치")
    void t4_join_exception() throws Exception {

        ResultActions resultActions = mvc.perform(
                post("/api/v1/members")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                        "role": "CLIENT",
                                        "name" : "유저new",
                                        "username" : "userNew",
                                        "password" : "1234",
                                        "passwordConfirm" : "12345",
                                        "email" : "test@test.com"
                                }
                                """)
        ).andDo(print());

        resultActions
                //실행처 확인
                .andExpect(handler().handlerType(MemberController.class))
                .andExpect(handler().methodName("join"))

                //상태 코드 확인
                .andExpect(status().isBadRequest())

                //응답 데이터 확인
                .andExpect(jsonPath("$.resultCode").value("400-2"))
                .andExpect(jsonPath("$.msg").value("비밀번호와 비밀번호 확인이 일치하지 않습니다."));
    }
}
