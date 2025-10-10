package com.back.domain.application.application.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record ApplicationWriteReqBody(
        @NotNull(message = "예상 급여는 필수입니다.")
        @DecimalMin(value = "0", inclusive = false, message = "예상 급여는 0보다 커야 합니다.")
        BigDecimal estimatedPay,

        @NotBlank(message = "예산 기간은 필수입니다.")
        String expectedDuration,

        @NotBlank(message = "작업 계획은 필수입니다.")
        String workPlan,

        @NotBlank(message = "추가 요청사항은 필수입니다.")
        String additionalRequest
) {

}
