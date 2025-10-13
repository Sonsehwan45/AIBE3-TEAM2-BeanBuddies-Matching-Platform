package com.back.domain.project.project.repository;

import com.back.domain.project.project.constant.ProjectStatus;
import com.back.domain.project.project.entity.Project;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ProjectRepositoryCustom {
    Page<Project> searchProjects(
            String keywordType,
            String keyword,
            List<Long> skillIds,
            List<Long> interestIds,
            ProjectStatus status,
            Pageable pageable
    );
}
