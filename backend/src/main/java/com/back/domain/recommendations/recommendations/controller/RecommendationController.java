package com.back.domain.recommendations.recommendations.controller;

import com.back.domain.recommendations.recommendations.dto.ProjectOptionDto;
import com.back.domain.recommendations.recommendations.service.RecommendationService;
import com.back.global.response.ApiResponse;
import com.back.global.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/recommendations")
public class RecommendationController {

    private final RecommendationService recommendationService;

    /**
     * 공통 추천 엔드포인트
     * - 로그인 사용자가 FREELANCER면: 본인 프로필 기준 "프로젝트" 추천 (projectId 무시)
     * - 로그인 사용자가 CLIENT면:
     *      - projectId 미전달: 가장 최근 프로젝트 기준 "프리랜서" 추천
     *      - projectId 전달: 해당 프로젝트 기준 "프리랜서" 추천
     */
    @GetMapping
    public ApiResponse<Page<?>> recommend(
            @RequestParam(required = false) Long projectId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @AuthenticationPrincipal CustomUserDetails user
    ) {

        Page<?> data =
                recommendationService.recommendForUser(user, projectId, page, size);
        return new ApiResponse<>("200-0", "OK", data);
    }

    /**
     * 클라이언트: 콤보박스 채우기용 내 프로젝트 목록(최신순, 최소정보)
     */
    @GetMapping("/client/projects")
    public ApiResponse<List<ProjectOptionDto>> myProjectsSelect(
            @RequestParam(defaultValue = "10") int limit,
            @AuthenticationPrincipal CustomUserDetails user
    ) {
        java.util.List<ProjectOptionDto> options = recommendationService.getMyProjectOptions(user, limit);
        return new ApiResponse<>("200-0", "OK", options);
    }
}