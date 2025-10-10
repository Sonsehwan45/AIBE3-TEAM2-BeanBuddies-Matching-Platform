package com.back.domain.application.application.controller;

import com.back.domain.application.application.entity.Application;
import com.back.domain.application.application.service.ApplicationService;
import com.back.domain.freelancer.freelancer.entity.Freelancer;
import com.back.domain.freelancer.freelancer.service.FreelancerService;
import com.back.domain.member.member.entity.Member;
import com.back.domain.member.member.service.MemberService;
import com.back.domain.project.project.entity.Project;
import com.back.domain.project.project.service.ProjectService;
import com.back.global.exception.ServiceException;
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

import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ActiveProfiles("test")
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class ApiV1ApplicationControllerTest {
    @Autowired
    private MockMvc mvc;
    @Autowired
    private ApplicationService applicationService;
    @Autowired
    private MemberService memberService;
    @Autowired
    private FreelancerService freelancerService;
    @Autowired
    private ProjectService projectService;

    @Test
    @DisplayName("지원서 등록")
    @WithUserDetails(value = "freelancer1", userDetailsServiceBeanName = "customUserDetailsService")
    void t1() throws Exception {
        ResultActions resultActions = mvc.perform(
                post("/api/v1/projects/1/applications")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                        {
                          "estimatedPay": 5000000,
                          "expectedDuration": "3개월",
                          "workPlan": "주 5일, 원격 근무로 진행하겠습니다.",
                          "additionalRequest": "디자인 관련 자료를 미리 공유 부탁드립니다."
                        }
                    """)
        ).andDo(print());

        Application application = applicationService.findLatest().orElseThrow(
                () -> new ServiceException("401-1", "지원서가 생성되지 않았습니다.")
        );

        resultActions
                .andExpect(status().isCreated())
                .andExpect(handler().handlerType(ApiV1ApplicationController.class))
                .andExpect(handler().methodName("create"))
                .andExpect(jsonPath("$.resultCode").value("201-1"))
                .andExpect(jsonPath("$.msg").value("%d번 지원서가 생성되었습니다.".formatted(application.getId())))
                .andExpect(jsonPath("$.data.estimatedPay").value(application.getEstimatedPay()))
                .andExpect(jsonPath("$.data.expectedDuration").value(application.getExpectedDuration()))
                .andExpect(jsonPath("$.data.workPlan").value(application.getWorkPlan()))
                .andExpect(jsonPath("$.data.additionalRequest").value(application.getAdditionalRequest()))
                .andExpect(jsonPath("$.data.projectId").value(application.getProject().getId()))
                .andExpect(jsonPath("$.data.freelancerName").value(application.getFreelancer().getMember().getName()));
    }

    @Test
    @DisplayName("지원서 등록 - freelancer 아닌 유저 등록시 Fail")
    @WithUserDetails(value = "client1", userDetailsServiceBeanName = "customUserDetailsService")
    void t1_1() throws Exception {
        ResultActions resultActions = mvc.perform(
                post("/api/v1/projects/1/applications")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                        {
                          "estimatedPay": 5000000,
                          "expectedDuration": "3개월",
                          "workPlan": "주 5일, 원격 근무로 진행하겠습니다.",
                          "additionalRequest": "디자인 관련 자료를 미리 공유 부탁드립니다."
                        }
                    """)
        ).andDo(print());

        resultActions
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.resultCode").value("403-1"))
                .andExpect(jsonPath("$.msg").value("권한이 없습니다."));
    }

    @Test
    @DisplayName("지원서 상태 수정 by 클라이언트")
    @WithUserDetails(value = "client1", userDetailsServiceBeanName = "customUserDetailsService")
    void t2() throws Exception {
        long id = 1;

        ResultActions resultActions = mvc.perform(
                patch("/api/v1/projects/1/applications/" + id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                        {
                          "status": "ACCEPT"
                        }
                    """)
        ).andDo(print());

        Application application = applicationService.findById(id);

        resultActions
                .andExpect(status().isOk())
                .andExpect(handler().handlerType(ApiV1ApplicationController.class))
                .andExpect(handler().methodName("update"))
                .andExpect(jsonPath("$.resultCode").value("200-1"))
                .andExpect(jsonPath("$.msg").value("%d번 지원서가 수정되었습니다.".formatted(application.getId())))
                .andExpect(jsonPath("$.data.status").value("ACCEPT"));
    }

    @Test
    @DisplayName("지원서 상태 수정 by 클라이언트 - freelancer 유저 시도 시 fail")
    @WithUserDetails(value = "freelancer1", userDetailsServiceBeanName = "customUserDetailsService")
    void t2_1() throws Exception {
        long id = 1;

        ResultActions resultActions = mvc.perform(
                patch("/api/v1/projects/1/applications/" + id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                        {
                          "status": "ACCEPT"
                        }
                    """)
        ).andDo(print());

        resultActions
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.resultCode").value("403-1"))
                .andExpect(jsonPath("$.msg").value("권한이 없습니다."));
    }

    @Test
    @DisplayName("지원서 상태 수정 by 클라이언트 - 다른 client 유저 시도 시 fail")
    @WithUserDetails(value = "client3", userDetailsServiceBeanName = "customUserDetailsService")
    void t2_2() throws Exception {
        long id = 1;

        ResultActions resultActions = mvc.perform(
                patch("/api/v1/projects/1/applications/" + id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                        {
                          "status": "ACCEPT"
                        }
                    """)
        ).andDo(print());

        resultActions
                .andExpect(status().isForbidden())
                .andExpect(handler().handlerType(ApiV1ApplicationController.class))
                .andExpect(handler().methodName("update"))
                .andExpect(jsonPath("$.resultCode").value("403-1"))
                .andExpect(jsonPath("$.msg").value("권한이 없습니다."));
    }

    @Test
    @DisplayName("지원서 삭제")
    @WithUserDetails(value = "freelancer1", userDetailsServiceBeanName = "customUserDetailsService")
    void t3() throws Exception {
        long id = 1;

        ResultActions resultActions = mvc.perform(
                delete(String.format("/api/v1/projects/1/applications/" + id))
        ).andDo(print());

        resultActions
                .andExpect(status().isOk())
                .andExpect(handler().handlerType(ApiV1ApplicationController.class))
                .andExpect(handler().methodName("delete"))
                .andExpect(jsonPath("$.resultCode").value("200-1"))
                .andExpect(jsonPath("$.msg").value("%d번 지원서가 삭제되었습니다.".formatted(id)));
    }

    @Test
    @DisplayName("지원서 삭제 - 다른 freelancer 유저 시도 시 fail")
    @WithUserDetails(value = "freelancer3", userDetailsServiceBeanName = "customUserDetailsService")
    void t3_1() throws Exception {
        long id = 1;

        ResultActions resultActions = mvc.perform(
                delete(String.format("/api/v1/projects/1/applications/" + id))
        ).andDo(print());

        resultActions
                .andExpect(status().isForbidden())
                .andExpect(handler().handlerType(ApiV1ApplicationController.class))
                .andExpect(handler().methodName("delete"))
                .andExpect(jsonPath("$.resultCode").value("403-1"))
                .andExpect(jsonPath("$.msg").value("권한이 없습니다."));
    }

    @Test
    @DisplayName("지원서 단건(상세) 조회")
    void t4() throws Exception {
        long projectId = 1;
        long id = 1;

        ResultActions resultActions = mvc.perform(
                get(String.format("/api/v1/projects/%d/applications/%d".formatted(projectId, id)))
        ).andDo(print());

        Application application = applicationService.findById(id);

        resultActions
                .andExpect(status().isOk())
                .andExpect(handler().handlerType(ApiV1ApplicationController.class))
                .andExpect(handler().methodName("get"))
                .andExpect(jsonPath("$.resultCode").value("200-1"))
                .andExpect(jsonPath("$.msg").value("%d번 지원서가 단건 조회되었습니다.".formatted(id)))
                .andExpect(jsonPath("$.data.estimatedPay").value(org.hamcrest.Matchers.closeTo(application.getEstimatedPay().doubleValue(), 0.01)))                .andExpect(jsonPath("$.data.expectedDuration").value(application.getExpectedDuration()))
                .andExpect(jsonPath("$.data.workPlan").value(application.getWorkPlan()))
                .andExpect(jsonPath("$.data.additionalRequest").value(application.getAdditionalRequest()))
                .andExpect(jsonPath("$.data.projectId").value(application.getProject().getId()))
                .andExpect(jsonPath("$.data.freelancerName").value(application.getFreelancer().getMember().getName()));
    }

    @Test
    @DisplayName("지원서 조회 (작성자 기준)")
    @WithUserDetails(value = "freelancer1", userDetailsServiceBeanName = "customUserDetailsService")
    void t5() throws Exception {
        ResultActions resultActions = mvc.perform(
                get("/api/v1/projects/1/applications/me")
        ).andDo(print());

        Member member = memberService.findByUsername("freelancer1").get();
        Freelancer freelancer = freelancerService.findById(member.getFreelancer().getId());
        List<Application> applications = applicationService.findAllByFreeLancer(freelancer);

        resultActions
                .andExpect(status().isOk())
                .andExpect(handler().handlerType(ApiV1ApplicationController.class))
                .andExpect(handler().methodName("getAllMe"))
                .andExpect(jsonPath("$.resultCode").value("200-1"))
                .andExpect(jsonPath("$.msg").value("%d번 프리랜서의 지원서가 조회되었습니다.".formatted(freelancer.getId())));

        for (int i = 0; i < applications.size(); i++) {
            Application application = applications.get(i);
            resultActions
                    .andExpect(jsonPath("$.data[" + i + "].estimatedPay").value(org.hamcrest.Matchers.closeTo(application.getEstimatedPay().doubleValue(), 0.01)))
                    .andExpect(jsonPath("$.data[" + i + "].expectedDuration").value(application.getExpectedDuration()))
                    .andExpect(jsonPath("$.data[" + i + "].workPlan").value(application.getWorkPlan()))
                    .andExpect(jsonPath("$.data[" + i + "].projectId").value(application.getProject().getId()))
                    .andExpect(jsonPath("$.data[" + i + "].freelancerName").value(application.getFreelancer().getMember().getName()));
        }
    }

    @Test
    @DisplayName("지원서 조회 (작성자 기준) - client 시도 시 fail")
    @WithUserDetails(value = "client1", userDetailsServiceBeanName = "customUserDetailsService")
    void t5_1() throws Exception {
        ResultActions resultActions = mvc.perform(
                get("/api/v1/projects/1/applications/me")
        ).andDo(print());

        resultActions
                .andExpect(status().isForbidden())
                .andExpect(handler().handlerType(ApiV1ApplicationController.class))
                .andExpect(handler().methodName("getAllMe"))
                .andExpect(jsonPath("$.resultCode").value("403-1"))
                .andExpect(jsonPath("$.msg").value("권한이 없습니다."));
    }

    @Test
    @DisplayName("지원서 조회 (프로젝트 기준)")
    void t6() throws Exception {
        long projectId = 1;
        Project project = projectService.findById(projectId);

        ResultActions resultActions = mvc.perform(
                get("/api/v1/projects/{projectId}/applications", projectId)
        ).andDo(print());

        List<Application> applications = applicationService.findAllByProject(project);

        resultActions
                .andExpect(status().isOk())
                .andExpect(handler().handlerType(ApiV1ApplicationController.class))
                .andExpect(handler().methodName("getAll"))
                .andExpect(jsonPath("$.resultCode").value("200-1"))
                .andExpect(jsonPath("$.msg").value("%d번 프로젝트의 지원서가 조회되었습니다.".formatted(projectId)));

        for (int i = 0; i < applications.size(); i++) {
            Application application = applications.get(i);
            resultActions
                    .andExpect(jsonPath("$.data[" + i + "].estimatedPay").value(org.hamcrest.Matchers.closeTo(application.getEstimatedPay().doubleValue(), 0.01)))
                    .andExpect(jsonPath("$.data[" + i + "].expectedDuration").value(application.getExpectedDuration()))
                    .andExpect(jsonPath("$.data[" + i + "].workPlan").value(application.getWorkPlan()))
                    .andExpect(jsonPath("$.data[" + i + "].projectId").value(application.getProject().getId()))
                    .andExpect(jsonPath("$.data[" + i + "].freelancerName").value(application.getFreelancer().getMember().getName()));
        }

    }
}