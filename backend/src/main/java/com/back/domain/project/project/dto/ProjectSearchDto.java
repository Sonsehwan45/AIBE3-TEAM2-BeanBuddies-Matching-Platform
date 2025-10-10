package com.back.domain.project.project.dto;

import com.back.domain.project.project.constant.ProjectStatus;

import java.util.List;

public record ProjectSearchDto(
        String keywordType,
        String keyword,
        List<Long> skillIds,
        List<Long> interestIds,
        ProjectStatus status
) {
    public boolean isEmpty() {
        return (keywordType == null || keywordType.isBlank())
                && (keyword == null || keyword.isBlank())
                && (skillIds == null || skillIds.isEmpty())
                && (interestIds == null || interestIds.isEmpty())
                && (status == null);
    }
}
