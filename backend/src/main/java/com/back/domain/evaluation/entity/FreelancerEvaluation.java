package com.back.domain.evaluation.entity;

import com.back.domain.project.project.entity.Project;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor
public class FreelancerEvaluation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id")
    private Client client;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "freelancer_id")
    private Freelancer freelancer;

    @Lob // TEXT 타입 매핑
    private String comment;

    private Integer ratingSatisfaction;
    private Integer ratingProfessionalism;
    private Integer ratingScheduleAdherence;
    private Integer ratingCommunication;
    private Integer ratingProactiveness;

    private LocalDateTime createdAt;
}
