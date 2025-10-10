package com.back.domain.application.application.dto;

import com.back.domain.application.application.constant.ApplicationStatus;
import com.back.domain.application.application.entity.Application;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ApplicationDto(
        Long id,
        BigDecimal estimatedPay,
        String expectedDuration,
        String workPlan,
        String additionalRequest,
        ApplicationStatus status,
        String freelancerName,
        Long freelancerId,
        String projectTitle,
        Long projectId,
        String clientName,
        Long clientId,
        LocalDateTime createDate,
        LocalDateTime modifyDate
) {
    public ApplicationDto(Application application) {
        this (
                application.getId(),
                application.getEstimatedPay(),
                application.getExpectedDuration(),
                application.getWorkPlan(),
                application.getAdditionalRequest(),
                application.getStatus(),
                application.getFreelancer().getMember().getName(),
                application.getFreelancer().getMember().getId(),
                application.getProject().getTitle(),
                application.getProject().getId(),
                application.getProject().getClient().getMember().getName(),
                application.getProject().getClient().getMember().getId(),
                application.getCreateDate(),
                application.getModifyDate()
        );
    }
}
