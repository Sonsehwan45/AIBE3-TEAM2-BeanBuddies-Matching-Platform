package com.back.domain.evaluation.dto;

public record EvaluationCreateReq(
        Long projectId,
        Long evaluateeId,
        Ratings ratings,
        String comment
) {
    public record Ratings(
            int professionalism,
            int scheduleAdherence,
            int communication,
            int proactiveness
    ){}
}
