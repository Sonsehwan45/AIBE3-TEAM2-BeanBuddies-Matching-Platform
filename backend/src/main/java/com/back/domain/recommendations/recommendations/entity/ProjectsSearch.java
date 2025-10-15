package com.back.domain.recommendations.recommendations.entity;

import com.back.domain.project.project.constant.ProjectStatus;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Immutable;

import java.math.BigDecimal;

@Getter
@NoArgsConstructor
@Entity
@Table(name = "project_search")
@Immutable
public class ProjectsSearch {


    @Id
    @Column(name = "id")
    private Long id;

    @Column(name = "project_id")
    private Long projectId;

    private String title;

    private String summary;

    private String duration;

    private BigDecimal price;

    @Enumerated(EnumType.STRING)
    private ProjectStatus status;

    private String description;

    @Column(name = "preferred_condition")
    private String preferredCondition;

    @Column(name = "working_condition")
    private String workingCondition;

}