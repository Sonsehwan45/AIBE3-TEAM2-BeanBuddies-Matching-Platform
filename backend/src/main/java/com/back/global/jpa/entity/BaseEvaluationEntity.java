package com.back.global.jpa.entity;

import com.back.domain.project.project.entity.Project;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@MappedSuperclass // 이 클래스의 필드들을 자식 엔터티의 테이블에 포함시킵니다.
@Getter
@NoArgsConstructor
public abstract class BaseEvaluationEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    @Lob
    private String comment;

    @Column(nullable = false)
    private Integer ratingSatisfaction;

    @Column(nullable = false)
    private Integer ratingProfessionalism;

    @Column(nullable = false)
    private Integer ratingScheduleAdherence;

    @Column(nullable = false)
    private Integer ratingCommunication;

    @Column(nullable = false)
    private Integer ratingProactiveness;

    @Column(updatable = false, nullable = false)
    private LocalDateTime createdAt;

    // 엔터티가 저장되기 직전에 자동으로 현재 시간을 기록합니다.
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    // 자식 클래스에서 호출할 생성자입니다.
    protected BaseEvaluationEntity(Project project, String comment, int satisfaction, int professionalism,
                             int scheduleAdherence, int communication, int proactiveness) {
        this.project = project;
        this.comment = comment;
        this.ratingSatisfaction = satisfaction;
        this.ratingProfessionalism = professionalism;
        this.ratingScheduleAdherence = scheduleAdherence;
        this.ratingCommunication = communication;
        this.ratingProactiveness = proactiveness;
    }

    public void modify(
            String comment, int satisfaction, int professionalism, int scheduleAdherence, int communication, int proactiveness) {
        this.comment = comment;
        this.ratingSatisfaction = satisfaction;
        this.ratingProfessionalism = professionalism;
        this.ratingScheduleAdherence = scheduleAdherence;
        this.ratingCommunication = communication;
        this.ratingProactiveness = proactiveness;
    }
}
