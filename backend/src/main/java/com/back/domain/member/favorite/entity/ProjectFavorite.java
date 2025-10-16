package com.back.domain.member.favorite.entity;

import com.back.domain.member.member.entity.Member;
import com.back.domain.project.project.entity.Project;
import com.back.global.jpa.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor
@Table(name = "project_favorite", uniqueConstraints = @UniqueConstraint(columnNames = {"member_id", "project_id"}))
public class ProjectFavorite extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "member_id", nullable = false)
    private Member member;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    public ProjectFavorite(Member member, Project project) {
        this.member = member;
        this.project = project;
    }
}
