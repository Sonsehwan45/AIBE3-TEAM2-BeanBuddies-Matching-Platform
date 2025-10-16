package com.back.domain.member.member.controller;

import com.back.domain.application.application.dto.ApplicationSummaryDto;
import com.back.domain.application.application.entity.Application;
import com.back.domain.application.application.service.ApplicationService;
import com.back.domain.common.interest.service.InterestService;
import com.back.domain.common.skill.service.SkillService;
import com.back.domain.freelancer.freelancer.entity.Freelancer;
import com.back.domain.member.favorite.dto.FavoriteFreelancerReq;
import com.back.domain.member.favorite.dto.FavoriteProjectReq;
import com.back.domain.member.favorite.dto.FreelancerSummaryDto;
import com.back.domain.member.favorite.service.FavoriteService;
import com.back.domain.member.member.constant.Role;
import com.back.domain.member.member.dto.*;
import com.back.domain.member.member.entity.Member;
import com.back.domain.member.member.service.AuthService;
import com.back.domain.member.member.service.EmailService;
import com.back.domain.member.member.service.MemberService;
import com.back.domain.project.project.dto.ProjectSummaryDto;
import com.back.domain.project.project.entity.Project;
import com.back.domain.project.project.service.ProjectService;
import com.back.global.exception.ServiceException;
import com.back.global.response.ApiResponse;
import com.back.global.security.CustomUserDetails;
import com.back.global.web.CookieHelper;
import com.back.global.web.HeaderHelper;
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
    private final HeaderHelper headerHelper;
    private final CookieHelper cookieHelper;
    private final AuthService authService;
    private final FavoriteService favoriteService;

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

    @GetMapping("/me/participated-projects")
    public ApiResponse<List<ProjectSummaryDto>> getMyParticipatedProjects(@AuthenticationPrincipal CustomUserDetails user) {
        Member member = memberService.findById(user.getId());

        List<ProjectSummaryDto> data = projectService.findParticipatedProjectsById(member);

        return new ApiResponse<>("200-9", "내가 참여한 프로젝트 목록 조회 성공", data);
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

    // 즐겨찾기 - 프로젝트 목록 조회
    @GetMapping("/me/favorites/projects")
    public ApiResponse<List<ProjectSummaryDto>> getMyFavoriteProjects(@AuthenticationPrincipal CustomUserDetails user) {
        Member member = memberService.findById(user.getId());
        List<ProjectSummaryDto> favorites = favoriteService.findProjectFavorites(member).stream()
                .map(pf -> {
                    Project project = pf.getProject();
                    return new ProjectSummaryDto(project, skillService.findByProjectId(project.getId()), interestService.findByProjectId(project.getId()));
                })
                .collect(Collectors.toList());

        return new ApiResponse<>("200-20", "즐겨찾기한 프로젝트 목록 조회 성공", favorites);
    }

    // 즐겨찾기 - 프로젝트 추가
    @PostMapping("/me/favorites/projects")
    public ApiResponse<Void> addFavoriteProject(@AuthenticationPrincipal CustomUserDetails user,
                                                @Valid @RequestBody FavoriteProjectReq req) {
        Member member = memberService.findById(user.getId());
        favoriteService.addProjectFavorite(member, req.projectId());
        return new ApiResponse<>("200-21", "프로젝트 즐겨찾기 추가 성공");
    }

    // 즐겨찾기 - 프로젝트 삭제
    @DeleteMapping("/me/favorites/projects/{projectId}")
    public ApiResponse<Void> removeFavoriteProject(@AuthenticationPrincipal CustomUserDetails user,
                                                   @PathVariable Long projectId) {
        Member member = memberService.findById(user.getId());
        favoriteService.removeProjectFavorite(member, projectId);
        return new ApiResponse<>("200-22", "프로젝트 즐겨찾기 삭제 성공");
    }

    // 즐겨찾기 - 프리랜서 목록 조회
    @GetMapping("/me/favorites/freelancers")
    public ApiResponse<List<FreelancerSummaryDto>> getMyFavoriteFreelancers(@AuthenticationPrincipal CustomUserDetails user) {
        Member member = memberService.findById(user.getId());
        List<FreelancerSummaryDto> favorites = favoriteService.findFreelancerFavorites(member).stream()
                .map(ff -> new FreelancerSummaryDto(ff.getFreelancer()))
                .collect(Collectors.toList());

        return new ApiResponse<>("200-23", "즐겨찾기한 프리랜서 목록 조회 성공", favorites);
    }

    // 즐겨찾기 - 프리랜서 추가
    @PostMapping("/me/favorites/freelancers")
    public ApiResponse<Void> addFavoriteFreelancer(@AuthenticationPrincipal CustomUserDetails user,
                                                   @Valid @RequestBody FavoriteFreelancerReq req) {
        Member member = memberService.findById(user.getId());
        favoriteService.addFreelancerFavorite(member, req.userId());
        return new ApiResponse<>("200-24", "프리랜서 즐겨찾기 추가 성공");
    }

    // 즐겨찾기 - 프리랜서 삭제
    @DeleteMapping("/me/favorites/freelancers/{userId}")
    public ApiResponse<Void> removeFavoriteFreelancer(@AuthenticationPrincipal CustomUserDetails user,
                                                      @PathVariable Long userId) {
        Member member = memberService.findById(user.getId());
        favoriteService.removeFreelancerFavorite(member, userId);
        return new ApiResponse<>("200-25", "프리랜서 즐겨찾기 삭제 성공");
    }

    @PatchMapping("/me/withdraw")
    public ApiResponse<Void> withdrawMyAccount(
            @AuthenticationPrincipal CustomUserDetails user,
            @Valid @RequestBody MemberWithdrawReq reqBody
    ) {

        String accessToken = headerHelper.getHeader("Authorization", "");
        if(accessToken != null && accessToken.startsWith("Bearer ")) {
            accessToken = accessToken.replace("Bearer ", "");
            authService.addBlacklistToken(accessToken);
        }

        cookieHelper.deleteCookie("refreshToken");
        headerHelper.setHeader("Authorization", null);

        Member member = memberService.findById(user.getId());
        memberService.withdrawMember(member, reqBody.password());
        return new ApiResponse<>("200-11", "회원 탈퇴가 완료되었습니다.");
    }
}
