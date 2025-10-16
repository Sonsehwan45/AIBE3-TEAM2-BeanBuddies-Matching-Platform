package com.back.domain.freelancer.freelancer.dto;

import com.back.domain.common.interest.dto.InterestDto;
import com.back.domain.common.interest.entity.Interest;
import com.back.domain.common.skill.dto.SkillDto;
import com.back.domain.freelancer.freelancer.constant.CareerLevel;
import com.back.domain.freelancer.freelancer.entity.Freelancer;
import com.back.domain.freelancer.join.entity.FreelancerInterest;
import com.back.domain.freelancer.join.entity.FreelancerSkill;
import java.util.List;

public record FreelancerSummary(
        Long id,
        String name,
        CareerLevel careerLevel,
        double ratingAvg,
        List<SkillDto> skills,
        List<InterestDto> interests
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
                        .toList(),
                freelancer.getInterests().stream()
                        .map(FreelancerInterest::getInterest)
                        .map(InterestDto::new)
                        .toList()
        );
    }

    public FreelancerSummary(Long id, String name, Integer careerTotalYears, double ratingAvg, List<SkillDto> skills, List<InterestDto> interests) {
        this(
                id,
                name,
                CareerLevel.of(careerTotalYears),
                ratingAvg,
                skills,
                interests
        );
    }
}
