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
    private Integer ratingSatisfaction;//지금 평가의 평균

    @Column(nullable = false)
    private Integer ratingProfessionalism;//전문성(프로젝트 관리)

    @Column(nullable = false)
    private Integer ratingScheduleAdherence;//일정 준수(클: 급여일정 준수, 프: 협의 기간 준수)

    @Column(nullable = false)
    private Integer ratingCommunication;//커뮤니케이션(의사소통)

    @Column(nullable = false)
    private Integer ratingProactiveness;//적극성: 문제 해결, 제안 등 업무에 얼마나 능동적이었는지

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
