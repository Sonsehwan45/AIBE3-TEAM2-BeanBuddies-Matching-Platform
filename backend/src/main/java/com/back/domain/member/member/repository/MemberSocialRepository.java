package com.back.domain.member.member.repository;

import com.back.domain.member.member.constant.SocialProvider;
import com.back.domain.member.member.entity.MemberSocial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MemberSocialRepository extends JpaRepository<MemberSocial, Long> {

    Optional<MemberSocial> findByProviderAndProviderId(SocialProvider provider, String providerId);

    Optional<MemberSocial> findByMemberIdAndProvider(Long memberId, SocialProvider provider);

    List<MemberSocial> findAllByMemberId(Long memberId);
}
