package com.back.domain.member.member.controller;

import com.back.domain.member.member.dto.MemberDto;
import com.back.domain.member.member.dto.MemberLoginReq;
import com.back.domain.member.member.entity.Member;
import com.back.domain.member.member.service.AuthService;
import com.back.global.response.ApiResponse;
import com.back.global.web.CookieHelper;
import com.back.global.web.HeaderHelper;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
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
}
