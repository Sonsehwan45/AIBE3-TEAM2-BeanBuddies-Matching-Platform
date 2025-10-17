package com.back.domain.freelancer.freelancer.entity;

import com.back.domain.application.application.entity.Application;
import com.back.domain.common.interest.entity.Interest;
import com.back.domain.common.skill.entity.Skill;
import com.back.domain.freelancer.join.entity.FreelancerInterest;
import com.back.domain.freelancer.join.entity.FreelancerSkill;
import com.back.domain.member.member.entity.Member;
import com.back.domain.project.participant.entity.ProjectParticipant;
import com.back.domain.proposal.proposal.entity.Proposal;
import com.back.standard.converter.JsonConverter;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.validation.constraints.Email;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@NoArgsConstructor
@Getter
public class Freelancer {

    @Id
    private Long id;

    @MapsId
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id")
    private Member member;

    private String job;

    @Email
    private String freelancerEmail;

    private String comment;

    @Convert(converter = JsonConverter.class)
    @Column(columnDefinition = "TEXT")
    private Map<String, Integer> career;

    private Integer careerTotalYears;

    @Column(name = "rating_avg")
    private double ratingAvg;

    @OneToMany(mappedBy = "freelancer", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<FreelancerSkill> skills = new ArrayList<>();

    @OneToMany(mappedBy = "freelancer", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<FreelancerInterest> interests = new ArrayList<>();

    //프리랜서와 지원서, 제안서 연결
    @OneToMany(mappedBy = "freelancer", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Application> applications = new ArrayList<>();

    @OneToMany(mappedBy = "freelancer", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Proposal> proposals = new ArrayList<>();

    @OneToMany(mappedBy = "freelancer", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProjectParticipant> myProjects = new ArrayList<>();

    public Freelancer(Member member) {
        this.member = member;
    }

    public void join(Member member) {
        this.member = member;
    }

    // 프리랜서 정보 수정
    // NOTE : 현재 Freelancer의 대부분의 필드는 null 허용이므로, null 체크는 하지 않음.
    // 다만 null 비허용으로 하고 초기 생성시, 빈 문자열로 초기화하는 방안도 고려할 수 있음.
    public void updateInfo(String job, String freelancerEmail, String comment, Map<String, Integer> career) {
        this.job = job;
        this.freelancerEmail = freelancerEmail;
        this.comment = comment;
        this.career = career;
        computeCareerTotalYears();
    }

    private void computeCareerTotalYears() {
        if (career == null || career.isEmpty()) {
            return;
        }
        this.careerTotalYears = career.values().stream().mapToInt(Integer::intValue).sum() / 12;
    }

    public void updateSkills(List<Skill> newSkills) {
        skills.clear();
        newSkills.forEach(skill -> skills.add(new FreelancerSkill(this, skill)));
    }

    public void updateInterests(List<Interest> findInterests) {
        interests.clear();
        findInterests.forEach((interest -> interests.add(new FreelancerInterest(this, interest))));
    }


    //이미 계산된 평가 평균을 소수점 첫째 자리까지 반올림하기 위한 메서드
    public void updateRatingAvg(double ratingAvg) {
        this.ratingAvg = Math.round(ratingAvg * 10.0) / 10.0;
    }

    //회원 탈퇴
    public void deleteInfo() {
        this.job = null;
        this.freelancerEmail = null;
        this.comment = null;
        this.career = null;
        this.careerTotalYears = null;

        if (skills != null && !skills.isEmpty()) {
            skills.clear();
        }

        if (interests != null && !interests.isEmpty()) {
            interests.clear();
        }
    }
}
