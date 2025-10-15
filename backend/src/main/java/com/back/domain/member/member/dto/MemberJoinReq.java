package com.back.domain.member.member.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record MemberJoinReq(
        String profileImgUrl,
        @NotBlank
        String role,
        @NotBlank @Size(min = 2, max = 20)
        String name,
        @NotBlank @Size(min = 2, max = 20)
        String username,
        @NotBlank @Size(min = 4, max = 20)
        String password,
        @NotBlank @Size(min = 4, max = 20)
        String passwordConfirm,
        @NotBlank @Email
        String email
) {
}
