package com.back.domain.project.project.dto;

import com.back.domain.common.interest.dto.InterestDto;
import com.back.domain.common.skill.dto.SkillDto;
import com.back.domain.project.project.constant.ProjectStatus;
import com.back.domain.project.project.entity.Project;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public record ProjectSummaryDto(
        Long id,
        String title,
        String summary,
        ProjectStatus status,
        String ownerName,
        String duration,
        BigDecimal price,
        LocalDate deadline,
        LocalDateTime createDate,
        List<SkillDto> skills,
        List<InterestDto> interests
) {
    public ProjectSummaryDto(Project project, List<SkillDto> skills, List<InterestDto> interests) {
        this(
                project.getId(),
                project.getTitle(),
                project.getSummary(),
                project.getStatus(),
                project.getOwner().getName(), // 필요시 getter 추가
                project.getDuration(),
                project.getPrice(),
                project.getDeadline().toLocalDate(), // LocalDate만 사용
                project.getCreateDate(),
                skills,
                interests
        );
    }
}
