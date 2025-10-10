package com.back.domain.project.proposal.controller;

import com.back.domain.member.member.entity.Member;
import com.back.domain.member.member.service.MemberService;
import com.back.domain.project.proposal.dto.ProposalDto;
import com.back.domain.project.proposal.dto.ProposalStateUpdateReqBody;
import com.back.domain.project.proposal.dto.ProposalWriteReqBody;
import com.back.domain.project.proposal.service.ProposalService;
import com.back.global.response.ApiResponse;
import com.back.global.security.CustomUserDetails;
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

// 제안서 (클라이언트 -> 프리랜서) 컨트롤러
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/projects/{projectId}/proposals")
public class ProposalController {

    private final ProposalService proposalService;
    private final MemberService memberService;

    @GetMapping
    public List<ProposalDto> getProposals(@PathVariable Long projectId) {
        return proposalService.findAll(projectId);
    }

    @PostMapping
    public ApiResponse<ProposalDto> create(
            @AuthenticationPrincipal CustomUserDetails user,
            @PathVariable Long projectId,
            @RequestBody ProposalWriteReqBody reqBody
    ) {
        Member member = memberService.findById(user.getId());
        ProposalDto proposal = proposalService.createProposal(member, projectId, reqBody.freelancerId(), reqBody.message());

        return new ApiResponse<>(
                "201",
                "제안서 등록 성공",
                proposal
        );
    }

    @GetMapping("/{proposalId}")
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
    public ApiResponse<ProposalDto> updateState(
            @AuthenticationPrincipal CustomUserDetails user,
            @PathVariable Long projectId,
            @PathVariable Long proposalId,
            @RequestBody ProposalStateUpdateReqBody reqBody
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
    public void delete(
            @AuthenticationPrincipal CustomUserDetails user,
            @PathVariable Long projectId,
            @PathVariable Long proposalId
    ) {
        Member member = memberService.findById(user.getId());

        proposalService.deleteProposal(member, projectId, proposalId);
    }
}
