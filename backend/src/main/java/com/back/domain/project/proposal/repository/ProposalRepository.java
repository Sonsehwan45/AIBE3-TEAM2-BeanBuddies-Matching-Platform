package com.back.domain.project.proposal.repository;

import com.back.domain.project.proposal.entity.Proposal;
import java.util.Collection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ProposalRepository extends JpaRepository<Proposal, Long> {
    Collection<Proposal> findAllByProjectId(Long projectId);
}
