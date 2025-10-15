package com.back.domain.recommendations.recommendations.entity;

import com.back.domain.freelancer.join.entity.FreelancerSkill;
import com.back.domain.member.member.constant.MemberStatus;
import com.back.standard.converter.CareerConverter;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Immutable;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Getter
@NoArgsConstructor
@Entity
@Table(name = "freelancer_search")
@Immutable
public class FreelancersSearch {


    @Id
    @Column(name = "id")
    private Long id;

    @Column(name = "freelancer_id")
    private Long freelancerId;

    @Enumerated(EnumType.STRING)
    private MemberStatus status;   // 새 컬럼

    private String job;

    @Column(name = "one_liner")
    private String comment;

    @Convert(converter = CareerConverter.class)
    @Column(name = "career", columnDefinition = "TEXT") // Map -> TEXT(JSON)로 저장
    private Map<String, Integer> career;

    @Column(name = "rating_avg")
    private float ratingAvg;

    @Column(name = "tech_stack", columnDefinition = "TEXT")
    private String techStack;

    @Transient
    private List<FreelancerSkill> skills = new ArrayList<>();
}