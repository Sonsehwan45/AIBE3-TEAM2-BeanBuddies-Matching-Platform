package com.back.domain.evaluation.controller;


import com.back.domain.evaluation.dto.EvaluationCreateReq;
import com.back.domain.evaluation.service.EvaluationService;
import com.back.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
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
    public ApiResponse<Void> createEvaluation(@RequestBody EvaluationCreateReq request) {
        // TODO: Spring Security에서 현재 로그인한 사용자의 ID를 가져와야 합니다.
        // Principal principal
        // Long currentUserId = ((Member) principal).getId(); 와 같은 방식
        Long currentUserId = 1L; // 임시 테스트용 ID

        evaluationService.createEvaluation(currentUserId, request);

        return new ApiResponse<>("201", "평가가 성공적으로 등록되었습니다.", null);
    }
}
