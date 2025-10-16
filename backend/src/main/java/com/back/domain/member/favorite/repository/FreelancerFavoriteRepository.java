package com.back.domain.member.favorite.repository;

import com.back.domain.member.favorite.entity.FreelancerFavorite;
import com.back.domain.member.member.entity.Member;
import com.back.domain.freelancer.freelancer.entity.Freelancer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FreelancerFavoriteRepository extends JpaRepository<FreelancerFavorite, Long> {
    List<FreelancerFavorite> findAllByMember(Member member);
    Optional<FreelancerFavorite> findByMemberAndFreelancer(Member member, Freelancer freelancer);
    void deleteByMemberAndFreelancer(Member member, Freelancer freelancer);
}

