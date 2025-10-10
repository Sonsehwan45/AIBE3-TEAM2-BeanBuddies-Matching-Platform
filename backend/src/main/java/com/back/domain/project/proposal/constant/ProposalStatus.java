package com.back.domain.project.proposal.constant;

public enum ProposalStatus {
    WAIT("대기"),
    ACCEPT("수락"),
    DENIED("거절");

    private final String label;

    ProposalStatus(String label) {
        this.label = label;
    }
}
