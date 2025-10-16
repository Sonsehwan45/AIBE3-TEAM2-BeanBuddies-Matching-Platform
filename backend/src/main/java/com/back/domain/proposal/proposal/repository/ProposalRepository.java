package com.back.domain.proposal.proposal.repository;

import com.back.domain.proposal.proposal.entity.Proposal;
import java.util.Collection;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface ProposalRepository extends JpaRepository<Proposal, Long> {

    @Query("""
                SELECT p FROM Proposal p
                JOIN FETCH p.project pr
                JOIN FETCH p.freelancer f
                JOIN FETCH f.member fm
                JOIN FETCH pr.client c
                JOIN FETCH c.member cm
                WHERE pr.id = :projectId                                
          """
    )
    Collection<Proposal> findAllByProjectId(Long projectId);

    @Query("""
                SELECT p FROM Proposal p
                JOIN FETCH p.project pr
                JOIN FETCH p.freelancer f
                JOIN FETCH f.member fm
                JOIN FETCH pr.client c
                JOIN FETCH c.member cm
                WHERE p.id = :proposalId
            """
    )
    Optional<Proposal> findByIdWithDetails(Long proposalId);


    @Query("""
                SELECT p FROM Proposal p
                JOIN FETCH p.project pr
                JOIN FETCH p.freelancer f
                JOIN FETCH f.member fm
                JOIN FETCH pr.client c
                JOIN FETCH c.member cm
                WHERE f.id = :freelancerId
            """
    )
    List<Proposal> findByFreelancerIdWithDetails(Long freelancerId);

    @Query("""
                SELECT p FROM Proposal p
                JOIN FETCH p.project pr
                JOIN FETCH p.freelancer f
                JOIN FETCH f.member fm
                JOIN FETCH pr.client c
                JOIN FETCH c.member cm
                WHERE c.id = :id
            """
    )
    List<Proposal> findByClientIdWithDetails(Long id);
}
