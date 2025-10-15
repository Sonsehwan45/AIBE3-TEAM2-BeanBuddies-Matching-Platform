package com.back.domain.member.member.controller;

import com.back.domain.application.application.dto.ApplicationSummaryDto;
import com.back.domain.application.application.entity.Application;
import com.back.domain.application.application.service.ApplicationService;
import com.back.domain.common.interest.service.InterestService;
import com.back.domain.common.skill.service.SkillService;
import com.back.domain.freelancer.freelancer.entity.Freelancer;
import com.back.domain.member.member.constant.Role;
import com.back.domain.member.member.dto.*;
import com.back.domain.member.member.entity.Member;
import com.back.domain.member.member.service.EmailService;
import com.back.domain.member.member.service.MemberService;
import com.back.domain.project.project.dto.ProjectSummaryDto;
import com.back.domain.project.project.entity.Project;
import com.back.domain.project.project.service.ProjectService;
import com.back.global.exception.ServiceException;
import com.back.global.response.ApiResponse;
import com.back.global.security.CustomUserDetails;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;


@RestController
@RequestMapping("/api/v1/members")
@RequiredArgsConstructor
public class MemberController {
    private final MemberService memberService;
    private final EmailService emailService;
    private final ObjectMapper objectMapper;
    private final ProjectService projectService;
    private final SkillService skillService;
    private final InterestService interestService;
    private final ApplicationService applicationService;

    @Transactional
    @PostMapping
    public ApiResponse<MemberDto> join(@Valid @RequestBody MemberJoinReq reqBody) {
        Member member = memberService.join(
                reqBody.profileImgUrl(),
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
    public ApiResponse<ProfileResponseDto> getProfile(
            @PathVariable Long userId,
            @AuthenticationPrincipal CustomUserDetails user
    ) {
        Member member = memberService.getProfile(userId, user);
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
    public ApiResponse<Void> sendPasswordResetCode(@Valid @RequestBody PasswordResetEmailReq reqBody) {
        memberService.sendPasswordResetCode(
                reqBody.username(),
                reqBody.email()
        );
        return new ApiResponse<>("200-3", "인증 코드가 이메일로 전송되었습니다.");
    }

    @PostMapping("/password-reset/verification")
    public ApiResponse<Void> verifyPasswordResetCode(@Valid @RequestBody PasswordResetVerifyReq reqBody) {
        memberService.verifyPasswordResetCode(
                reqBody.username(),
                reqBody.email(),
                reqBody.code()
        );
        return new ApiResponse<>("200-4", "이메일 인증이 완료되었습니다.");
    }

    @PatchMapping("/password-reset")
    public ApiResponse<Void> passwordReset(@Valid @RequestBody PasswordResetReq reqBody) {
        memberService.resetPassword(
                reqBody.username(),
                reqBody.email(),
                reqBody.newPassword(),
                reqBody.newPasswordConfirm()
        );
        return new ApiResponse<>("200-6", "비밀번호 재설정이 완료되었습니다.");
    }

    @GetMapping("/me/projects")
    public ApiResponse<List<ProjectSummaryDto>> getMyProjects(@AuthenticationPrincipal CustomUserDetails user) {
        List<Project> projects = projectService.findAllByMemberId(user.getId());
        List<ProjectSummaryDto> projectSummaries = projects.stream()
                .map(project -> new ProjectSummaryDto(
                        project,
                        skillService.findByProjectId(project.getId()),
                        interestService.findByProjectId(project.getId())
                ))
                .collect(Collectors.toList());

        return new ApiResponse<>("200-9", "내가 등록한 프로젝트 목록 조회 성공", projectSummaries);
    }

    @GetMapping("/me/applications")
    public ApiResponse<List<ApplicationSummaryDto>> getMyApplications(@AuthenticationPrincipal CustomUserDetails user) {
        Member member = memberService.findById(user.getId());

        if (member.getRole() != Role.FREELANCER) {
            throw new ServiceException("403-1", "프리랜서만 접근할 수 있는 기능입니다.");
        }

        Freelancer freelancer = member.getFreelancer();
        List<Application> applications = applicationService.findAllByFreeLancer(freelancer);

        List<ApplicationSummaryDto> applicationSummaries = applications.stream()
                .map(ApplicationSummaryDto::new)
                .collect(Collectors.toList());

        return new ApiResponse<>("200-10", "내가 지원한 프로젝트 목록 조회 성공", applicationSummaries);
    }
}
