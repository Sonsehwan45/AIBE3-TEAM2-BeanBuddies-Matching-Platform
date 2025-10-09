package com.back.domain.evaluation.service;

import com.back.domain.evaluation.dto.EvaluationCreateReq;
import com.back.domain.evaluation.repository.ClientEvaluationRepository;
import com.back.domain.evaluation.repository.FreelancerEvaluationRepository;
import com.back.domain.member.member.constant.Role;
import com.back.domain.member.member.entity.Member;
import com.back.domain.member.member.repository.MemberRepository;
import com.back.domain.project.project.entity.Project;
import com.back.domain.project.project.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class EvaluationService {
    private final FreelancerEvaluationRepository freelancerEvaluationRepository;
    private final ClientEvaluationRepository clientEvaluationRepository;
    private final MemberRepository memberRepository;
    private final ProjectRepository projectRepository;

    @Transactional
    public void createEvaluation(Long evaluatorId, EvaluationCreateReq evaluationCreateReq){
        Member evaluatorMember = memberRepository.findById(evaluatorId)
                .orElseThrow(()-> new IllegalArgumentException("평가자를 찾을 수 없습니다."));

        Project project = projectRepository.findById(evaluationCreateReq.projectId())
                .orElseThrow(() -> new IllegalArgumentException("프로젝트를 찾을 수 없습니다."));

        //평가 평균 계산
        EvaluationCreateReq.Ratings ratings = evaluationCreateReq.ratings();
        double average = (ratings.professionalism() + ratings.scheduleAdherence() + ratings.communication() + ratings.proactiveness())/4.0;

        int satisfactionScore = (int) Math.round(average);
    }
}
