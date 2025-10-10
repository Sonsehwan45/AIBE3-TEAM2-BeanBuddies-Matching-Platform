package com.back.domain.project.proposal.dto;


public record ProposalWriteReqBody(
        Long freelancerId,
        String message
) {
}
