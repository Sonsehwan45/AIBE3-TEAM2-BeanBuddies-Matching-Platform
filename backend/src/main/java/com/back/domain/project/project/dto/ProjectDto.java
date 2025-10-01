package com.back.domain.project.project.dto;

import com.back.domain.common.interest.dto.InterestDto;
import com.back.domain.common.skill.dto.SkillDto;
import com.back.domain.project.project.constant.ProjectStatus;
import com.back.domain.project.project.entity.Project;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record ProjectDto(
        Long id,
        String title,
        String summary,
        String duration,
        BigDecimal price,
        String preferredCondition,
        String payCondition,
        String workingCondition,
        String description,
        LocalDateTime deadline,
        ProjectStatus status,
        LocalDateTime createDate,
        LocalDateTime modifyDate,
        List<SkillDto> skills,
        List<InterestDto> interests
) {
    public ProjectDto (Project project, List<SkillDto> skills, List<InterestDto> interests) {
        this(
                project.getId(),
                project.getTitle(),
                project.getSummary(),
                project.getDuration(),
                project.getPrice(),
                project.getPreferredCondition(),
                project.getPayCondition(),
                project.getWorkingCondition(),
                project.getDescription(),
                project.getDeadline(),
                project.getStatus(),
                project.getCreateDate(),
                project.getModifyDate(),
                skills,
                interests
        );
    }
}
