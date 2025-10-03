package com.back.domain.member.member.controller;

import com.back.domain.member.member.dto.MemberDto;
import com.back.domain.member.member.entity.Member;
import com.back.domain.member.member.service.MemberService;
import com.back.global.response.ApiResponse;
import com.back.global.security.CustomUserDetails;
import com.back.global.security.annotation.CheckActive;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * 인증/인가 기능 테스트용 Controller입니다.
 *
 * - Postman 및 테스트 케이스에서 정상 동작 확인용
 * - 개발 중 예시로 활용 가능
 *
 * 개발 완료 후에는 반드시 제거해야 합니다.
 */
@RestController
@RequestMapping("/api/v1/test")
@RequiredArgsConstructor
public class AuthTestController {

    private final MemberService memberService;

    // 인증 필요 없음
    @GetMapping("/public")
    public ApiResponse<Void> publicEndpoint() {
        return new ApiResponse<>("200", "누구나 접근 가능");
    }

    // 인증된 사용자만 접근 가능 + ACTIVE 상태 체크
    @GetMapping("/auth")
    @CheckActive
    public ApiResponse<MemberDto> authenticatedUserEndpoint(@AuthenticationPrincipal CustomUserDetails user) {

        if (!user.isActive()) {
            return new ApiResponse<>("403-2", "비활성 계정입니다.");
        }

        return new ApiResponse<>("200", "인증된 사용자 접근 성공", new MemberDto(user));
    }

    // 클라이언트만 접근 가능 + ACTIVE 상태 체크
    @GetMapping("/auth/client")
    @CheckActive
    public ApiResponse<MemberDto> clientEndpoint(@AuthenticationPrincipal CustomUserDetails user) {

        return new ApiResponse<>("200", "클라이언트 접근 성공", new MemberDto(user));
    }

    // 프리랜서만 접근 가능 + ACTIVE 상태 체크
    @GetMapping("/auth/freelancer")
    @CheckActive
    public ApiResponse<MemberDto> freelanceEndpoint(@AuthenticationPrincipal CustomUserDetails user) {

        return new ApiResponse<>("200", "프리랜서 접근 성공", new MemberDto(user));
    }

    // 관리자만 접근 가능
    @GetMapping("/auth/admin")
    public ApiResponse<MemberDto> adminEndpoint(@AuthenticationPrincipal CustomUserDetails user) {

        return new ApiResponse<>("200", "관리자 접근 성공", new MemberDto(user));
    }

    // 인증 정보를 통해 member 객체 조회
    @GetMapping("/auth/me")
    public ApiResponse<MemberDto> myInfo(@AuthenticationPrincipal CustomUserDetails user) {

        // DB에서 실제 Member 객체 조회
        Member member = memberService.findById(user.getId());

        return new ApiResponse<>("200", "내 정보 조회 성공", new MemberDto(member));
    }
}
