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
import java.util.stream.Collectors;

@Getter
@Setter
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ProfileResponseDto {
    // Common Member fields
    private Long id;
    private String username;
    private String name;
    private String email;
    private Role role;
    private LocalDateTime createdAt;
    private String profileImgUrl;

    private double ratingAvg;

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
                .id(member.getId())
                .username(member.getUsername())
                .name(member.getName())
                .email(member.getEmail())
                .role(member.getRole())
                .createdAt(member.getCreateDate())
                .profileImgUrl(member.getProfileImgUrl());

        if (member.getRole() == Role.FREELANCER && member.getFreelancer() != null) {
            builder.job(member.getFreelancer().getJob())
                    .career(member.getFreelancer().getCareer())
                    .freelancerEmail(member.getFreelancer().getFreelancerEmail())
                    .comment(member.getFreelancer().getComment())
                    .ratingAvg(member.getFreelancer().getRatingAvg());

            // skills
            if (member.getFreelancer().getSkills() != null && !member.getFreelancer().getSkills().isEmpty()) {
                builder.skills(member.getFreelancer().getSkills().stream()
                        .map(fs -> fs.getSkill().getName())
                        .collect(Collectors.toList()));
            }

            // interests
            if (member.getFreelancer().getInterests() != null && !member.getFreelancer().getInterests().isEmpty()) {
                builder.interests(member.getFreelancer().getInterests().stream()
                        .map(fi -> fi.getInterest().getName())
                        .collect(Collectors.toList()));
            }

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
