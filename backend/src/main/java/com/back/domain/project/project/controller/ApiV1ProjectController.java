package com.back.domain.project.project.controller;

import com.back.domain.client.client.entity.Client;
import com.back.domain.common.interest.dto.InterestDto;
import com.back.domain.common.interest.service.InterestService;
import com.back.domain.common.skill.dto.SkillDto;
import com.back.domain.common.skill.service.SkillService;
import com.back.domain.member.member.entity.Member;
import com.back.domain.member.member.service.MemberService;
import com.back.domain.project.project.dto.*;
import com.back.domain.project.project.entity.Project;
import com.back.domain.project.project.service.ProjectService;
import com.back.global.exception.ServiceException;
import com.back.global.response.ApiResponse;
import com.back.global.security.CustomUserDetails;
import com.back.global.security.annotation.OnlyActiveMember;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/projects")
@RequiredArgsConstructor
// @Tag(name="ApiV1ProjectController", description = "API 프로젝트 컨트롤러")
public class ApiV1ProjectController {
    private final ProjectService projectService;
    private final MemberService memberService;
    private final SkillService skillService;
    private final InterestService interestService;

    @PostMapping
    @Transactional
    @OnlyActiveMember
    public ApiResponse<ProjectDto> write(
            @Valid @RequestBody ProjectWriteReqBody reqBody,
            @AuthenticationPrincipal CustomUserDetails user
            ) {
        // 임시로 회원 데이터 1개 가져옴
//        Member member = memberService.findByUsername("client1").get();
//        Client client = member.getClient();
        // 실제 유저 데이터 가져오기
        Member member = memberService.findById(user.getId());
        Client client = member.getClient();
        if (client == null) {
            throw new ServiceException("403-1", "권한이 없습니다.");
        }

        Project project = projectService.create(
                client,
                reqBody.title(),
                reqBody.summary(),
                reqBody.price(),
                reqBody.preferredCondition(),
                reqBody.payCondition(),
                reqBody.workingCondition(),
                reqBody.duration(),
                reqBody.description(),
                reqBody.deadline(),
                reqBody.skills(),
                reqBody.interests()
        );

        // 저장된 Project의 skill, interest 정보 가져오기
        List<SkillDto> skillDtoList = skillService.findByProjectId(project.getId());
        List<InterestDto> interestDtoList = interestService.findByProjectId(project.getId());

        return new ApiResponse<>(
                "201-1",
                "%d번 프로젝트가 생성되었습니다.".formatted(project.getId()),
                // skill, interest 데이터 넣기
                new ProjectDto(project, skillDtoList, interestDtoList)
        );
    }

    @DeleteMapping("/{id}")
    @Transactional
    @OnlyActiveMember
    public ApiResponse<Void> delete(
            @PathVariable long id,
            @AuthenticationPrincipal CustomUserDetails user
            ) {
        Member member = memberService.findById(user.getId());
        Client client = member.getClient();
        Project project = projectService.findById(id);

        // 해당 프로젝트의 삭제 권한 확인
        if (!project.getClient().equals(client)) {
            throw new ServiceException("403-1", "권한이 없습니다.");
        }

        projectService.delete(project);

        return new ApiResponse<>("200-1", "%d번 프로젝트가 삭제되었습니다.".formatted(id));
    }

    @PatchMapping("/{id}")
    @Transactional
    @OnlyActiveMember
    public ApiResponse<ProjectDto> modify(
            @PathVariable long id,
            @Valid @RequestBody ProjectModifyReqBody reqBody,
            @AuthenticationPrincipal CustomUserDetails user
            ) {
        Member member = memberService.findById(user.getId());
        Client client = member.getClient();
        Project project = projectService.findById(id);

        // 해당 프로젝트의 수정 권한 확인
        if (!project.getClient().equals(client)) {
            throw new ServiceException("403-1", "권한이 없습니다.");
        }

        projectService.update(
                project,
                reqBody.title(),
                reqBody.summary(),
                reqBody.price(),
                reqBody.preferredCondition(),
                reqBody.payCondition(),
                reqBody.workingCondition(),
                reqBody.duration(),
                reqBody.description(),
                reqBody.deadline(),
                reqBody.status(),
                reqBody.skills(),
                reqBody.interests()
        );

        // ProjectSkill, ProjectInterest 연관 데이터 DTO로 변환
        List<SkillDto> skillDtoList = skillService.findByProjectId(project.getId());
        List<InterestDto> interestDtoList = interestService.findByProjectId(project.getId());

        return new ApiResponse<>(
                "200-1",
                "%d번 프로젝트가 수정되었습니다.".formatted(project.getId()),
                new ProjectDto(project, skillDtoList, interestDtoList)
        );
    }

    @GetMapping("/{id}")
    @Transactional(readOnly = true)
    public ProjectDto getItem(@PathVariable long id) {
        Project project = projectService.findById(id);
        List<SkillDto> skillDtoList = skillService.findByProjectId(id);
        List<InterestDto> interestDtoList = interestService.findByProjectId(id);
        return new ProjectDto(project, skillDtoList, interestDtoList);
    }

    // 테스트용으로 만든 다건 조회이기에 임시로 "/all" 붙임 처리함 이후 삭제하거나 수정할 예정
    @GetMapping("/all")
    @Transactional(readOnly = true)
    public List<ProjectDto> getItems() {
        return projectService.getList().stream()
                .map(project -> {
                    List<SkillDto> skillDtoList = skillService.findByProjectId(project.getId());
                    List<InterestDto> interestDtoList = interestService.findByProjectId(project.getId());
                    return new ProjectDto(project, skillDtoList, interestDtoList);
                })
                .collect(Collectors.toList());
    }

    @GetMapping
    @Transactional(readOnly = true)
    public ApiResponse<Page<ProjectSummaryDto>> searchProjects(
            @ModelAttribute ProjectSearchDto searchDto,
            @PageableDefault(size = 10, sort = "createDate", direction = Sort.Direction.DESC) Pageable pageable
    ) {
        Page<ProjectSummaryDto> page = projectService.search(searchDto, pageable);
        return new ApiResponse<>("200-1", "조회 성공", page);
    }
}
