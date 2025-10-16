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
    private String email;
    private String profileImgUrl;
    private ProfileScope profileScope;

    // Freelancer fields
    private String job;
    private Map<String, Integer> career;
    private String freelancerEmail;
    private String comment;
    private List<String> skills;
    private List<String> interests;
    // 프론트에서 넘겨주는 스킬 ID 배열을 처리하기 위한 필드 (이름 기반과 병행 지원)
    private List<Long> skillIds;
}
