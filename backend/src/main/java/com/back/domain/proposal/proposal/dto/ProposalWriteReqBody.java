package com.back.domain.proposal.proposal.dto;


import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record ProposalWriteReqBody(
        @NotNull(message = "프리랜서 ID는 필수입니다.")
        Long freelancerId,

        @NotBlank(message = "메시지는 필수이며 공백일 수 없습니다.")
        String message
) {
}
