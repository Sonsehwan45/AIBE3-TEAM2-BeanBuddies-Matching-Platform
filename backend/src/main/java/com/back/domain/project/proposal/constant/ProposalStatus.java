package com.back.domain.project.proposal.constant;

import java.util.Arrays;

public enum ProposalStatus {
    WAIT("대기"),
    ACCEPT("수락"),
    DENIED("거절");

    private final String label;

    ProposalStatus(String label) {
        this.label = label;
    }

    public static ProposalStatus getProposalStatus(String status) {
        for (ProposalStatus proposalStatus : ProposalStatus.values()) {
            if (proposalStatus.name().equals(status)) {
                return proposalStatus;
            }
        }

        throw new IllegalArgumentException("ProposalStatus는 " + status + "가 없습니다.\n"
                + "ProposalStatus는 " + Arrays.stream(ProposalStatus.values()).toList() + "만 가능합니다.");
    }
}
