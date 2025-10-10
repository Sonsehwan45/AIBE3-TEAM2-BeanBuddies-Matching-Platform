package com.back.domain.freelancer.freelancer.dto;

import java.util.List;

public record FreelancerFilterDto(
        String career,
        Float ratingAvg,
        String Interset,
        List<String> skills
) {
}
