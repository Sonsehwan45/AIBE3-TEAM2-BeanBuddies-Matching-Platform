package com.back.domain.project.participant.entity;


import com.back.domain.freelancer.freelancer.entity.Freelancer;
import com.back.domain.project.project.entity.Project;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;

@Table(name = "project_participant")
@Entity
@NoArgsConstructor
@Getter
public class ProjectParticipant {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @CreatedDate
    private LocalDateTime createDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private Project project;

    @ManyToOne
    @JoinColumn(name = "freelancer_id")
    private Freelancer freelancer;

    // 착수일인지, 엔티티 생성일을 뜻하는지 잘 모르겠어서 @CreatedDate 추가하지 않음 일단 생성시 초기화
    private LocalDateTime joinedAt;

    private LocalDateTime endedAt;

    public ProjectParticipant(Project project, Freelancer participant) {
        this.project = project;
        this.freelancer = participant;
        this.joinedAt = LocalDateTime.now();
    }
}