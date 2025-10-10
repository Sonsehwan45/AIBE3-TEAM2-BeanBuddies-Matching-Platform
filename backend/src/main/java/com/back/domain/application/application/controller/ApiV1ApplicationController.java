package com.back.domain.application.application.controller;

import com.back.domain.application.application.dto.ApplicationDto;
import com.back.domain.application.application.dto.ApplicationModifyReqBody;
import com.back.domain.application.application.dto.ApplicationSummaryDto;
import com.back.domain.application.application.dto.ApplicationWriteReqBody;
import com.back.domain.application.application.entity.Application;
import com.back.domain.application.application.service.ApplicationService;
import com.back.domain.client.client.entity.Client;
import com.back.domain.freelancer.freelancer.entity.Freelancer;
import com.back.domain.freelancer.freelancer.service.FreelancerService;
import com.back.domain.member.member.entity.Member;
import com.back.domain.member.member.service.MemberService;
import com.back.domain.project.project.entity.Project;
import com.back.domain.project.project.service.ProjectService;
import com.back.global.exception.ServiceException;
import com.back.global.response.ApiResponse;
import com.back.global.security.CustomUserDetails;
import com.back.global.security.annotation.OnlyActiveMember;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/projects/{projectId}/applications")
@RequiredArgsConstructor
public class ApiV1ApplicationController {
    private final ApplicationService applicationService;
    private final ProjectService ProjectService;
    private final MemberService memberService;
    private final FreelancerService freelancerService;

    // 등록
    @PostMapping
    @Transactional
    @OnlyActiveMember
    public ApiResponse<ApplicationDto> create(
            @PathVariable long projectId,
            @Valid @RequestBody ApplicationWriteReqBody reqBody,
            @AuthenticationPrincipal CustomUserDetails user
            ) {
        Member member = memberService.findById(user.getId());
        Freelancer freelancer = freelancerService.findById(member.getId());
        if (freelancer == null) {
            throw new ServiceException("403-1", "권한이 없습니다.");
        }

        // 프로젝트 정보 받아오기
        Project project = ProjectService.findById(projectId);

        Application application = applicationService.create(reqBody, freelancer, project);

        return new ApiResponse<>(
                "201-1",
                "%d번 지원서가 생성되었습니다.".formatted(application.getId()),
                new ApplicationDto(application)
        );
    }

    // 수정
    // 클라이언트가 자신의 프로젝트에 등록된 지원서의 상태(status)를 전환
    @PatchMapping("/{id}")
    @Transactional
    @OnlyActiveMember
    public ApiResponse<ApplicationDto> update(
            @PathVariable long projectId,
            @PathVariable long id,
            @Valid @RequestBody ApplicationModifyReqBody reqBody,
            @AuthenticationPrincipal CustomUserDetails user
            ) {
        // 권한 체크
        Member member = memberService.findById(user.getId());
        Client client = member.getClient();

        Project project = ProjectService.findById(projectId);

        // 수정 권한 체크
        if (!project.getClient().equals(client)) {
            throw new ServiceException("403-1", "권한이 없습니다.");
        }

        Application application = applicationService.findById(id);

        applicationService.update(application, reqBody.status());


        return new ApiResponse<>(
                "200-1",
                "%d번 지원서가 수정되었습니다.".formatted(application.getId()),
                new ApplicationDto(application)
        );
    }

    // 삭제
    @DeleteMapping("/{id}")
    @Transactional
    @OnlyActiveMember
    public ApiResponse<Void> delete(
            @PathVariable long projectId,
            @PathVariable long id,
            @AuthenticationPrincipal CustomUserDetails user
    ) {
        Member member = memberService.findById(user.getId());
        Freelancer freelancer = freelancerService.findById(member.getId());

        Application application = applicationService.findById(id);

        if (!application.getFreelancer().equals(freelancer)) {
            throw new ServiceException("403-1", "권한이 없습니다.");
        }

        applicationService.delete(application);

        return new ApiResponse<>("200-1", "%d번 지원서가 삭제되었습니다.".formatted(id));
    }

    // 조회
    // 단건 조회
    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public ApiResponse<ApplicationDto> get(@PathVariable long projectId, @PathVariable long id) {
        Application application = applicationService.findById(id);

        return new ApiResponse<>(
                "200-1",
                "%d번 지원서가 단건 조회되었습니다.".formatted(id),
                new ApplicationDto(application)
                );
    }

    // 클라이언트가 프로젝트의 지원 목록 보기
    @GetMapping
    @Transactional(readOnly = true)
    public ApiResponse<List<ApplicationSummaryDto>> getAll(@PathVariable long projectId) {
        Project project = ProjectService.findById(projectId);
        List<Application> applicationList = applicationService.findAllByProject(project);

        // List<ApplicationDto>로 넣어주기
        List<ApplicationSummaryDto> applicationSummaryDtoList = applicationList.stream()
                .map(ApplicationSummaryDto::new)
                .toList();

        return new ApiResponse<>(
                "200-1",
                "%d번 프로젝트의 지원서가 조회되었습니다.".formatted(projectId),
                applicationSummaryDtoList
        );
    }

    // 프리랜서가 자신의 지원 목록 보기
    @GetMapping("/me") // 임시로 매핑한 상태며 RESTful 한 URI를 위해 Freelancer로 옮기거나 수정될 예정
    @Transactional(readOnly = true)
    public ApiResponse<List<ApplicationSummaryDto>> getAllMe(
            @PathVariable long projectId
    ) {
        // 임시로 회원 하나의 freelancer 정보 불러옴
        Member freelancerMember1 = memberService.findByUsername("freelancer1").get();
        Freelancer freelancer = freelancerService.findById(freelancerMember1.getId());

        List<Application> applicationList = applicationService.findAllByFreeLancer(freelancer);

        // List<ApplicationDto>로 넣어주기
        List<ApplicationSummaryDto> applicationSummaryDtoList = applicationList.stream()
                .map(ApplicationSummaryDto::new)
                .toList();

        return new ApiResponse<>(
                "200-1",
                "%d번 프리랜서의 지원서가 조회되었습니다.".formatted(freelancer.getId()),
                applicationSummaryDtoList
        );
    }
}
