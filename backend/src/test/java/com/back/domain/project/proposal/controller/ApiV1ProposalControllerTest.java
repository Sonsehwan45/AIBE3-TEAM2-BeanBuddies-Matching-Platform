package com.back.domain.project.proposal.controller;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.everyItem;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.handler;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.back.domain.member.member.entity.Member;
import com.back.domain.member.member.service.MemberService;
import com.back.domain.proposal.proposal.constant.ProposalStatus;
import com.back.domain.proposal.proposal.controller.ApiV1ProposalController;
import com.back.domain.proposal.proposal.dto.ProposalDto;
import com.back.domain.proposal.proposal.service.ProposalService;
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

@ActiveProfiles("test")
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@DisplayName("제안서 (클라이언트 -> 프리랜서) 컨트롤러 테스트")
class ApiV1ProposalControllerTest {

    @Autowired
    private MockMvc mvc;
    @Autowired
    private ProposalService proposalService;
    @Autowired
    private MemberService memberService;

    @Test
    @DisplayName("제안서 프로젝트별 목록보기")
    void t1() throws Exception {
        Long projectId = 1L;

        ResultActions resultActions = mvc
                .perform(
                        get("/api/v1/projects/{projectId}/proposals", projectId)
                )
                .andDo(print());

        resultActions
                .andExpect(handler().handlerType(ApiV1ProposalController.class))
                .andExpect(handler().methodName("getProposals"))
                .andExpect(status().isOk())

                // data 검증
                .andExpect(jsonPath("$.resultCode").value("200"))
                .andExpect(jsonPath("$.msg").value("제안서 목록 조회 성공"))
                .andExpect(jsonPath("$.data").isArray())
                .andExpect(jsonPath("$.data.length()").value(2))

                // 공통 항목 검증
                // json 파싱시 String -> Integer 로 변환됨
                .andExpect(jsonPath("$.data[*].projectId")
                        .value(everyItem(is(1))))
                .andExpect(jsonPath("$.data[*].status").value(everyItem(is("WAIT"))))
                .andExpect(jsonPath("$.data[*].clientId").value(everyItem(is(2))))
                .andExpect(jsonPath("$.data[*].clientName").value(everyItem(is("클라이언트1"))))

                // 첫 번째 제안서 상세 검증
                .andExpect(jsonPath("$.data[0].id").value(1))
                .andExpect(jsonPath("$.data[0].message").value("프로젝트 제안 메시지 1"))
                .andExpect(jsonPath("$.data[0].freelancerId").value(4))
                .andExpect(jsonPath("$.data[0].freelancerName").value("프리랜서1"))

                // 두 번째 제안서 상세 검증
                .andExpect(jsonPath("$.data[1].id").value(2))
                .andExpect(jsonPath("$.data[1].message").value("프로젝트 제안 메시지 2"))
                .andExpect(jsonPath("$.data[1].freelancerId").value(6))
                .andExpect(jsonPath("$.data[1].freelancerName").value("프리랜서3"));
    }

    @Test
    @DisplayName("제안서별 조회")
    @WithUserDetails(value = "client1", userDetailsServiceBeanName = "customUserDetailsService")
    void t2() throws Exception {
        Long projectId = 1L;
        Long proposalId = 1L;

        ResultActions resultActions = mvc
                .perform(
                        get("/api/v1/projects/{projectId}/proposals/{proposalId}", projectId, proposalId)
                )
                .andDo(print());

        resultActions
                .andExpect(handler().handlerType(ApiV1ProposalController.class))
                .andExpect(handler().methodName("getProposal"))
                .andExpect(status().isOk())

                // data 검증
                .andExpect(jsonPath("$.resultCode").value("200"))
                .andExpect(jsonPath("$.msg").value("제안서 조회 성공"))
                .andExpect(jsonPath("$.data").exists())
                .andExpect(jsonPath("$.data.id").value(1))
                .andExpect(jsonPath("$.data.message").value("프로젝트 제안 메시지 1"))
                .andExpect(jsonPath("$.data.projectId").value(1))
                .andExpect(jsonPath("$.data.freelancerId").value(4))
                .andExpect(jsonPath("$.data.freelancerName").value("프리랜서1"))
                .andExpect(jsonPath("$.data.clientId").value(2))
                .andExpect(jsonPath("$.data.clientName").value("클라이언트1"))
                .andExpect(jsonPath("$.data.status").value("WAIT"));
    }

    @Test
    @DisplayName("제안서별 조회 - 대상자")
    @WithUserDetails(value = "freelancer1", userDetailsServiceBeanName = "customUserDetailsService")
    void t2_success_freelancer() throws Exception {
        Long projectId = 1L;
        Long proposalId = 1L;

        ResultActions resultActions = mvc
                .perform(
                        get("/api/v1/projects/{projectId}/proposals/{proposalId}", projectId, proposalId)
                )
                .andDo(print());

        resultActions
                .andExpect(handler().handlerType(ApiV1ProposalController.class))
                .andExpect(handler().methodName("getProposal"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("제안서별 조회 실패 - 제안서의 프로젝트가 아님(400)")
    @WithUserDetails(value = "client1", userDetailsServiceBeanName = "customUserDetailsService")
    void t2_bad_request() throws Exception {
        Long projectId = 2L;
        Long proposalId = 1L;

        ResultActions resultActions = mvc
                .perform(
                        get("/api/v1/projects/{projectId}/proposals/{proposalId}", projectId, proposalId)
                )
                .andDo(print());

        resultActions
                .andExpect(handler().handlerType(ApiV1ProposalController.class))
                .andExpect(handler().methodName("getProposal"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.resultCode").value("400-1"))
                .andExpect(jsonPath("$.msg").value("해당 프로젝트의 제안서가 아닙니다."))
                .andExpect(jsonPath("$.data").doesNotExist());
    }

    @Test
    @DisplayName("제안서별 조회 실패(403) - 제안서의 작성자 아님")
    @WithUserDetails(value = "client2", userDetailsServiceBeanName = "customUserDetailsService")
    void t2_bad_request_not_client() throws Exception {
        Long projectId = 1L;
        Long proposalId = 1L;

        ResultActions resultActions = mvc
                .perform(
                        get("/api/v1/projects/{projectId}/proposals/{proposalId}", projectId, proposalId)
                )
                .andDo(print());

        resultActions
                .andExpect(handler().handlerType(ApiV1ProposalController.class))
                .andExpect(handler().methodName("getProposal"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.resultCode").value("403-2"))
                .andExpect(jsonPath("$.msg").value("제안서를 열람할 권한이 없습니다."))
                .andExpect(jsonPath("$.data").doesNotExist());
    }

    @Test
    @DisplayName("제안서별 조회 실패(403) - 제안서의 대상이 아님")
    @WithUserDetails(value = "freelancer2", userDetailsServiceBeanName = "customUserDetailsService")
    void t2_bad_request_not_freelancer() throws Exception {
        Long projectId = 1L;
        Long proposalId = 1L;

        ResultActions resultActions = mvc
                .perform(
                        get("/api/v1/projects/{projectId}/proposals/{proposalId}", projectId, proposalId)
                )
                .andDo(print());

        resultActions
                .andExpect(handler().handlerType(ApiV1ProposalController.class))
                .andExpect(handler().methodName("getProposal"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.resultCode").value("403-2"))
                .andExpect(jsonPath("$.msg").value("제안서를 열람할 권한이 없습니다."))
                .andExpect(jsonPath("$.data").doesNotExist());
    }

    @Test
    @DisplayName("제안서 등록")
    @WithUserDetails(value = "client1", userDetailsServiceBeanName = "customUserDetailsService")
    void t3() throws Exception {
        Long projectId = 1L;

        ResultActions resultActions = mvc
                .perform(
                        post("/api/v1/projects/{projectId}/proposals", projectId)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("""
                                        {
                                                "freelancerId" : 7,
                                                "message" : "새 제안 요청"
                                        }
                                        """)
                )
                .andDo(print());

        resultActions
                .andExpect(handler().handlerType(ApiV1ProposalController.class))
                .andExpect(handler().methodName("create"))
                .andExpect(status().isCreated())

                // data 검증
                .andExpect(jsonPath("$.resultCode").value("201"))
                .andExpect(jsonPath("$.msg").value("제안서 등록 성공"))
                .andExpect(jsonPath("$.data").exists())
                .andExpect(jsonPath("$.data.id").exists())
                .andExpect(jsonPath("$.data.message").value("새 제안 요청"))
                .andExpect(jsonPath("$.data.projectId").value(1))
                .andExpect(jsonPath("$.data.freelancerId").value(7))
                .andExpect(jsonPath("$.data.freelancerName").value("프리랜서4"))
                .andExpect(jsonPath("$.data.clientId").value(2))
                .andExpect(jsonPath("$.data.clientName").value("클라이언트1"))
                .andExpect(jsonPath("$.data.status").value("WAIT"));
    }

    @Test
    @DisplayName("제안서 등록 실패(400) - 필수 필드 누락")
    @WithUserDetails(value = "client1", userDetailsServiceBeanName = "customUserDetailsService")
    void t3_missing_fields_json_error() throws Exception {
        Long projectId = 1L;

        ResultActions resultActions = mvc
                .perform(
                        post("/api/v1/projects/{projectId}/proposals", projectId)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("""
                                        {
                                                "message" : "" // 메시지 필드 누락 또는 빈 값
                                        }
                                        """)
                )
                .andDo(print());

        resultActions
                .andExpect(handler().methodName("create"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.resultCode").value("400-1"))
                .andExpect(jsonPath("$.msg").value(
                        org.hamcrest.Matchers.containsString("요청 본문 형식이 잘못되었거나 필수 값이 누락되었습니다.")));
    }

    @Test
    @DisplayName("제안서 등록 실패(400) - 필수 필드 검증 오류")
    @WithUserDetails(value = "client1", userDetailsServiceBeanName = "customUserDetailsService")
    void t3_missing_fields_valid_error() throws Exception {
        Long projectId = 1L;

        ResultActions resultActions = mvc
                .perform(
                        post("/api/v1/projects/{projectId}/proposals", projectId)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("""
                                        {
                                                "freelancerId" : 7,
                                                "message" : ""
                                        }
                                        """)
                )
                .andDo(print());

        resultActions
                .andExpect(handler().methodName("create"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.resultCode").value("400-1"))
                .andExpect(jsonPath("$.msg").value(
                        org.hamcrest.Matchers.containsString("message-NotBlank-메시지는 필수이며 공백일 수 없습니다.")));
    }

    @Test
    @DisplayName("제안서 등록 실패(403) - 프로젝트 작성 클라이언트가 아님")
    @WithUserDetails(value = "client2", userDetailsServiceBeanName = "customUserDetailsService")
    void t3_forbidden() throws Exception {
        Long projectId = 1L;

        ResultActions resultActions = mvc
                .perform(
                        post("/api/v1/projects/{projectId}/proposals", projectId)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("""
                                        {
                                                "freelancerId" : 7,
                                                "message" : "새 제안 요청"
                                        }
                                        """)
                )
                .andDo(print());

        resultActions
                .andExpect(handler().handlerType(ApiV1ProposalController.class))
                .andExpect(handler().methodName("create"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.resultCode").value("403-1"))
                .andExpect(jsonPath("$.msg").value("프로젝트 작성자가 아닙니다. 제안서 작성 권한이 없습니다."))
                .andExpect(jsonPath("$.data").doesNotExist());
    }

    @Test
    @DisplayName("제안서 등록 실패(404) - 대상 프리랜서가 활성화 상태가 아님")
    @WithUserDetails(value = "client1", userDetailsServiceBeanName = "customUserDetailsService")
    void t3_bad_request() throws Exception {
        Long projectId = 1L;

        ResultActions resultActions = mvc
                .perform(
                        post("/api/v1/projects/{projectId}/proposals", projectId)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("""
                                        {
                                                "freelancerId" : 5,
                                                "message" : "새 제안 요청"
                                        }
                                        """)
                )
                .andDo(print());

        resultActions
                .andExpect(handler().handlerType(ApiV1ProposalController.class))
                .andExpect(handler().methodName("create"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.resultCode").value("400-2"))
                .andExpect(jsonPath("$.msg").value("활성화 상태가 아닌 프리랜서에게는 제안서를 보낼 수 없습니다."))
                .andExpect(jsonPath("$.data").doesNotExist());
    }

    @Test
    @DisplayName("제안서 상태 변경")
    @WithUserDetails(value = "freelancer1", userDetailsServiceBeanName = "customUserDetailsService")
    void t4() throws Exception {
        Long projectId = 1L;
        Long proposalId = 1L;

        ResultActions resultActions = mvc
                .perform(
                        patch("/api/v1/projects/{projectId}/proposals/{proposalId}", projectId, proposalId)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("""
                                        {
                                                "status" : "ACCEPT"
                                        }
                                        """)
                )
                .andDo(print());

        resultActions
                .andExpect(handler().handlerType(ApiV1ProposalController.class))
                .andExpect(handler().methodName("updateState"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.resultCode").value("200"))
                .andExpect(jsonPath("$.msg").value("제안서 상태 변경 성공"))
                .andExpect(jsonPath("$.data").exists())
                .andExpect(jsonPath("$.data.id").value(1))
                .andExpect(jsonPath("$.data.status").value("ACCEPT"));
        // 기타 dto 데이터 검증 생략
    }

    @Test
    @DisplayName("제안서 상태 변경 실패(403) - 제안서 대상 프리랜서가 아님")
    @WithUserDetails(value = "freelancer2", userDetailsServiceBeanName = "customUserDetailsService")
    void t4_forbidden() throws Exception {
        Long projectId = 1L;
        Long proposalId = 1L;

        ResultActions resultActions = mvc
                .perform(
                        patch("/api/v1/projects/{projectId}/proposals/{proposalId}", projectId, proposalId)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("""
                                        {
                                                "status" : "ACCEPT"
                                        }
                                        """)
                )
                .andDo(print());

        resultActions
                .andExpect(handler().handlerType(ApiV1ProposalController.class))
                .andExpect(handler().methodName("updateState"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.resultCode").value("403-2"))
                .andExpect(jsonPath("$.msg").value("제안서 대상자가 아닙니다. 상태 변경 권한이 없습니다."))
                .andExpect(jsonPath("$.data").doesNotExist());
    }

    @Test
    @DisplayName("제안서 상태 변경 실패(400) - enum 값 불일치")
    @WithUserDetails(value = "freelancer1", userDetailsServiceBeanName = "customUserDetailsService")
    void t4_bad_request_enum_incorrect() throws Exception {
        Long projectId = 1L;
        Long proposalId = 1L;

        ResultActions resultActions = mvc
                .perform(
                        patch("/api/v1/projects/{projectId}/proposals/{proposalId}", projectId, proposalId)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("""
                                        {
                                                "status" : "ACCEPT1"
                                        }
                                        """)
                )
                .andDo(print());

        resultActions
                .andExpect(handler().handlerType(ApiV1ProposalController.class))
                .andExpect(handler().methodName("updateState"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.resultCode").value("400-1"))
                .andExpect(jsonPath("$.msg").value("잘못된 요청입니다.\n"
                        + "ProposalStatus는 ACCEPT1가 없습니다.\n"
                        + "ProposalStatus는 [WAIT, ACCEPT, DENIED]만 가능합니다."))
                .andExpect(jsonPath("$.data").doesNotExist());
    }

    @Test
    @DisplayName("제안서 상태 변경 실패(400) - 이미 처리된 제안서")
    @WithUserDetails(value = "freelancer1", userDetailsServiceBeanName = "customUserDetailsService")
    void t4_bad_request_not_wait() throws Exception {
        Long projectId = 1L;
        Long proposalId = 1L;

        Member member = memberService.findById(4L);// freelancer1
        ProposalDto before = proposalService.findBy(member, projectId, proposalId);
        assertThat(before.status()).isEqualTo(ProposalStatus.WAIT);

        // 상태 변경 (WAIT -> DENIED)
        proposalService.updateState(member, projectId, proposalId, ProposalStatus.DENIED);

        ResultActions resultActions = mvc
                .perform(
                        patch("/api/v1/projects/{projectId}/proposals/{proposalId}", projectId, proposalId)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("""
                                        {
                                                "status" : "ACCEPT"
                                        }
                                        """)
                )
                .andDo(print());

        resultActions
                .andExpect(handler().handlerType(ApiV1ProposalController.class))
                .andExpect(handler().methodName("updateState"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.resultCode").value("400-3"))
                .andExpect(jsonPath("$.msg").value("대기 상태가 아닌 제안서는 상태를 변경할 수 없습니다."))
                .andExpect(jsonPath("$.data").doesNotExist());
    }

    @Test
    @DisplayName("제안서 삭제")
    @WithUserDetails(value = "client1", userDetailsServiceBeanName = "customUserDetailsService")
    void t5() throws Exception {
        Long projectId = 1L;
        Long proposalId = 1L;

        ResultActions resultActions = mvc
                .perform(
                        delete("/api/v1/projects/{projectId}/proposals/{proposalId}", projectId, proposalId))
                .andDo(print());

        resultActions
                .andExpect(handler().handlerType(ApiV1ProposalController.class))
                .andExpect(handler().methodName("delete"))
                .andExpect(status().isNoContent())
                .andExpect(jsonPath("$.data").doesNotExist());
    }

    @Test
    @DisplayName("제안서 삭제 실패(403) - 프로젝트 작성 클라이언트가 아님")
    @WithUserDetails(value = "client2", userDetailsServiceBeanName = "customUserDetailsService")
    void t5_forbidden() throws Exception {
        Long projectId = 1L;
        Long proposalId = 1L;

        ResultActions resultActions = mvc
                .perform(
                        delete("/api/v1/projects/{projectId}/proposals/{proposalId}", projectId, proposalId))
                .andDo(print());

        resultActions
                .andExpect(handler().handlerType(ApiV1ProposalController.class))
                .andExpect(handler().methodName("delete"))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.resultCode").value("403-2"))
                .andExpect(jsonPath("$.msg").value("프로젝트 작성자가 아닙니다. 제안서 삭제 권한이 없습니다."))
                .andExpect(jsonPath("$.data").doesNotExist());
    }
}