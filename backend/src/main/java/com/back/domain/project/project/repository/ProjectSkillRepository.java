package com.back.domain.project.project.repository;

import com.back.domain.project.project.entity.Project;
import com.back.domain.project.project.entity.ProjectSkill;
import com.back.domain.project.project.entity.embeddedId.ProjectSkillId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectSkillRepository extends JpaRepository<ProjectSkill, ProjectSkillId>, JpaSpecificationExecutor<ProjectSkill> {
    List<ProjectSkill> findAllByProject_Id(Long projectId);

    void deleteAllByProject(Project project);

    List<ProjectSkill> findAllByProject(Project project);
}
