package com.back.domain.evaluation.controller;

import com.back.domain.evaluation.dto.EvaluationCreateReq;
import com.back.domain.evaluation.dto.EvaluationResponse;
import com.back.domain.evaluation.service.EvaluationService;
import com.back.global.response.ApiResponse;
import com.back.global.security.CustomUserDetails;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/evaluations")
public class EvaluationController {

    private final EvaluationService evaluationService;

    //평가 생성
    @PostMapping
    public ApiResponse<EvaluationResponse> createEvaluation(
            @Valid @RequestBody EvaluationCreateReq request,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        // @AuthenticationPrincipal을 통해 받은 사용자 정보에서 직접 ID를 추출합니다.
        Long currentUserId = userDetails.getId();

        // 실제 사용자 ID를 서비스 계층으로 전달합니다.
        EvaluationResponse responseData = evaluationService.createEvaluation(currentUserId, request);

        // 생성된 평가 데이터를 포함하여 성공 응답을 반환합니다.
        return new ApiResponse<>("201", "평가가 성공적으로 등록되었습니다.", responseData);
    }
}