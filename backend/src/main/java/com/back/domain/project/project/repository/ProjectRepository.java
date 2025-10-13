package com.back.domain.project.project.repository;

import com.back.domain.project.project.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProjectRepository extends JpaRepository<Project,Long>, ProjectRepositoryCustom {
    Optional<Project> findFirstByOrderByIdDesc();

    @Query("SELECT p FROM Project p JOIN FETCH p.client c JOIN FETCH c.member WHERE p.id = :id")
    Optional<Project> findByIdWithAuthor(Long id);
}
