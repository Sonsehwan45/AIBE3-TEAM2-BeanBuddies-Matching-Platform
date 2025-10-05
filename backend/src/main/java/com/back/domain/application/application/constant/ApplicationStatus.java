package com.back.domain.application.application.constant;

import lombok.Getter;

@Getter
public enum ApplicationStatus {
    WAIT("대기"),
    ACCEPT("수락"),
    DENIED("거절");

    private final String label;

    ApplicationStatus(String label) {
        this.label = label;
    }
}
