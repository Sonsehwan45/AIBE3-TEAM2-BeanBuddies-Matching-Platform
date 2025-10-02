package com.back.domain.evaluation.entity;


import com.back.domain.project.project.entity.Project;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Getter
@NoArgsConstructor
public class ClientEvaluation {

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

    @Lob
    private String comment;

    private Integer ratingSatisfaction;
    private Integer ratingProfessionalism;
    private Integer ratingScheduleAdherence;
    private Integer ratingCommunication;
    private Integer ratingProactiveness;

    private LocalDateTime createdAt;

    public ClientEvaluation(Project project, Client client, Freelancer freelancer, String comment,
                        int satisfaction, int professionalism, int scheduleAdherence,
                        int communication, int proactiveness) {
        this.project = project;
        this.client = client;
        this.freelancer = freelancer;
        this.comment = comment;
        this.ratingSatisfaction = satisfaction;
        this.ratingProfessionalism = professionalism;
        this.ratingScheduleAdherence = scheduleAdherence;
        this.ratingCommunication = communication;
        this.ratingProactiveness = proactiveness;
        this.createdAt = LocalDateTime.now();
    }
}
