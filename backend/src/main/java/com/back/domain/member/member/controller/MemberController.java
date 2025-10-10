package com.back.domain.member.member.controller;

import com.back.domain.member.member.dto.*;
import com.back.domain.member.member.entity.Member;
import com.back.domain.member.member.service.EmailService;
import com.back.domain.member.member.service.MemberService;
import com.back.global.response.ApiResponse;
import com.back.global.security.CustomUserDetails;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/v1/members")
@RequiredArgsConstructor
public class MemberController {
    private final MemberService memberService;
    private final EmailService emailService;

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
