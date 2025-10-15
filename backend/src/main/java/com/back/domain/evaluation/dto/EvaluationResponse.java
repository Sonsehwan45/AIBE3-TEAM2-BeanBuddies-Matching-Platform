package com.back.domain.evaluation.dto;

import com.back.domain.evaluation.entity.ClientEvaluation;
import com.back.domain.evaluation.entity.FreelancerEvaluation;

import java.time.LocalDateTime;

public record EvaluationResponse(
        Long evaluationId,
        Long projectId,
        Long evaluatorId,
        Long evaluateeId,
        String comment,
        int ratingSatisfaction,
        int ratingProfessionalism,
        int ratingScheduleAdherence,
        int ratingCommunication,
        int ratingProactiveness,
        LocalDateTime createdAt
) {

    public static EvaluationResponse from(FreelancerEvaluation entity) {

        return new EvaluationResponse(
                entity.getId(),
                entity.getProject().getId(),
                entity.getClient().getId(),
                entity.getFreelancer().getId(),
                entity.getComment(),
                entity.getRatingSatisfaction(),
                entity.getRatingProfessionalism(),
                entity.getRatingScheduleAdherence(),
                entity.getRatingCommunication(),
                entity.getRatingProactiveness(),
                entity.getCreatedAt()
        );
    }

    public static EvaluationResponse from(ClientEvaluation entity) {

        return new EvaluationResponse(
                entity.getId(),
                entity.getProject().getId(),
                entity.getFreelancer().getId(),
                entity.getClient().getId(),
                entity.getComment(),
                entity.getRatingSatisfaction(),
                entity.getRatingProfessionalism(),
                entity.getRatingScheduleAdherence(),
                entity.getRatingCommunication(),
                entity.getRatingProactiveness(),
                entity.getCreatedAt()
        );
    }
}