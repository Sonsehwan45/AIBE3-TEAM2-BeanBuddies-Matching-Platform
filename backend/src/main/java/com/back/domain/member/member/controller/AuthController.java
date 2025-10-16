package com.back.domain.member.member.controller;

import com.back.domain.member.member.constant.SocialProvider;
import com.back.domain.member.member.dto.MemberDto;
import com.back.domain.member.member.dto.MemberLoginReq;
import com.back.domain.member.member.entity.Member;
import com.back.domain.member.member.service.AuthService;
import com.back.domain.member.member.service.KakaoService;
import com.back.domain.member.member.service.MemberSocialService;
import com.back.global.response.ApiResponse;
import com.back.global.web.CookieHelper;
import com.back.global.web.HeaderHelper;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final MemberSocialService memberSocialService;
    private final KakaoService kakaoService;
    private final CookieHelper cookieHelper;
    private final HeaderHelper headerHelper;

    @PostMapping("/login")
    public ApiResponse<MemberDto> login(@Valid @RequestBody MemberLoginReq reqBody) {

        Map<String, Object> loginResult = authService.login(
                reqBody.username(),
                reqBody.password()
        );

        Member member = (Member) loginResult.get("member");
        String accessToken = (String) loginResult.get("accessToken");
        String refreshToken = (String) loginResult.get("refreshToken");

        headerHelper.setHeader("Authorization", "Bearer " + accessToken);
        cookieHelper.setCookie("refreshToken", refreshToken);

        return new ApiResponse<>(
                "200-1",
                "%s님 환영합니다. 로그인이 완료되었습니다.".formatted(member.getName()),
                new MemberDto(member)
        );
    }

    @PostMapping("/logout")
    public ApiResponse<Void> logout() {

        String accessToken = headerHelper.getHeader("Authorization", "");
        if(accessToken != null && accessToken.startsWith("Bearer ")) {
            accessToken = accessToken.replace("Bearer ", "");
            authService.addBlacklistToken(accessToken);
        }

        cookieHelper.deleteCookie("refreshToken");
        headerHelper.setHeader("Authorization", null);

        return new ApiResponse<>(
                "200-2",
                "로그아웃이 완료되었습니다."
        );

    }

    @GetMapping("/oauth/kakao/login")
    public void redirectToKakaoLogin(
            HttpServletResponse response
    ) throws IOException {
        String clientId = kakaoService.getClientId();
        String redirectUri = kakaoService.getLoginRedirectUri();

        // 카카오 로그인 URL 구성
        String url = "https://kauth.kakao.com/oauth/authorize" +
                "?response_type=code" +
                "&client_id=" + clientId +
                "&redirect_uri=" + redirectUri +
                "&prompt=login";

        response.sendRedirect(url);
    }

    @GetMapping("/oauth/kakao/login/callback")
    public void kakaoLoginCallback(
            @RequestParam String code,
            HttpServletResponse response
    ) throws IOException {

        String providerId = memberSocialService.getProviderIdFromLoginCode(SocialProvider.KAKAO, code);

        Map<String, Object> loginResult = authService.loginWithSocial(SocialProvider.KAKAO, providerId);

        Member member = (Member) loginResult.get("member");
        Long id = member.getId();
        String name = member.getName();
        String role = member.getRole().name();
        String status = member.getStatus().name();
        String profileImg = member.getProfileImgUrl();

        //헤더/쿠키 세팅
        String accessToken = (String) loginResult.get("accessToken");
        String refreshToken = (String) loginResult.get("refreshToken");
        cookieHelper.setCookie("refreshToken", refreshToken);

        String redirectUrl = String.format(
                "http://localhost:3000/login#accessToken=%s&id=%d&name=%s&role=%s&status=%s&profileImg=%s",
                accessToken,
                id,
                encodeValue(name),
                encodeValue(role),
                encodeValue(status),
                encodeValue(profileImg)
        );

        response.sendRedirect(redirectUrl);
    }

    // URL 인코딩
    private String encodeValue(String value) {
        try {
            return java.net.URLEncoder.encode(value, "UTF-8");
        } catch (Exception e) {
            return "";
        }
    }

}
