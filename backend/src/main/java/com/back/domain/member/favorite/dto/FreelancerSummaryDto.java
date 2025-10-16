package com.back.domain.member.favorite.dto;

import com.back.domain.freelancer.freelancer.entity.Freelancer;

public record FreelancerSummaryDto(
        Long id,
        Long memberId,
        String name,
        String profileImgUrl,
        String job,
        Double ratingAvg
) {
    public FreelancerSummaryDto(Freelancer f) {
        this(
                f.getId(),
                f.getMember().getId(),
                f.getMember().getName(),
                f.getMember().getProfileImgUrl(),
                f.getJob(),
                f.getRatingAvg()
        );
    }
}

