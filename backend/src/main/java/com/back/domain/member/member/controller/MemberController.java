package com.back.domain.member.member.controller;

import com.back.domain.member.member.constant.Role;
import com.back.domain.member.member.dto.*;
import com.back.domain.member.member.entity.Member;
import com.back.domain.member.member.service.EmailService;
import com.back.domain.member.member.service.MemberService;
import com.back.global.response.ApiResponse;
import com.back.global.security.CustomUserDetails;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.Map;


@RestController
@RequestMapping("/api/v1/members")
@RequiredArgsConstructor
public class MemberController {
    private final MemberService memberService;
    private final EmailService emailService;
    private final ObjectMapper objectMapper;

    @Transactional
    @PostMapping
    public ApiResponse<MemberDto> join(@Valid @RequestBody MemberJoinReq reqBody) {
        Member member = memberService.join(
                reqBody.role(),
                reqBody.name(),
                reqBody.username(),
                reqBody.password(),
                reqBody.passwordConfirm(),
                reqBody.email()
        );

        return new ApiResponse<>(
                "201-1",
                "%s님 환영합니다. 회원가입이 완료되었습니다.".formatted(member.getName()),
                new MemberDto(member)
        );
    }

    @PostMapping("/join/email")
    public ApiResponse<Void> sendJoinCode(@Valid @RequestBody JoinEmailReq reqBody) {
        emailService.sendEmailCode("JOIN", reqBody.email());
        return new ApiResponse<>("200-3", "인증 코드가 이메일로 전송되었습니다.");
    }

    @PostMapping("/join/verification")
    public ApiResponse<Void> verifyJoinCode(@Valid @RequestBody JoinVerifyReq req) {
        emailService.verifyEmailCode("JOIN", req.email(), req.code());
        return new ApiResponse<>("200-4", "이메일 인증이 완료되었습니다.");
    }

    @GetMapping("/me")
    public ApiResponse<ProfileResponseDto> getMyProfile(@AuthenticationPrincipal CustomUserDetails user) {
        Member member = memberService.findById(user.getId());
        return new ApiResponse<>("200-7", "프로필 조회 성공", ProfileResponseDto.of(member));
    }

    @GetMapping("/{userId}/profile")
    public ApiResponse<ProfileResponseDto> getProfile(@PathVariable Long userId) {
        Member member = memberService.findById(userId);
        return new ApiResponse<>("200-7", "프로필 조회 성공", ProfileResponseDto.of(member));
    }

    @PatchMapping("/me/profile")
    public ApiResponse<Void> updateMyProfile(
            @AuthenticationPrincipal CustomUserDetails user,
            @RequestBody Map<String, Object> reqBody
    ) {
        Member member = memberService.findById(user.getId());

        if (member.getRole() == Role.FREELANCER) {
            FreelancerUpdateDto dto = objectMapper.convertValue(reqBody, FreelancerUpdateDto.class);
            memberService.updateFreelancerProfile(member, dto);
        } else if (member.getRole() == Role.CLIENT) {
            ClientUpdateDto dto = objectMapper.convertValue(reqBody, ClientUpdateDto.class);
            memberService.updateClientProfile(member, dto);
        }

        return new ApiResponse<>("200-8", "프로필 수정 성공");
    }

    @PatchMapping("/password")
    public ApiResponse<Void> updatePassword(
            @AuthenticationPrincipal CustomUserDetails user,
            @Valid @RequestBody PasswordUpdateReq reqBody
    ) {
        Member member = memberService.findById(user.getId());
        memberService.updatePassword(
                member,
                reqBody.currentPassword(),
                reqBody.newPassword(),
                reqBody.newPasswordConfirm()
        );
        return new ApiResponse<>("200-5", "비밀번호 수정이 완료되었습니다.");
    }

    @PostMapping("/password-reset/email")
    public ApiResponse<Void> sendTempPasswordCode(@Valid @RequestBody TempPasswordEmailReq reqBody) {
        memberService.sendTempPasswordCode(
                reqBody.username(),
                reqBody.email()
        );
        return new ApiResponse<>("200-3", "인증 코드가 이메일로 전송되었습니다.");
    }

    @PostMapping("/password-reset")
    public ApiResponse<Void> issueTempPassword(@Valid @RequestBody TempPasswordVerifyReq reqBody) {
        memberService.issueTempPassword(
                reqBody.username(),
                reqBody.email(),
                reqBody.code()
        );
        return new ApiResponse<>("200-6", "임시 비밀번호가 이메일로 발송되었습니다.");
    }


}
