package com.back.domain.project.proposal.dto;

import com.back.domain.project.proposal.constant.ProposalStatus;
import com.back.domain.project.proposal.entity.Proposal;

public record ProposalDto(
        Long id,
        String message,
        Long projectId,
        Long freelancerId,
        String freelancerName,
        Long clientId,
        String clientName,
        ProposalStatus status
) {
    public ProposalDto(Proposal proposal) {
        this(
                proposal.getId(),
                proposal.getMessage(),
                proposal.getProject().getId(),
                proposal.getFreelancer().getId(),
                proposal.getFreelancer().getMember().getName(),
                proposal.getProject().getClient().getId(),
                proposal.getProject().getClient().getMember().getName(),
                proposal.getStatus()
        );
    }
}
