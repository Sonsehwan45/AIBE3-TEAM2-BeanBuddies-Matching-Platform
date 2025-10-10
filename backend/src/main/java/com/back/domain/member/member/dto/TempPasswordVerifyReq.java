package com.back.domain.member.member.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record TempPasswordVerifyReq(
        @NotBlank String username,
        @NotBlank @Email String email,
        @NotBlank String code
) {
}
