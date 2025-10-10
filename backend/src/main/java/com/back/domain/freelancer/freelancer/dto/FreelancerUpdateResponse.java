package com.back.domain.freelancer.freelancer.dto;

import com.back.domain.freelancer.freelancer.entity.Freelancer;
import java.util.Map;

public record FreelancerUpdateResponse(
        Long id,
        String job,
        String freelancerEmail,
        String comment,
        Map<String, Integer> career
) {
    public FreelancerUpdateResponse(Freelancer freelancer) {
        this (
                freelancer.getId(),
                freelancer.getJob(),
                freelancer.getFreelancerEmail(),
                freelancer.getComment(),
                freelancer.getCareer()
        );
    }
}
