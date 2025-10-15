package com.back.domain.member.member.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PasswordResetEmailReq(
        @NotBlank @Size(min = 2, max = 20) String username,
        @NotBlank @Email String email
) {
}
