package com.back.domain.member.member.controller;

import com.back.domain.client.client.entity.Client;
import com.back.domain.freelancer.freelancer.entity.Freelancer;
import com.back.domain.member.member.entity.Member;
import com.back.domain.member.member.service.MemberService;
import org.hamcrest.Matchers;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithUserDetails;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.transaction.annotation.Transactional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
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
                                        """
                                )
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
                                """
                        )
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
                                """
                        )
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
                                """
                        )
        ).andDo(print());

        resultActions
                //실행처 확인
                .andExpect(handler().handlerType(MemberController.class))
                .andExpect(handler().methodName("join"))

                //상태 코드 확인
                .andExpect(status().isBadRequest())

                //응답 데이터 확인
                .andExpect(jsonPath("$.resultCode").value("400-4"))
                .andExpect(jsonPath("$.msg").value("비밀번호와 비밀번호 확인이 일치하지 않습니다."));

    }

    @Test
    @DisplayName("비밀번호 수정 성공")
    @WithUserDetails("client1")
    public void t5_updatePassword() throws Exception {
        ResultActions resultActions = mvc.perform(
                patch("/api/v1/members/password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "currentPassword": "1234",
                                    "newPassword": "5678",
                                    "newPasswordConfirm": "5678"
                                }
                                """
                        )
        ).andDo(print());

        resultActions
                //실행처 확인
                .andExpect(handler().handlerType(MemberController.class))
                .andExpect(handler().methodName("updatePassword"))

                //상태코드 확인
                .andExpect(status().isOk())

                //응답 데이터 확인
                .andExpect(jsonPath("$.resultCode").value("200-5"))
                .andExpect(jsonPath("$.msg").value("비밀번호 수정이 완료되었습니다."));
    }

    @Test
    @DisplayName("비밀번호 수정 실패 - 현재 비밀번호 불일치")
    @WithUserDetails("client1")
    public void t6_updatePassword_exception() throws Exception {
        ResultActions resultActions = mvc.perform(
                patch("/api/v1/members/password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "currentPassword": "12345",
                                    "newPassword": "5678",
                                    "newPasswordConfirm": "5678"
                                }
                                """
                        )
        ).andDo(print());

        resultActions
                //실행처 확인
                .andExpect(handler().handlerType(MemberController.class))
                .andExpect(handler().methodName("updatePassword"))

                //상태코드 확인
                .andExpect(status().isUnauthorized())

                //응답 데이터 확인
                .andExpect(jsonPath("$.resultCode").value("401-3"))
                .andExpect(jsonPath("$.msg").value("현재 비밀번호가 일치하지 않습니다."));
    }

    @Test
    @DisplayName("비밀번호 수정 실패 - 새 비밀번호 확인 불일치")
    @WithUserDetails("client1")
    public void t7_updatePassword_exception() throws Exception {
        ResultActions resultActions = mvc.perform(
                patch("/api/v1/members/password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "currentPassword": "1234",
                                    "newPassword": "5678",
                                    "newPasswordConfirm": "9999"
                                }
                                """
                        )
        ).andDo(print());

        resultActions
                //실행처 확인
                .andExpect(handler().handlerType(MemberController.class))
                .andExpect(handler().methodName("updatePassword"))

                //상태코드 확인
                .andExpect(status().isBadRequest())

                //응답 데이터 확인
                .andExpect(jsonPath("$.resultCode").value("400-6"))
                .andExpect(jsonPath("$.msg").value("새 비밀번호 확인이 일치하지 않습니다."));
    }

    @Test
    @DisplayName("임시 비밀번호 발급 성공")
    public void t8_issueTempPassword() throws Exception {
        ResultActions resultActions = mvc.perform(
                post("/api/v1/members/password-reset")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "username": "client1",
                                    "email":  "test@test.com",
                                    "code": "blahblah"
                                }
                                """
                        )
        ).andDo(print());

        resultActions
                //실행처 확인
                .andExpect(handler().handlerType(MemberController.class))
                .andExpect(handler().methodName("issueTempPassword"))

                //상태코드 확인
                .andExpect(status().isOk())

                //응답 데이터 확인
                .andExpect(jsonPath("$.resultCode").value("200-6"))
                .andExpect(jsonPath("$.msg").value("임시 비밀번호가 이메일로 발송되었습니다."));
    }

    @Test
    @DisplayName("임시 비밀번호 발급 실패 - 존재하지 않는 사용자")
    public void t9_issueTempPassword() throws Exception {
        ResultActions resultActions = mvc.perform(
                post("/api/v1/members/password-reset")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "username": "client12",
                                    "email":  "test@test.com",
                                    "code": "blahblah"
                                }
                                """
                        )
        ).andDo(print());

        resultActions
                //실행처 확인
                .andExpect(handler().handlerType(MemberController.class))
                .andExpect(handler().methodName("issueTempPassword"))

                //상태코드 확인
                .andExpect(status().isNotFound())

                //응답 데이터 확인
                .andExpect(jsonPath("$.resultCode").value("404-1"))
                .andExpect(jsonPath("$.msg").value("해당 회원이 존재하지 않습니다."));
    }

    @Test
    @DisplayName("임시 비밀번호 발급 실패 - 이메일 불일치")
    public void t10_issueTempPassword() throws Exception {
        ResultActions resultActions = mvc.perform(
                post("/api/v1/members/password-reset")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "username": "client1",
                                    "email":  "testtest@test.com",
                                    "code": "blahblah"
                                }
                                """
                        )
        ).andDo(print());

        resultActions
                //실행처 확인
                .andExpect(handler().handlerType(MemberController.class))
                .andExpect(handler().methodName("issueTempPassword"))

                //상태코드 확인
                .andExpect(status().isBadRequest())

                //응답 데이터 확인
                .andExpect(jsonPath("$.resultCode").value("400-2"))
                .andExpect(jsonPath("$.msg").value("이메일이 회원 정보와 일치하지 않습니다."));
    }

    @Test
    @DisplayName("프리랜서 프로필 수정 성공")
    @WithUserDetails("freelancer1")
    void t11_updateFreelancerProfile_success() throws Exception {
        // GIVEN
        Member beforeMember = memberService.findByUsername("freelancer1").get();

        // WHEN
        ResultActions resultActions = mvc.perform(
                patch("/api/v1/members/me/profile")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "name": "프리랜서1_수정",
                                    "profileImgUrl": "new_freelancer_url",
                                    "job": "Backend Developer",
                                    "freelancerEmail": "freelancer_new@test.com",
                                    "comment": "한 줄 소개 수정"
                                }
                                """
                        )
        ).andDo(print());

        // THEN
        resultActions
                .andExpect(status().isOk())
                .andExpect(handler().handlerType(MemberController.class))
                .andExpect(handler().methodName("updateMyProfile"))
                .andExpect(jsonPath("$.resultCode").value("200-8"))
                .andExpect(jsonPath("$.msg").value("프로필 수정 성공"));

        Member afterMember = memberService.findById(beforeMember.getId());
        Freelancer afterFreelancer = afterMember.getFreelancer();

        assertThat(afterMember.getName()).isEqualTo("프리랜서1_수정");
        assertThat(afterMember.getProfileImgUrl()).isEqualTo("new_freelancer_url");
        assertThat(afterFreelancer.getJob()).isEqualTo("Backend Developer");
        assertThat(afterFreelancer.getFreelancerEmail()).isEqualTo("freelancer_new@test.com");
        assertThat(afterFreelancer.getComment()).isEqualTo("한 줄 소개 수정");
    }

    @Test
    @DisplayName("클라이언트 프로필 수정 성공")
    @WithUserDetails("client1")
    void t12_updateClientProfile_success() throws Exception {
        // GIVEN
        Member beforeMember = memberService.findByUsername("client1").get();

        // WHEN
        ResultActions resultActions = mvc.perform(
                patch("/api/v1/members/me/profile")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "name": "클라이언트1_수정",
                                    "profileImgUrl": "new_client_url",
                                    "companySize": "10-50",
                                    "companyDescription": "회사 설명 수정",
                                    "companyEmail": "client_new@test.com"
                                }
                                """
                        )
        ).andDo(print());

        // THEN
        resultActions
                .andExpect(status().isOk())
                .andExpect(handler().handlerType(MemberController.class))
                .andExpect(handler().methodName("updateMyProfile"))
                .andExpect(jsonPath("$.resultCode").value("200-8"))
                .andExpect(jsonPath("$.msg").value("프로필 수정 성공"));

        Member afterMember = memberService.findById(beforeMember.getId());
        Client afterClient = afterMember.getClient();

        assertThat(afterMember.getName()).isEqualTo("클라이언트1_수정");
        assertThat(afterMember.getProfileImgUrl()).isEqualTo("new_client_url");
        assertThat(afterClient.getCompanySize()).isEqualTo("10-50");
        assertThat(afterClient.getCompanyDescription()).isEqualTo("회사 설명 수정");
        assertThat(afterClient.getCompanyEmail()).isEqualTo("client_new@test.com");
    }

    @Test
    @DisplayName("내 프로필 조회 성공")
    @WithUserDetails("freelancer1")
    void t13_getMyProfile_success() throws Exception {
        // WHEN
        ResultActions resultActions = mvc.perform(
                get("/api/v1/members/me")
        ).andDo(print());

        // THEN
        resultActions
                .andExpect(status().isOk())
                .andExpect(handler().handlerType(MemberController.class))
                .andExpect(handler().methodName("getMyProfile"))
                .andExpect(jsonPath("$.resultCode").value("200-7"))
                .andExpect(jsonPath("$.msg").value("프로필 조회 성공"))
                .andExpect(jsonPath("$.data.username").value("freelancer1"));
    }

    @Test
    @DisplayName("다른 사용자 프로필 조회 성공")
    void t14_getUserProfile_success() throws Exception {
        // GIVEN
        Member client = memberService.findByUsername("client1").get();

        // WHEN
        ResultActions resultActions = mvc.perform(
                get("/api/v1/members/{userId}/profile", client.getId())
        ).andDo(print());

        // THEN
        resultActions
                .andExpect(status().isOk())
                .andExpect(handler().handlerType(MemberController.class))
                .andExpect(handler().methodName("getProfile"))
                .andExpect(jsonPath("$.resultCode").value("200-7"))
                .andExpect(jsonPath("$.msg").value("프로필 조회 성공"))
                .andExpect(jsonPath("$.data.username").value("client1"));
    }

    @Test
    @DisplayName("프리랜서 프로필 수정 - 클라이언트 필드는 무시됨")
    @WithUserDetails("freelancer1")
    void t15_updateFreelancerProfile_with_clientFields_ignored() throws Exception {
        // GIVEN
        Member beforeMember = memberService.findByUsername("freelancer1").get();
        String originalComment = beforeMember.getFreelancer().getComment();

        // WHEN
        ResultActions resultActions = mvc.perform(
                patch("/api/v1/members/me/profile")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "comment": "프리랜서 한 줄 소개만 수정",
                                    "companyDescription": "이 필드는 무시되어야 합니다."
                                }
                                """
                        )
        ).andDo(print());

        // THEN
        resultActions.andExpect(status().isOk());

        Member afterMember = memberService.findById(beforeMember.getId());
        assertThat(afterMember.getFreelancer().getComment()).isEqualTo("프리랜서 한 줄 소개만 수정");
        // Verify that the original data of another member type is not affected.
        Member clientMember = memberService.findByUsername("client1").get();
        assertThat(clientMember.getClient().getCompanyDescription()).isNotEqualTo("이 필드는 무시되어야 합니다.");
    }

    @Test
    @DisplayName("클라이언트 프로필 수정 - 프리랜서 필드는 무시됨")
    @WithUserDetails("client1")
    void t16_updateClientProfile_with_freelancerFields_ignored() throws Exception {
        // GIVEN
        Member beforeMember = memberService.findByUsername("client1").get();
        String originalCompanyDescription = beforeMember.getClient().getCompanyDescription();

        // WHEN
        ResultActions resultActions = mvc.perform(
                patch("/api/v1/members/me/profile")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                    "companyDescription": "클라이언트 회사 소개만 수정",
                                    "comment": "이 필드는 무시되어야 합니다."
                                }
                                """
                        )
        ).andDo(print());

        // THEN
        resultActions.andExpect(status().isOk());

        Member afterMember = memberService.findById(beforeMember.getId());
        assertThat(afterMember.getClient().getCompanyDescription()).isEqualTo("클라이언트 회사 소개만 수정");
        // Verify that the original data of another member type is not affected.
        Member freelancerMember = memberService.findByUsername("freelancer1").get();
        assertThat(freelancerMember.getFreelancer().getComment()).isNotEqualTo("이 필드는 무시되어야 합니다.");
    }
}
