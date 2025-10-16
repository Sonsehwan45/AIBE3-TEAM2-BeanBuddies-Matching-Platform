package com.back.domain.member.favorite.dto;

import jakarta.validation.constraints.NotNull;

public record FavoriteFreelancerReq(
        @NotNull
        Long userId
) {}

