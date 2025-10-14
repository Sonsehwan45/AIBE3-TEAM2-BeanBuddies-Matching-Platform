package com.back.domain.evaluation.entity;


import com.back.domain.client.client.entity.Client;
import com.back.domain.freelancer.freelancer.entity.Freelancer;
import com.back.domain.project.project.entity.Project;
import com.back.global.jpa.entity.BaseEvaluationEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor
public class ClientEvaluation extends BaseEvaluationEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;//평가받는 사람

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "freelancer_id", nullable = false)
    private Freelancer freelancer;//평가하는 사람

    public ClientEvaluation(Project project, Client client, Freelancer freelancer, String comment,
                            int satisfaction, int professionalism, int scheduleAdherence,
                            int communication, int proactiveness) {
        super(project, comment, satisfaction, professionalism, scheduleAdherence, communication, proactiveness);
        this.client = client;
        this.freelancer = freelancer;
    }
}
