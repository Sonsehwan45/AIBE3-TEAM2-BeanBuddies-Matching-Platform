package com.back.domain.evaluation.dto;

import java.util.List;

public record EvaluationsWithCountResponse(
        int count, // 총 평가 개수
        List<EvaluationResponse> evaluations // 실제 평가 목록
) {
}