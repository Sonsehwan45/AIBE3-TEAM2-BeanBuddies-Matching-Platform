package com.back.domain.freelancer.freelancer.dto;

import com.back.domain.freelancer.freelancer.constant.CareerLevel;
import java.util.List;

public record FreelancerSearchCondition(
        CareerLevel careerLevel,
        Float ratingAvg,
        List<Long> skillIds
) {
}
