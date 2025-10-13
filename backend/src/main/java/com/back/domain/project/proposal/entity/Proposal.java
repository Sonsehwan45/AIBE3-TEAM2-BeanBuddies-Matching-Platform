package com.back.domain.project.proposal.entity;

import com.back.domain.freelancer.freelancer.entity.Freelancer;
import com.back.domain.project.project.entity.Project;
import com.back.domain.project.proposal.constant.ProposalStatus;
import com.back.global.jpa.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;

@Entity
@Getter
@NoArgsConstructor
public class Proposal extends BaseEntity {

    @Column(columnDefinition = "TEXT")
    private String message;

    @ManyToOne(fetch =  FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @ManyToOne(fetch =  FetchType.LAZY)
    @JoinColumn(name = "freelancer_id", nullable = false)
    private Freelancer freelancer;

    @Enumerated(EnumType.STRING)
    private ProposalStatus status;

    public Proposal(Project project, Freelancer freelancer, String message) {
        this.project = project;
        this.freelancer = freelancer;
        this.message = message;
        this.status = ProposalStatus.WAIT;
    }

    public void updateStatus(ProposalStatus state) {
        this.status = state;
    }

    public boolean isStatusWait() {
        return this.status == ProposalStatus.WAIT;
    }
}
