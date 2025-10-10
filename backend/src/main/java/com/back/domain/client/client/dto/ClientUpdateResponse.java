package com.back.domain.client.client.dto;

import com.back.domain.client.client.entity.Client;

public record ClientUpdateResponse(
        Long id,
        String companySize,
        String companyDescription,
        String representative,
        String businessNo,
        String companyPhone,
        String companyEmail
) {
    public ClientUpdateResponse(Client client) {
        this(
                client.getId(),
                client.getCompanySize(),
                client.getCompanyDescription(),
                client.getRepresentative(),
                client.getBusinessNo(),
                client.getCompanyPhone(),
                client.getCompanyEmail()
        );
    }
}
