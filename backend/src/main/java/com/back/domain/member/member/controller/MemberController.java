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
import com.back.domain.member.member.constant.SocialProvider;
import com.back.domain.member.member.dto.*;
import com.back.domain.member.member.entity.Member;
import com.back.domain.member.member.entity.MemberSocial;
import com.back.domain.member.member.service.*;
import com.back.domain.project.project.dto.ProjectSummaryDto;
import com.back.domain.project.project.entity.Project;
import com.back.domain.project.project.service.ProjectService;
import com.back.global.exception.ServiceException;
import com.back.global.response.ApiResponse;
import com.back.global.security.CustomUserDetails;
import com.back.global.web.CookieHelper;
import com.back.global.web.HeaderHelper;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
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
    private final MemberSocialService memberSocialService;
    private final KakaoService kakaoService;
    private final NaverService naverService;
    private final GoogleService googleService;

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

    //소셜 관련
    //카카오
    @GetMapping("/oauth/kakao/link")
    public void redirectToKakaoLink(
            @RequestParam String id,
            HttpServletResponse response
    ) throws IOException {
        String clientId = kakaoService.getClientId();
        String redirectUri = kakaoService.getLinkRedirectUri();

        // 카카오 로그인 URL 구성
        String url = "https://kauth.kakao.com/oauth/authorize" +
                "?response_type=code" +
                "&client_id=" + clientId +
                "&redirect_uri=" + redirectUri +
                "&state=" + id +
                "&prompt=login";

        response.sendRedirect(url);
    }

    @GetMapping("/oauth/kakao/link/callback")
    public void kakaoLinkCallback(
            @RequestParam String code,
            @RequestParam String state,
            HttpServletResponse response
    ) throws IOException {

        Long memberId = Long.parseLong(state);

        String providerId = memberSocialService.getProviderIdFromLinkCode(SocialProvider.KAKAO, code);
        memberSocialService.linkSocialAccount(memberId, SocialProvider.KAKAO, providerId);

        //TODO : 테스트 후 변경 필요
        response.sendRedirect("http://localhost:3000/mypage/social");
    }

    //네이버
    @GetMapping("/oauth/naver/link")
    public void redirectToNaverLink(
            @RequestParam String id,
            HttpServletResponse response
    ) throws IOException {
        String clientId = naverService.getClientId();
        String redirectUri = naverService.getLinkRedirectUri();

        String url = "https://nid.naver.com/oauth2.0/authorize" +
                "?response_type=code" +
                "&client_id=" + clientId +
                "&redirect_uri=" + redirectUri +
                "&state=" + id; //네이버는 화면 강제 어려움

        response.sendRedirect(url);
    }

    @GetMapping("/oauth/naver/link/callback")
    public void naverLinkCallback(
            @RequestParam String code,
            @RequestParam String state,
            HttpServletResponse response
    ) throws IOException {
        Long memberId = Long.parseLong(state);

        String providerId = memberSocialService.getProviderIdFromLinkCode(SocialProvider.NAVER, code);
        memberSocialService.linkSocialAccount(memberId, SocialProvider.NAVER, providerId);

        response.sendRedirect("http://localhost:3000/mypage/social");
    }

    //구글
    @GetMapping("/oauth/google/link")
    public void redirectToGoogleLink(
            @RequestParam String id,
            HttpServletResponse response
    ) throws IOException {
        String clientId = googleService.getClientId();
        String redirectUri = googleService.getLinkRedirectUri();

        String url = "https://accounts.google.com/o/oauth2/v2/auth" +
                "?client_id=" + clientId +
                "&redirect_uri=" + redirectUri +
                "&response_type=code" +
                "&scope=email%20profile" +
                "&state=" + id +
                "&prompt=select_account";

        response.sendRedirect(url);
    }

    @GetMapping("/oauth/google/link/callback")
    public void googleLinkCallback(
            @RequestParam String code,
            @RequestParam String state,
            HttpServletResponse response
    ) throws IOException {

        Long memberId = Long.parseLong(state);
        String providerId = memberSocialService.getProviderIdFromLinkCode(SocialProvider.GOOGLE, code);
        memberSocialService.linkSocialAccount(memberId, SocialProvider.GOOGLE, providerId);

        response.sendRedirect("http://localhost:3000/mypage/social");
    }


    // 연동된 소셜 계정 조회
    @GetMapping("/me/social")
    public ApiResponse<List<Map<String, String>>> getLinkedSocialAccounts(@AuthenticationPrincipal CustomUserDetails user) {

        Long memberId = user.getId();
        List<MemberSocial> linkedAccounts = memberSocialService.getLinkedAccounts(memberId);

        List<Map<String, String>> response = linkedAccounts.stream()
                .map(ms -> Map.of(
                        "provider", ms.getProvider().name(),
                        "providerId", ms.getProviderId()
                ))
                .collect(Collectors.toList());

        return new ApiResponse<>("200-4", "연동된 소셜 계정 목록", response);
    }

    @DeleteMapping("/me/social")
    public ApiResponse<Void> removeLinkedSocialAccount(
            @AuthenticationPrincipal CustomUserDetails user,
            @RequestParam String provider
    ) {
        Long memberId = user.getId();
        memberSocialService.removeLinkedSocialAccount(memberId, SocialProvider.valueOf(provider));

        return new ApiResponse<>("200-4", provider + " 계정 연결 해제에 성공하였습니다.");

    }
}
