package com.back.domain.evaluation.controller;


import com.back.domain.evaluation.dto.EvaluationCreateReq;
import com.back.domain.evaluation.dto.EvaluationResponse;
import com.back.domain.evaluation.service.EvaluationService;
import com.back.global.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
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
    public ApiResponse<EvaluationResponse> createEvaluation(@Valid @RequestBody EvaluationCreateReq request) {
        Long currentUserId = 4L; // 임시 테스트용 ID

        EvaluationResponse responseData = evaluationService.createEvaluation(currentUserId, request);


        return new ApiResponse<>("201", "평가가 성공적으로 등록되었습니다.", responseData);
    }
}
