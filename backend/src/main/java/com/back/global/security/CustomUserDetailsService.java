package com.back.global.security;

import com.back.domain.member.member.entity.Member;
import com.back.domain.member.member.service.MemberService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

/**
 * 테스트를 위한 클래스입니다.
 *
 * - 실제 개발/운영 환경에서는 사용되지 않음
 * - 테스트에서 @WithUserDetails 사용을 위해 구현됨
 */
@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final MemberService memberService;
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Member member = memberService.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException(username + " 회원을 찾을 수 없습니다."));
        return new CustomUserDetails(
                member.getId(),
                member.getName(),
                member.getRole().name(),
                member.getStatus().name(),
                member.getProfileImgUrl()
        );
    }
}
