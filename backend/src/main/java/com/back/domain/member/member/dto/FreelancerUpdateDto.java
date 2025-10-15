package com.back.domain.member.member.dto;

import com.back.domain.member.member.constant.ProfileScope;
import lombok.Getter;
import lombok.Setter;

import java.util.List;
import java.util.Map;

@Getter
@Setter
public class FreelancerUpdateDto {
    // Common Member fields
    private String name;
    private String profileImgUrl;
    private ProfileScope profileScope;

    // Freelancer fields
    private String job;
    private Map<String, Integer> career;
    private String freelancerEmail;
    private String comment;
    private List<String> skills;
    private List<String> interests;
}
