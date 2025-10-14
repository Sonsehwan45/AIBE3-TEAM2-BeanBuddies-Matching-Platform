package com.back.domain.proposal.proposal.controller;

import com.back.domain.member.member.entity.Member;
import com.back.domain.member.member.service.MemberService;
import com.back.domain.proposal.proposal.dto.ProposalDto;
import com.back.domain.proposal.proposal.dto.ProposalStateUpdateReqBody;
import com.back.domain.proposal.proposal.dto.ProposalWriteReqBody;
import com.back.domain.proposal.proposal.service.ProposalService;
import com.back.global.response.ApiResponse;
import com.back.global.security.CustomUserDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/projects/{projectId}/proposals")
@Tag(name="ApiV1ProposalController", description = "API 제안서(클라이언트 -> 프리랜서) 컨트롤러")
public class ApiV1ProposalController {

    private final ProposalService proposalService;
    private final MemberService memberService;

    @GetMapping
    @Operation(summary = "프로젝트에 해당하는 제안서 목록 조회")
    // NOTE : 권한 설정 및 DTO 데이터에 대한 변경 이후에 논의 필요함
    // 1. 프로젝트 작성자가 프로젝트에 해당하는 제안서를 모두 보려는 경우 -> 권한설정만 추가
    // 2. 프로젝트 상세보기에서 간략하게 제안서 목록을 보려는 경우 -> DTO 변경 필요
    // 현재는 권한확인 없이 모두가 목록을 확인할 수 있음
    public ApiResponse<List<ProposalDto>> getProposals(@PathVariable Long projectId) {
        List<ProposalDto> proposals = proposalService.findAll(projectId);

        return new ApiResponse<>(
                "200",
                "제안서 목록 조회 성공",
                proposals
        );
    }

    @PostMapping
    @Operation(summary = "프로젝트에 제안서 등록")
    @SecurityRequirement(name = "bearerAuth")
    public ApiResponse<ProposalDto> create(
            @AuthenticationPrincipal CustomUserDetails user,
            @PathVariable Long projectId,
            @RequestBody @Valid ProposalWriteReqBody reqBody
    ) {
        Member member = memberService.findById(user.getId());
        ProposalDto proposal = proposalService.createProposal(member, projectId, reqBody.freelancerId(),
                reqBody.message());

        return new ApiResponse<>(
                "201",
                "제안서 등록 성공",
                proposal
        );
    }

    @GetMapping("/{proposalId}")
    @Operation(summary = "프로젝트에 해당하는 특정 ID 제안서를 조회")
    @SecurityRequirement(name = "bearerAuth")
    public ApiResponse<ProposalDto> getProposal(
            @AuthenticationPrincipal CustomUserDetails user,
            @PathVariable Long projectId,
            @PathVariable Long proposalId
    ) {
        Member member = memberService.findById(user.getId());
        ProposalDto proposal = proposalService.findBy(member, projectId, proposalId);

        return new ApiResponse<>(
                "200",
                "제안서 조회 성공",
                proposal
        );
    }

    @PatchMapping("/{proposalId}")
    @Operation(summary = "프로젝트에 해당하는 특정 ID 제안서의 상태 변경")
    @SecurityRequirement(name = "bearerAuth")
    public ApiResponse<ProposalDto> updateState(
            @AuthenticationPrincipal CustomUserDetails user,
            @PathVariable Long projectId,
            @PathVariable Long proposalId,
            @RequestBody @Valid ProposalStateUpdateReqBody reqBody
    ) {
        Member member = memberService.findById(user.getId());

        ProposalDto proposal = proposalService.updateState(member, projectId, proposalId, reqBody.toStatus());

        return new ApiResponse<>(
                "200",
                "제안서 상태 변경 성공",
                proposal
        );
    }

    @DeleteMapping("/{proposalId}")
    @Operation(summary = "프로젝트에 해당하는 특정 ID 제안서 삭제")
    @SecurityRequirement(name = "bearerAuth")
    public ApiResponse<Void> delete(
            @AuthenticationPrincipal CustomUserDetails user,
            @PathVariable Long projectId,
            @PathVariable Long proposalId
    ) {
        Member member = memberService.findById(user.getId());

        proposalService.deleteProposal(member, projectId, proposalId);

        return new ApiResponse<>(
                "204",
                "제안서 삭제 성공"
        );
    }
}
