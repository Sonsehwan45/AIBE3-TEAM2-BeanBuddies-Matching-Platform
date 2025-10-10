package com.back.domain.application.application.dto;

import com.back.domain.application.application.constant.ApplicationStatus;
import com.back.domain.application.application.entity.Application;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ApplicationSummaryDto(
        Long id,
        BigDecimal estimatedPay,
        String expectedDuration,
        String workPlan,
        ApplicationStatus status,
        String freelancerName,
        Long freelancerId,
        String projectTitle,
        Long projectId,
        LocalDateTime createDate
) {
    public ApplicationSummaryDto(Application application) {
        this (
                application.getId(),
                application.getEstimatedPay(),
                application.getExpectedDuration(),
                application.getWorkPlan(),
                application.getStatus(),
                application.getFreelancer().getMember().getName(),
                application.getFreelancer().getId(),
                application.getProject().getTitle(),
                application.getProject().getId(),
                application.getCreateDate()
        );
    }
}
