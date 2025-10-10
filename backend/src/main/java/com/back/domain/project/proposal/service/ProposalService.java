package com.back.domain.project.proposal.service;

import com.back.domain.freelancer.freelancer.entity.Freelancer;
import com.back.domain.freelancer.freelancer.service.FreelancerService;
import com.back.domain.member.member.constant.MemberStatus;
import com.back.domain.member.member.entity.Member;
import com.back.domain.project.project.entity.Project;
import com.back.domain.project.project.service.ProjectService;
import com.back.domain.project.proposal.constant.ProposalStatus;
import com.back.domain.project.proposal.dto.ProposalDto;
import com.back.domain.project.proposal.entity.Proposal;
import com.back.domain.project.proposal.repository.ProposalRepository;
import com.back.global.exception.ServiceException;
import jakarta.persistence.EntityNotFoundException;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProposalService {

    private final ProposalRepository proposalRepository;
    private final ProjectService projectService;
    private final FreelancerService freelancerService;

    @Transactional(readOnly = true)
    public List<ProposalDto> findAll(Long projectId) {
        return proposalRepository.findAllByProjectId(projectId).stream()
                .map(ProposalDto::new)
                .toList();
    }

    @Transactional
    public ProposalDto createProposal(Member client, Long projectId, Long freelancerId, String message) {
        // NOTE : findById에서 404 -> 수정하였음
        Project project = projectService.findById(projectId);

        if (isNotProjectAuthor(client, projectId)) {
            throw new ServiceException("403-1", "프로젝트 담당 클라이언트가 아닙니다. 제안서 작성 권한이 없습니다.");
        }

        Freelancer freelancer = freelancerService.findById(freelancerId);
        if (!freelancer.getMember().isActive()) {
            throw new ServiceException("400-1", "활성화 상태가 아닌 프리랜서에게는 제안서를 보낼 수 없습니다.");
        }

        Proposal proposal = new Proposal(project, freelancer, message);
        return new ProposalDto(proposalRepository.save(proposal));
    }

    @Transactional(readOnly = true)
    public ProposalDto findBy(Member member, Long projectId, Long proposalId) {
        // 클라이언트라면, 프로젝트 작성자인지 확인
        // 프리랜서라면, 제안서 대상자인지 확인
        if (isNotProjectAuthor(member, projectId) || isNotProposalTarget(member, proposalId)) {
            throw new ServiceException("403-2", "제안서를 열람할 권한이 없습니다.");
        }

        Proposal proposal = findById(proposalId);
        return new ProposalDto(proposal);
    }

    private Proposal findById(Long proposalId) {
        return proposalRepository.findById(proposalId)
                .orElseThrow(() -> new EntityNotFoundException("존재하지 않는 제안서입니다."));
    }

    private boolean isNotProjectAuthor(Member member, Long projectId) {
        return !projectService.isAuthor(member, projectId);
    }

    private boolean isNotProposalTarget(Member member, Long proposalId) {
        Proposal proposal = findById(proposalId);

        return !proposal.getFreelancer().equals(member.getFreelancer());
    }

    @Transactional
    public ProposalDto updateState(Member client, Long projectId, Long proposalId, ProposalStatus state) {
        if (isNotProjectAuthor(client, projectId)) {
            throw new ServiceException("403-3", "프로젝트 작성자가 아닙니다. 상태 변경 권한이 없습니다.");
        }

        Proposal proposal = findById(proposalId);
        proposal.updateStatus(state);

        return new ProposalDto(proposal);
    }

    @Transactional
    public void deleteProposal(Member client, Long projectId, Long proposalId) {
        if (isNotProjectAuthor(client, projectId)) {
            throw new ServiceException("403-4", "프로젝트 작성자가 아닙니다. 제안서 삭제 권한이 없습니다.");
        }

        Proposal proposal = findById(proposalId);
        proposalRepository.delete(proposal);
    }
}
