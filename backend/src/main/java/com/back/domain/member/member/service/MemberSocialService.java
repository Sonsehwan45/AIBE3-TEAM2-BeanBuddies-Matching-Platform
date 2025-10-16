package com.back.domain.member.member.service;

import com.back.domain.member.member.constant.SocialProvider;
import com.back.domain.member.member.entity.Member;
import com.back.domain.member.member.entity.MemberSocial;
import com.back.domain.member.member.repository.MemberRepository;
import com.back.domain.member.member.repository.MemberSocialRepository;
import com.back.global.exception.ServiceException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MemberSocialService {

    private final MemberSocialRepository memberSocialRepository;
    private final MemberRepository memberRepository;
    private final KakaoService kakaoService;

    // 로그인 상태에서 소셜 계정 연동
    public MemberSocial linkSocialAccount(Long memberId, SocialProvider provider, String providerId) {
        //회원 확인
        Member member = memberRepository.findById(memberId)
                .orElseThrow(() -> new ServiceException("400-1", "회원 정보를 찾을 수 없습니다."));
        
        //이미 연동된 소셜 계정인지 확인
        if(memberSocialRepository.findByProviderAndProviderId(provider, providerId).isPresent()) {
            throw new ServiceException("400-2", "이미 연동된 소셜 계정입니다.");
        }
        
        //DB 저장
        MemberSocial memberSocial = new MemberSocial(member, provider, providerId);
        return memberSocialRepository.save(memberSocial);
    }

    // authorization code로 providerId 추출
    public String getProviderIdFromLoginCode(SocialProvider provider, String code) {
        if (provider == SocialProvider.KAKAO) {
            // 로그인용 code → access token → providerId
            return kakaoService.getUserIdFromLoginCode(code);
        }
        throw new ServiceException("400-3", "지원하지 않는 소셜 로그인입니다.");
    }

    public String getProviderIdFromLinkCode(SocialProvider provider, String code) {
        if (provider == SocialProvider.KAKAO) {
            return kakaoService.getUserIdFromLinkCode(code);
        }
        throw new ServiceException("400-3", "지원하지 않는 소셜 로그인입니다.");
    }

    // 연동된 계정 목록 조회
    public List<MemberSocial> getLinkedAccounts(Long memberId) {
        return memberSocialRepository.findAllByMemberId(memberId);
    }

    //provider와 providerId로 member 찾기
    public Member findMemberByProviderAndProviderId(SocialProvider socialProvider, String providerId) {
        return memberSocialRepository.findByProviderAndProviderId(socialProvider, providerId)
                .orElseThrow(() -> new ServiceException("400-4", "연동된 회원을 찾을 수 없습니다. 일반 로그인 후 계정 연동을 진행해주세요."))
                .getMember();
    }

    //memberId와 provider로 연결 해제
    public void removeLinkedSocialAccount(Long memberId, SocialProvider provider) {
        Optional<MemberSocial> socialOpt = memberSocialRepository.findByMemberIdAndProvider(memberId, provider);

        if (socialOpt.isPresent()) {
            memberSocialRepository.delete(socialOpt.get());
        } else {
            throw new ServiceException("400-4", "연동된 계정이 없습니다.");
        }
    }
}
