package com.back.domain.application.application.entity;

import com.back.domain.application.application.constant.ApplicationStatus;
import com.back.domain.application.application.dto.ApplicationWriteReqBody;
import com.back.domain.client.client.entity.Client;
import com.back.domain.freelancer.freelancer.entity.Freelancer;
import com.back.domain.project.project.entity.Project;
import com.back.global.jpa.entity.BaseEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.math.BigDecimal;

@Entity
@Getter
@ToString
@NoArgsConstructor
public class Application extends BaseEntity {
    private BigDecimal estimatedPay;
    private String expectedDuration;
    private String workPlan;
    private String additionalRequest;
    private ApplicationStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "freelancer_id")
    private Freelancer freelancer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    private Project project;

    // Project가 이미 client를 가지고 있는데 굳이 또 넣어야하나?
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id")
    private Client client;

    public Application(ApplicationWriteReqBody reqBody, Freelancer freelancer, Project project) {
        this.estimatedPay = reqBody.estimatedPay();
        this.expectedDuration = reqBody.expectedDuration();
        this.workPlan = reqBody.workPlan();
        this.additionalRequest = reqBody.additionalRequest();
        this.status = ApplicationStatus.WAIT;
        this.freelancer = freelancer;
        this.project = project;
        this.client = project.getClient();
    }
}
