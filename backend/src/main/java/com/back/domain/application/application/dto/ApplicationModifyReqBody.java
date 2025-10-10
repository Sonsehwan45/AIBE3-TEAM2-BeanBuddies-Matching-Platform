package com.back.domain.application.application.dto;

import com.back.domain.application.application.constant.ApplicationStatus;
import jakarta.validation.constraints.NotNull;

public record ApplicationModifyReqBody(
        @NotNull(message = "지원서 상태값은 필수입니다.")
        ApplicationStatus status
) {
}
