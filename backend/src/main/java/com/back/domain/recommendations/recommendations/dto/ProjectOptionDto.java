package com.back.domain.recommendations.recommendations.dto;

import lombok.Getter;

@Getter
public class ProjectOptionDto {
    private final Long id;
    private final String title;
    private final String status;

    public ProjectOptionDto(Long id, String title, String status) {
        this.id = id;
        this.title = title;
        this.status = status;
    }
}