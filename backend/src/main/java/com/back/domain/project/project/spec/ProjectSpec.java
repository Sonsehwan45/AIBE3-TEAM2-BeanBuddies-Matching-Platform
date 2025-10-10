package com.back.domain.project.project.spec;

import com.back.domain.project.project.constant.ProjectStatus;
import com.back.domain.project.project.entity.Project;
import org.springframework.data.jpa.domain.Specification;

public class ProjectSpec {

    // 키워드 검색
    public static Specification<Project> hasKeyword(String keywordType, String keyword) {
        return (root, query, cb) -> {
            if ("title".equalsIgnoreCase(keywordType)) {
                return cb.like(root.get("title"), "%" + keyword + "%");
            } else if ("summary".equalsIgnoreCase(keywordType)) {
                return cb.like(root.get("summary"), "%" + keyword + "%");
            } else if ("description".equalsIgnoreCase(keywordType)) {
                return cb.like(root.get("description"), "%" + keyword + "%");
            }
            return cb.conjunction();
        };
    }

    // 상태 조건
    public static Specification<Project> hasStatus(ProjectStatus status) {
        return (root, query, cb) -> cb.equal(root.get("status"), status);
    }
}

