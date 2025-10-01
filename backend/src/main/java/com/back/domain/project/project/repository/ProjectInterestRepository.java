package com.back.domain.project.project.repository;

import com.back.domain.project.project.entity.Project;
import com.back.domain.project.project.entity.ProjectInterest;
import com.back.domain.project.project.entity.embeddedId.ProjectInterestId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectInterestRepository extends JpaRepository<ProjectInterest, ProjectInterestId> {
    List<ProjectInterest> findAllByProject_Id(long projectId);

    void deleteAllByProject(Project project);
}
