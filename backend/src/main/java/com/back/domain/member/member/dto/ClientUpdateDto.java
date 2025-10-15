package com.back.domain.member.member.dto;

import com.back.domain.member.member.constant.ProfileScope;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ClientUpdateDto {
    // Common Member fields
    private String name;
    private String email;
    private String profileImgUrl;
    private ProfileScope profileScope;

    // Client fields
    private String companySize;
    private String companyDescription;
    private String representative;
    private String businessNo;
    private String companyPhone;
    private String companyEmail;
}
