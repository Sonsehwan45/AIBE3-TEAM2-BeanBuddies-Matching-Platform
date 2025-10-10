package com.back.domain.client.client.dto;

public record ClientUpdateForm(
        String companySize,
        String companyDescription,
        String representative,
        String businessNo,
        String companyPhone,
        String companyEmail
) {
}
