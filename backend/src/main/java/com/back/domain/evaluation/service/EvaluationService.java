package com.back.domain.evaluation.service;

import com.back.domain.client.client.entity.Client;
import com.back.domain.client.client.repository.ClientRepository;
import com.back.domain.evaluation.dto.EvaluationCreateReq;
import com.back.domain.evaluation.entity.ClientEvaluation;
import com.back.domain.evaluation.entity.FreelancerEvaluation;
import com.back.domain.evaluation.repository.ClientEvaluationRepository;
import com.back.domain.evaluation.repository.FreelancerEvaluationRepository;
import com.back.domain.freelancer.freelancer.entity.Freelancer;
import com.back.domain.freelancer.freelancer.repository.FreelancerRepository;
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
    private final FreelancerRepository freelancerRepository;
    private final ClientRepository clientRepository;
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

        //평가자가 클라이언트
        if (evaluatorMember.getRole() == Role.CLIENT) {
            Client clientEvaluator = clientRepository.findById(evaluatorId)
                    .orElseThrow(() -> new IllegalArgumentException("클라이언트 정보를 찾을 수 없습니다."));
            Freelancer freelancerEvaluatee = freelancerRepository.findById(evaluationCreateReq.evaluateeId())
                    .orElseThrow(() -> new IllegalArgumentException("프리랜서 정보를 찾을 수 없습니다."));

            FreelancerEvaluation review = new FreelancerEvaluation(project, clientEvaluator, freelancerEvaluatee, evaluationCreateReq.comment(),
                    satisfactionScore, ratings.professionalism(), ratings.scheduleAdherence(),
                    ratings.communication(), ratings.proactiveness());
            freelancerEvaluationRepository.save(review);

        //평가자가 프리랜서
        } else if (evaluatorMember.getRole() == Role.FREELANCER) {
            Freelancer freelancerEvaluator = freelancerRepository.findById(evaluatorId)
                    .orElseThrow(() -> new IllegalArgumentException("프리랜서 정보를 찾을 수 없습니다."));
            Client clientEvaluatee = clientRepository.findById(evaluationCreateReq.evaluateeId())
                    .orElseThrow(() -> new IllegalArgumentException("클라이언트 정보를 찾을 수 없습니다."));

            ClientEvaluation review = new ClientEvaluation(project, clientEvaluatee, freelancerEvaluator, evaluationCreateReq.comment(),
                    satisfactionScore, ratings.professionalism(), ratings.scheduleAdherence(),
                    ratings.communication(), ratings.proactiveness());
            clientEvaluationRepository.save(review);
        }
    }
}
