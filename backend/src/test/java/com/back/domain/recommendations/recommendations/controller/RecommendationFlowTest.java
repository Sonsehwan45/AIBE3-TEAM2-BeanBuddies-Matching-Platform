package com.back.domain.recommendations.recommendations.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.greaterThan;
import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;


@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
class RecommendationFlowTest {

    @Autowired MockMvc mvc;
    @Autowired
    ObjectMapper om;
    @Test
    @DisplayName("freelancer1 로그인 → 추천 프로젝트 TOP 제목 검증")
    @WithMockUser(username = "freelancer1", roles = {"FREELANCER"})
    void test1() throws Exception {
        mvc.perform(get("/api/v1/recommendations").accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(handler().handlerType(RecommendationController.class))
                .andExpect(handler().methodName("recommend"))
                .andExpect(jsonPath("$.resultCode").value("200-0"))
                .andExpect(jsonPath("$.data.content").isArray())
                .andExpect(jsonPath("$.data.content.length()", greaterThan(0)))
                .andExpect(jsonPath("$.data.content[0].title")
                        .value("백엔드 Spring JPA 마이그레이션"));
    }

    @Test
    @DisplayName("freelancer6 로그인 → 추천 프로젝트 TOP 3 제목 검증 (키워드 보강)")
    @WithMockUser(username = "freelancer6", roles = {"FREELANCER"})
    void test2() throws Exception {
        MvcResult result = mvc.perform(get("/api/v1/recommendations")
                        .param("page", "0")
                        .param("size", "3")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(handler().handlerType(RecommendationController.class))
                .andExpect(handler().methodName("recommend"))
                .andExpect(jsonPath("$.resultCode").value("200-0"))
                .andExpect(jsonPath("$.data.content").isArray())
                .andExpect(jsonPath("$.data.content.length()", greaterThanOrEqualTo(3)))
                .andReturn();

        String body = result.getResponse().getContentAsString();
        JsonNode root = om.readTree(body);
        JsonNode content = root.path("data").path("content");

        List<String> titles = new ArrayList<>();
        if (content.isArray()) {
            for (JsonNode n : content) {
                titles.add(n.path("title").asText());
            }
        }

        // 최소 3개 보장
        assertThat(titles).hasSizeGreaterThanOrEqualTo(3);

        // 상위 3개만 집합 비교(순서는 변할 수 있음)
        List<String> top3 = titles.subList(0, 3);
        assertThat(top3).containsExactlyInAnyOrder(
                "풀스택 React Spring 통합",
                "백엔드 Spring JPA 마이그레이션",
                "프론트엔드 React Next.js 대개편"
        );
    }
}