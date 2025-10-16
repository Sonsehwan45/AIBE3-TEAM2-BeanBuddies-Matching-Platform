package com.back.domain.member.favorite.entity;

import com.back.domain.freelancer.freelancer.entity.Freelancer;
import com.back.domain.member.member.entity.Member;
import com.back.global.jpa.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor
@Table(name = "freelancer_favorite", uniqueConstraints = @UniqueConstraint(columnNames = {"member_id", "freelancer_id"}))
public class FreelancerFavorite extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "freelancer_id", nullable = false)
    private Freelancer freelancer;

    public FreelancerFavorite(Member member, Freelancer freelancer) {
        this.member = member;
        this.freelancer = freelancer;
    }
}
