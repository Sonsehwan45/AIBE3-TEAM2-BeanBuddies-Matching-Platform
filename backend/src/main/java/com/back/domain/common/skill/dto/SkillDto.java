package com.back.domain.common.skill.dto;

import com.back.domain.common.skill.entity.Skill;

public record SkillDto(
        Long id,
        String name
) {
    public SkillDto(Skill skill) {
        this(
                skill.getId(),
                skill.getName()
        );
    }
}
