package com.back.domain.project.project.entity;

import com.back.domain.application.application.entity.Application;
import com.back.domain.client.client.entity.Client;
import com.back.domain.freelancer.freelancer.entity.Freelancer;
import com.back.domain.project.participant.entity.ProjectParticipant;
import com.back.domain.project.project.constant.ProjectStatus;
import com.back.domain.proposal.proposal.entity.Proposal;
import com.back.global.jpa.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@ToString
@NoArgsConstructor
public class Project extends BaseEntity {
    @Column(unique = true)
    private String title;
    private String summary;
    private String duration;
    private BigDecimal price;
    @Enumerated(EnumType.STRING)
    private ProjectStatus status;
    private LocalDateTime deadline;
    private String description;
    private String preferredCondition;
    private String payCondition;
    private String workingCondition;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id")
    private Client client;

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProjectSkill> projectSkills = new ArrayList<>();

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProjectInterest> projectInterests = new ArrayList<>();

    //프로젝트 - 지원서, 제안서 추가
    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Application> applications = new ArrayList<>();

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Proposal> proposals = new ArrayList<>();

    @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ProjectParticipant> projectParticipants = new ArrayList<>();
    
    public Project(
            Client client,
            String title,
            String summary,
            BigDecimal price,
            String preferredCondition,
            String payCondition,
            String workingCondition,
            String duration,
            String description,
            LocalDateTime deadline) {
        this.client = client;
        this.title = title;
        this.summary = summary;
        this.price = price;
        this.preferredCondition = preferredCondition;
        this.payCondition = payCondition;
        this.workingCondition = workingCondition;
        this.duration = duration;
        this.description = description;
        this.deadline = deadline;
        this.status = ProjectStatus.OPEN;
    }

    public void modify(
            String title,
            String summary,
            BigDecimal price,
            String preferredCondition,
            String payCondition,
            String workingCondition,
            String duration,
            String description,
            LocalDateTime deadline,
            ProjectStatus status) {
        this.title = title;
        this.summary = summary;
        this.price = price;
        this.preferredCondition = preferredCondition;
        this.payCondition = payCondition;
        this.workingCondition = workingCondition;
        this.duration = duration;
        this.description = description;
        this.deadline = deadline;
        this.status = status;
    }

    public void updateStatus(ProjectStatus projectStatus) {
        this.status = projectStatus;
    }

    public void addParticipant(Freelancer participant) {
        boolean alreadyAdded = this.projectParticipants.stream()
                .anyMatch(pp -> pp.getFreelancer().equals(participant));

        if (!alreadyAdded) {
            ProjectParticipant projectParticipant = new ProjectParticipant(this, participant);
            this.projectParticipants.add(projectParticipant);
            participant.getMyProjects().add(projectParticipant);
        }
    }

    public void removeParticipant(Freelancer participant) {
        this.projectParticipants.removeIf(pp -> pp.getFreelancer().equals(participant));
        participant.getMyProjects().removeIf(pp -> pp.getProject().equals(this));
    }
}
