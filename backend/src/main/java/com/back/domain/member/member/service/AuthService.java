package com.back.domain.member.member.service;

import com.back.domain.member.member.constant.MemberStatus;
import com.back.domain.member.member.constant.Role;
import com.back.domain.member.member.entity.Member;
import com.back.global.exception.ServiceException;
import com.back.global.jwt.JwtProvider;
import com.back.global.security.TokenBlacklistService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final JwtProvider jwtProvider;
    private final MemberService memberService;
    private final TokenBlacklistService tokenBlacklistService;

    public Map<String, Object> login(String username, String password) {
        //가입된 ID인지 확인
        Member member = memberService.findByUsername(username)
                .orElseThrow(() -> new ServiceException("401-1", "존재하지 않는 회원입니다."));

        //password 일치하는지 확인
        memberService.checkPassword(member, password);

        //토큰 생성
        String accessToken = genAccessToken(member);
        String refreshToken = genRefreshToken(member);

        //결과 반환
        return Map.of(
                "member", member,
                "accessToken", accessToken,
                "refreshToken", refreshToken
        );
    }

    private String genAccessToken(Member member) {

        //claim 설정 (아이디, 이름, 역할, 상태, 프로필 이미지)
        long id = member.getId();
        String name = member.getName();
        Role role = member.getRole();
        MemberStatus status = member.getStatus();
        //String profileImgUrl = member.getProfileImgUrl()

        Map<String, Object> claims = Map.of("id", id, "name", name, "role", role.name(), "status", status.name());

        return jwtProvider.genAccessToken(claims);
    }

    private String genRefreshToken(Member member) {

        //claim 설정 (아이디)
        long id = member.getId();

        Map<String, Object> claims = Map.of("id", id);

        return jwtProvider.genRefreshToken(claims);
    }

    public String reissueAccessToken(Member member) {
        return genAccessToken(member);
    }

    public void addBlacklistToken(String accessToken) {
        if(accessToken == null || accessToken.isBlank()) return;

        tokenBlacklistService.addBlacklistToken(accessToken);
    }
}
