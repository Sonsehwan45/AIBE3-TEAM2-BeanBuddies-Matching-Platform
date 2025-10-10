package com.back.domain.freelancer.freelancer.controller;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.handler;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.back.domain.freelancer.freelancer.dto.FreelancerSummary;
import com.back.domain.freelancer.freelancer.entity.Freelancer;
import com.back.domain.freelancer.freelancer.service.FreelancerService;
import com.back.domain.member.member.service.MemberService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.transaction.annotation.Transactional;


@ActiveProfiles("test")
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class FreelancerControllerTest {

    @Autowired
    private MockMvc mvc;
    @Autowired
    private FreelancerService freelancerService;

    @Test
    @DisplayName("목록보기 응답 - 200")
    void t1() throws Exception {
        ResultActions resultActions = mvc
                .perform(
                        get("/api/v1/freelancers")
                )
                .andDo(print());

        resultActions
                //실행처 확인
                .andExpect(handler().handlerType(FreelancerController.class))
                .andExpect(handler().methodName("getFreelancers"))

                //상태 코드 확인
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("목록보기 응답데이터 확인")
    void t1_data() throws Exception {
        ResultActions resultActions = mvc
                .perform(
                        get("/api/v1/freelancers")
                )
                .andDo(print());

        // TODO: 데이터 확인
        Page<FreelancerSummary> freelancers = freelancerService.findAll(null, PageRequest.of(0, 20));

        resultActions
                .andExpect(jsonPath("$.resultCode").value("200"))
                .andExpect(jsonPath("$.msg").value("프리랜서 목록"))
                .andExpect(jsonPath("$.data.content").isArray())
                .andExpect(jsonPath("$.data.content.length()").value(2))
                .andExpect(jsonPath("$.data.content[0].name").value("프리랜서1"))
                .andExpect(jsonPath("$.data.content[1].name").value("프리랜서2"));
    }

    @Test
    @DisplayName("프리랜서 정보 업데이트 - 성공")
    void t2() throws Exception {
        Page<FreelancerSummary> freelancers = freelancerService.findAll(null, PageRequest.of(0, 20));
        FreelancerSummary freelancerSummary = freelancers.stream().findFirst().orElseThrow(() -> new RuntimeException("프리랜서 없음"));
        Long id = freelancerSummary.id();

        ResultActions resultActions = mvc
                .perform(
                        put("/api/v1/freelancers/{id}", id)
                                .contentType(MediaType.APPLICATION_JSON)
                                .content("""
                                        {
                                                "job" : "백엔드",
                                                "freelancerEmail" : "myEmail@email.com",
                                                "comment" : "안녕하세요",
                                                "career" : {"Java": 5, "Spring": 4, "AWS": 3}
                                        }
                                        """)
                )
                .andDo(print());

        resultActions
                //실행처 확인
                .andExpect(handler().handlerType(FreelancerController.class))
                .andExpect(handler().methodName("updateFreelancer"))

                //상태 코드 확인
                .andExpect(status().isNoContent())

                //응답 데이터 확인
                .andExpect(jsonPath("$.resultCode").value("204"))
                .andExpect(jsonPath("$.msg").value("프리랜서 정보 변경"))
                .andExpect(jsonPath("$.data.id").value(id))
                .andExpect(jsonPath("$.data.job").value("백엔드"))
                .andExpect(jsonPath("$.data.freelancerEmail").value("myEmail@email.com"));
    }
}