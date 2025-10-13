package com.back.domain.member.member.dto;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ClientUpdateDto {
    // Common Member fields
    private String name;
    private String profileImgUrl;

    // Client fields
    private String companySize;
    private String companyDescription;
    private String representative;
    private String businessNo;
    private String companyPhone;
    private String companyEmail;
}
