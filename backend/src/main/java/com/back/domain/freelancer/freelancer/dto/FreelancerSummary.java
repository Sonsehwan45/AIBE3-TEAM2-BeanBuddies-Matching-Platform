package com.back.domain.freelancer.freelancer.dto;

import com.back.domain.common.skill.dto.SkillDto;
import com.back.domain.freelancer.freelancer.constant.CareerLevel;
import com.back.domain.freelancer.freelancer.entity.Freelancer;
import com.back.domain.freelancer.join.entity.FreelancerSkill;
import java.util.List;

public record FreelancerSummary(
        Long id,
        String name,
        CareerLevel careerLevel,
        float ratingAvg,
        List<SkillDto> skills
) {
    public FreelancerSummary(Freelancer freelancer) {
        this(
                freelancer.getMember().getId(),
                freelancer.getMember().getName(),
                CareerLevel.of(freelancer.getCareerTotalYears()),
                freelancer.getRatingAvg(),
                freelancer.getSkills().stream()
                        .map(FreelancerSkill::getSkill)
                        .map(SkillDto::new)
                        .toList()
        );
    }

    public FreelancerSummary(Long id, String name, Integer careerTotalYears, float ratingAvg, List<SkillDto> skills) {
        this(
                id,
                name,
                CareerLevel.of(careerTotalYears),
                ratingAvg,
                skills
        );
    }
}
