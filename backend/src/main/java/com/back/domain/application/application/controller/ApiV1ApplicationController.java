package com.back.domain.application.application.controller;

import com.back.domain.application.application.dto.ApplicationDto;
import com.back.domain.application.application.dto.ApplicationModifyReqBody;
import com.back.domain.application.application.dto.ApplicationWriteReqBody;
import com.back.domain.application.application.entity.Application;
import com.back.domain.application.application.service.ApplicationService;
import com.back.domain.freelancer.freelancer.entity.Freelancer;
import com.back.domain.freelancer.freelancer.service.FreelancerService;
import com.back.domain.member.member.entity.Member;
import com.back.domain.member.member.service.MemberService;
import com.back.domain.project.project.entity.Project;
import com.back.domain.project.project.service.ProjectService;
import com.back.global.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

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
    public ApiResponse<ApplicationDto> create(
            @PathVariable long projectId,
            @Valid @RequestBody ApplicationWriteReqBody reqBody
            ) {
        // 임시로 회원 하나의 freelancer 정보 넣음
        Member freelancerMember1 = memberService.findByUsername("freelancer1").get();
        Freelancer freelancer = freelancerService.findById(freelancerMember1.getId());

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
    @PatchMapping("/{id}")
    @Transactional
    public ApiResponse<ApplicationDto> update(
            @PathVariable long projectId,
            @PathVariable long id,
            @Valid @RequestBody ApplicationModifyReqBody reqBody
            ) {
        // TODO: 권한 체크
        // 임시로 프로젝트 등록 유저 정보 받아오기
//        Member member = memberService.findByUsername("client1").get();
//        Client client = member.getClient();

//        Project project = ProjectService.findById(projectId);

        // 수정 권한 체크
//        if (!project.getClient().equals(client)) {
//            throw new ServiceException("404-1", "지원서 수정 권한이 없습니다.");
//        }

        Application application = applicationService.findById(id);

        applicationService.update(application, reqBody.status());


        return new ApiResponse<>(
                "200-1",
                "%d번 지원서가 수정되었습니다.".formatted(application.getId()),
                new ApplicationDto(application)
        );
    }

    // TODO: 삭제

    // TODO: 조회
    // 클라이언트가 프로젝트의 지원 보기
    // 프리랜서가 자신의 지원 보기
}
