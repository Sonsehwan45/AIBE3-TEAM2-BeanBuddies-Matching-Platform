package com.back.domain.member.member.dto;

import com.back.domain.member.member.constant.Role;
import com.back.domain.member.member.entity.Member;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Getter
@Setter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ProfileResponseDto {
    // Common Member fields
    private String username;
    private String name;
    private Role role;
    private LocalDateTime createdAt;
    private String profileImgUrl;

    private float ratingAvg;

    // Freelancer fields
    private String job;
    private Map<String, Integer> career;
    private String freelancerEmail;
    private String comment;
    private List<String> skills;
    private List<String> interests;

    // Client fields
    private String companySize;
    private String companyDescription;
    private String representative;
    private String businessNo;
    private String companyPhone;
    private String companyEmail;

    public static ProfileResponseDto of(Member member) {
        ProfileResponseDtoBuilder builder = ProfileResponseDto.builder()
                .username(member.getUsername())
                .name(member.getName())
                .role(member.getRole())
                .createdAt(member.getCreateDate())
                .profileImgUrl(member.getProfileImgUrl());

        if (member.getRole() == Role.FREELANCER && member.getFreelancer() != null) {
            builder.job(member.getFreelancer().getJob())
                    .career(member.getFreelancer().getCareer())
                    .freelancerEmail(member.getFreelancer().getFreelancerEmail())
                    .comment(member.getFreelancer().getComment())
                    .ratingAvg(member.getFreelancer().getRatingAvg());
                    //.skills(member.getFreelancer().getFreelancerSkills().stream()
                    //        .map(fs -> fs.getSkill().getSkillName())
                    //        .collect(Collectors.toList()))
                    //.interests(member.getFreelancer().getFreelancerInterests().stream()
                    //        .map(fi -> fi.getInterest().getInterestName())
                    //        .collect(Collectors.toList()));
        } else if (member.getRole() == Role.CLIENT && member.getClient() != null) {
            builder.companySize(member.getClient().getCompanySize())
                    .companyDescription(member.getClient().getCompanyDescription())
                    .representative(member.getClient().getRepresentative())
                    .businessNo(member.getClient().getBusinessNo())
                    .companyPhone(member.getClient().getCompanyPhone())
                    .companyEmail(member.getClient().getCompanyEmail())
                    .ratingAvg(member.getClient().getRatingAvg());
        }

        return builder.build();
    }
}
