package com.back.domain.member.favorite.dto;

import jakarta.validation.constraints.NotNull;

public record FavoriteProjectReq(
        @NotNull
        Long projectId
) {}

