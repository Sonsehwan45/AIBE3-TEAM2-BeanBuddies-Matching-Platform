package com.back.domain.member.member.dto;

import com.back.domain.member.member.entity.Member;
import com.back.global.security.CustomUserDetails;

public record MemberDto(
        Long id,
        String name,
        String role,
        String status
) {
    public MemberDto(Member member) {
        this(
                member.getId(),
                member.getName(),
                member.getRole().name(),
                member.getStatus().name()
        );
    }

    public MemberDto(CustomUserDetails user) {
        this(
                user.getId(),
                user.getName(),
                user.getRole(),
                user.getStatus()
        );
    }
}
