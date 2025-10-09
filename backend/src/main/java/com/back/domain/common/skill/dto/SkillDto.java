package com.back.domain.common.skill.dto;

import com.back.domain.common.skill.entity.Skill;
import com.querydsl.core.annotations.QueryProjection;

public record SkillDto(
        Long id,
        String name
) {
    public SkillDto (Skill skill) {
        this(
                skill.getId(),
                skill.getName()
        );
    }
}
