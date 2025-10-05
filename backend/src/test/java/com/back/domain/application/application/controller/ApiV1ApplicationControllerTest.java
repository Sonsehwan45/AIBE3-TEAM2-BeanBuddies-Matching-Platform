package com.back.domain.application.application.controller;

import com.back.domain.application.application.entity.Application;
import com.back.domain.application.application.service.ApplicationService;
import com.back.global.exception.ServiceException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
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

    @Test
    @DisplayName("지원서 등록")
    @WithMockUser(username = "freelancer1", roles = {"FREELANCER"})
    void t1() throws Exception {
        ResultActions resultActions = mvc.perform(
                post("/api/v1/projects/1/applications")
                        .contentType(MediaType.APPLICATION_JSON)
                        .with(csrf())
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
                .andExpect(jsonPath("$.data.projectId").value(application.getId()))
                .andExpect(jsonPath("$.data.freelancerName").value(application.getFreelancer().getMember().getName()));
    }

    @Test
    @DisplayName("지원서 상태 수정 by 클라이언트")
    @WithMockUser(username = "client1", roles = {"CLIENT"})
    void t2() throws Exception {
        long id = 1;

        ResultActions resultActions = mvc.perform(
                patch("/api/v1/projects/1/applications/" + id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .with(csrf())
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
    @DisplayName("지원서 삭제")
    @WithMockUser(username = "freelancer1", roles = {"FREELANCER"})
    void t3() throws Exception {
        long id = 1;

        ResultActions resultActions = mvc.perform(
                delete(String.format("/api/v1/projects/1/applications/" + id))
                        .with(csrf())
        ).andDo(print());

        resultActions
                .andExpect(status().isOk())
                .andExpect(handler().handlerType(ApiV1ApplicationController.class))
                .andExpect(handler().methodName("delete"))
                .andExpect(jsonPath("$.resultCode").value("200-1"))
                .andExpect(jsonPath("$.msg").value("%d번 지원서가 삭제되었습니다.".formatted(id)));
    }
}