package com.back.domain.freelancer.freelancer.dto;

import java.util.Map;

public record FreelancerUpdateForm(
        Long id,
        String job,
        String freelancerEmail,
        String comment,
        Map<String, Integer> career
) {
}
