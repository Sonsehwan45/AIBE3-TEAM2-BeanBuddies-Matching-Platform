package com.back.domain.freelancer.freelancer.dto;

import com.back.domain.freelancer.freelancer.constant.CareerLevel;
import java.util.List;

public record FreelancerSearchCondition(
        String searchKeyword,
        CareerLevel careerLevel,
        Float ratingAvg,
        List<Long> skillIds,
        List<Long> interestIds
) {
    public FreelancerSearchCondition(CareerLevel careerLevel, Float ratingAvg, List<Long> skillIds) {
        this(null, careerLevel, ratingAvg, skillIds, List.of());
    }
}
