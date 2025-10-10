package com.back.domain.project.project.repository;

import com.back.domain.project.project.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProjectRepository extends JpaRepository<Project,Long>, JpaSpecificationExecutor<Project> {
    Optional<Project> findFirstByOrderByIdDesc();
}
