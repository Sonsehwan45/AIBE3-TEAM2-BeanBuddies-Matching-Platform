package com.back.domain.proposal.proposal.service;

import com.back.domain.freelancer.freelancer.entity.Freelancer;
import com.back.domain.freelancer.freelancer.service.FreelancerService;
import com.back.domain.member.member.entity.Member;
import com.back.domain.project.project.entity.Project;
import com.back.domain.project.project.service.ProjectService;
import com.back.domain.proposal.proposal.constant.ProposalStatus;
import com.back.domain.proposal.proposal.dto.ProposalDto;
import com.back.domain.proposal.proposal.entity.Proposal;
import com.back.domain.proposal.proposal.repository.ProposalRepository;
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
        Project project = projectService.findByIdWithAuthor(projectId);

        if (isNotProjectAuthor(client, project)) {
            throw new ServiceException("403-1", "프로젝트 작성자가 아닙니다. 제안서 작성 권한이 없습니다.");
        }

        Freelancer freelancer = freelancerService.findByIdWithMember(freelancerId);
        if (!freelancer.getMember().isActive()) {
            throw new ServiceException("400-2", "활성화 상태가 아닌 프리랜서에게는 제안서를 보낼 수 없습니다.");
        }

        Proposal proposal = new Proposal(project, freelancer, message);
        return new ProposalDto(proposalRepository.save(proposal));
    }

    private boolean isNotProjectAuthor(Member member, Project project) {
        return !projectService.isAuthor(member, project);
    }

    @Transactional(readOnly = true)
    public ProposalDto findBy(Member member, Long projectId, Long proposalId) {
        Proposal proposal = findByIdWithDetails(proposalId);
        Project project = proposal.getProject();

        if (hasProjectProposal(projectId, project)) {
            throw new ServiceException("400-1", "해당 프로젝트의 제안서가 아닙니다.");
        }

        // 클라이언트라면, 제안서 작성자(= 프로젝트 작성자)인지 확인
        // 프리랜서라면, 제안서 대상자인지 확인
        if ((member.isClient() && isNotProjectAuthor(member, project)) ||
                (member.isFreelancer() && isNotProposalTarget(member, proposal))
        ) {
            throw new ServiceException("403-2", "제안서를 열람할 권한이 없습니다.");
        }

        return new ProposalDto(proposal);
    }

    private Proposal findByIdWithDetails(Long proposalId) {
        return proposalRepository.findByIdWithDetails(proposalId)
                .orElseThrow(() -> new EntityNotFoundException("존재하지 않는 제안서입니다."));
    }

    private boolean hasProjectProposal(Long projectId, Project project) {
        return !project.getId().equals(projectId);
    }

    private boolean isNotProposalTarget(Member member, Proposal proposal) {
        return !proposal.getFreelancer().getMember().getId().equals(member.getId());
    }

    @Transactional
    public ProposalDto updateState(Member freelancer, Long projectId, Long proposalId, ProposalStatus state) {
        Proposal proposal = findByIdWithDetails(proposalId);
        Project project = proposal.getProject();

        if (hasProjectProposal(projectId, project)) {
            throw new ServiceException("400-1", "해당 프로젝트의 제안서가 아닙니다.");
        }

        if (isNotProposalTarget(freelancer, proposal)) {
            throw new ServiceException("403-2", "제안서 대상자가 아닙니다. 상태 변경 권한이 없습니다.");
        }

        if (!proposal.isStatusWait()) {
            throw new ServiceException("400-3", "대기 상태가 아닌 제안서는 상태를 변경할 수 없습니다.");
        }

        proposal.updateStatus(state);

        return new ProposalDto(proposal);
    }

    @Transactional
    public void deleteProposal(Member client, Long projectId, Long proposalId) {
        Proposal proposal = findByIdWithDetails(proposalId);
        Project project = proposal.getProject();

        if (hasProjectProposal(projectId, project)) {
            throw new ServiceException("400-1", "해당 프로젝트의 제안서가 아닙니다.");
        }

        if (isNotProjectAuthor(client, project)) {
            throw new ServiceException("403-2", "프로젝트 작성자가 아닙니다. 제안서 삭제 권한이 없습니다.");
        }

        proposalRepository.delete(proposal);
    }

    // 테스트를 위한 메소드
    public long count() {
        return proposalRepository.count();
    }
}
