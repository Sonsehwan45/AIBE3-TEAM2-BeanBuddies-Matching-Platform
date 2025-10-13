package com.back.domain.proposal.proposal.dto;

import com.back.domain.proposal.proposal.constant.ProposalStatus;
import jakarta.validation.constraints.NotNull;

public record ProposalStateUpdateReqBody (
        @NotNull
        String status
) {
    public ProposalStatus toStatus() {
        return ProposalStatus.getProposalStatus(this.status);
    }
}
