package com.back.domain.freelancer.freelancer.entity;

import com.back.domain.freelancer.join.entity.FreelancerInterest;
import com.back.domain.freelancer.join.entity.FreelancerSkill;
import com.back.domain.member.member.entity.Member;
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
    //읽기전용?
    private float ratingAvg;

    @OneToMany(mappedBy = "freelancer", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<FreelancerSkill> skills = new ArrayList<>();

    @OneToMany(mappedBy = "freelancer", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<FreelancerInterest> interests = new ArrayList<>();

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
}
