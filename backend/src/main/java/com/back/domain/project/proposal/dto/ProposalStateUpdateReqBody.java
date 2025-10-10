package com.back.domain.project.proposal.dto;

import com.back.domain.project.proposal.constant.ProposalStatus;

public record ProposalStateUpdateReqBody (
        String status
) {
    public ProposalStatus toStatus() {
        return ProposalStatus.valueOf(this.status);
    }
}
