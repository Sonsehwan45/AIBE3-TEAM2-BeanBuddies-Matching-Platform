package com.back.domain.evaluation.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record EvaluationCreateReq(
        Long projectId,
        Long evaluateeId,

        @NotNull(message = "평가 점수는 비어있을 수 없습니다.")
        @Valid
        Ratings ratings,

        String comment
) {
    public record Ratings(
            @Min(value = 1, message = "점수는 1점 이상이어야 합니다.")
            @Max(value = 5, message = "점수는 5점 이하이어야 합니다.")
            int professionalism,

            @Min(value = 1, message = "점수는 1점 이상이어야 합니다.")
            @Max(value = 5, message = "점수는 5점 이하이어야 합니다.")
            int scheduleAdherence,

            @Min(value = 1, message = "점수는 1점 이상이어야 합니다.")
            @Max(value = 5, message = "점수는 5점 이하이어야 합니다.")
            int communication,

            @Min(value = 1, message = "점수는 1점 이상이어야 합니다.")
            @Max(value = 5, message = "점수는 5점 이하이어야 합니다.")
            int proactiveness
    ) {}
}