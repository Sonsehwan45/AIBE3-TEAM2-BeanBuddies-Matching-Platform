package com.back.domain.project.project.repository;

import com.back.domain.project.project.entity.Project;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long>, ProjectRepositoryCustom {
    Optional<Project> findFirstByOrderByIdDesc();

    @Query("SELECT p FROM Project p JOIN FETCH p.client c JOIN FETCH c.member WHERE p.id = :id")
    Optional<Project> findByIdWithAuthor(Long id);

    List<Project> findAllByClientMemberIdOrderByIdDesc(Long memberId);

    @Query("select p from Project p where p.client.id = :clientId")
    Page<Project> findByClientId(@Param("clientId") Long clientId, Pageable pageable);

    @Query(
            """
                    SELECT DISTINCT p FROM Project p
                    JOIN FETCH p.projectParticipants pp
                    JOIN FETCH pp.freelancer f
                    JOIN FETCH p.projectSkills ps
                    JOIN FETCH ps.skill s
                    JOIN FETCH p.projectInterests pi
                    JOIN FETCH pi.interest i
                    WHERE f.id = :freelancerId
            """
    )
    List<Project> findParticipatedProjectsById(Long freelancerId);
}
