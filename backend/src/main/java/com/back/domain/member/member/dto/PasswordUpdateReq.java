package com.back.domain.member.member.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PasswordUpdateReq(
        @NotBlank String currentPassword,
        @NotBlank @Size(min = 4, max = 20) String newPassword,
        @NotBlank @Size(min = 4, max = 20) String newPasswordConfirm
) {
}
