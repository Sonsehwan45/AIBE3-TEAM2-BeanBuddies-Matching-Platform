package com.back.domain.member.favorite.repository;

import com.back.domain.member.favorite.entity.ProjectFavorite;
import com.back.domain.member.member.entity.Member;
import com.back.domain.project.project.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProjectFavoriteRepository extends JpaRepository<ProjectFavorite, Long> {
    List<ProjectFavorite> findAllByMember(Member member);
    Optional<ProjectFavorite> findByMemberAndProject(Member member, Project project);
    void deleteByMemberAndProject(Member member, Project project);
}

