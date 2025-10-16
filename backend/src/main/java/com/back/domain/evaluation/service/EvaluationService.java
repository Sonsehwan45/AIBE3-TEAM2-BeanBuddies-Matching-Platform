package com.back.domain.evaluation.service;

import com.back.domain.client.client.entity.Client;
import com.back.domain.client.client.repository.ClientRepository;
import com.back.domain.evaluation.dto.EvaluationCreateReq;
import com.back.domain.evaluation.dto.EvaluationResponse;
import com.back.domain.evaluation.dto.EvaluationUpdateReq;
import com.back.domain.evaluation.dto.EvaluationsWithCountResponse;
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
import com.back.global.exception.ServiceException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class EvaluationService {

    private final MemberRepository memberRepository;
    private final ClientRepository clientRepository;
    private final FreelancerRepository freelancerRepository;
    private final ProjectRepository projectRepository;
    private final ClientEvaluationRepository clientEvaluationRepository;
    private final FreelancerEvaluationRepository freelancerEvaluationRepository;

    private Freelancer findByFreelancerId(Long id) {
        return freelancerRepository.findById(id)
                .orElseThrow(() -> new ServiceException("404", "프리랜서 정보를 찾을 수 없습니다."));
    }

    private Client findByClientId(Long id) {
        return clientRepository.findById(id)
                .orElseThrow(() -> new ServiceException("404", "클라이언트 정보를 찾을 수 없습니다."));
    }

    @Transactional
    public EvaluationResponse createEvaluation(Long evaluatorId, EvaluationCreateReq request) {
        Member evaluatorMember = memberRepository.findById(evaluatorId)
                .orElseThrow(() -> new ServiceException("404", "평가자를 찾을 수 없습니다."));

        Project project = projectRepository.findById(request.projectId())
                .orElseThrow(() -> new ServiceException("404", "프로젝트를 찾을 수 없습니다."));

        EvaluationCreateReq.Ratings ratings = request.ratings();
        double average = (ratings.professionalism() + ratings.scheduleAdherence() +
                ratings.communication() + ratings.proactiveness()) / 4.0;
        int satisfactionScore = (int) Math.round(average);


        if (evaluatorMember.getRole() == Role.CLIENT) {

            Client clientEvaluator = findByClientId(evaluatorId);

            Freelancer freelancerEvaluatee = findByFreelancerId(request.evaluateeId());

            FreelancerEvaluation review = new FreelancerEvaluation(project, clientEvaluator, freelancerEvaluatee, request.comment(),
                    satisfactionScore, ratings.professionalism(), ratings.scheduleAdherence(),
                    ratings.communication(), ratings.proactiveness());

            FreelancerEvaluation savedReview = freelancerEvaluationRepository.save(review);
            updateFreelancerRatingAvg(freelancerEvaluatee.getId());

            return EvaluationResponse.from(savedReview);

        } else if (evaluatorMember.getRole() == Role.FREELANCER) {
            Freelancer freelancerEvaluator = findByFreelancerId(evaluatorId);

            Client clientEvaluatee = findByClientId(request.evaluateeId());

            ClientEvaluation review = new ClientEvaluation(project, clientEvaluatee, freelancerEvaluator, request.comment(),
                    satisfactionScore, ratings.professionalism(), ratings.scheduleAdherence(),
                    ratings.communication(), ratings.proactiveness());

            ClientEvaluation savedReview = clientEvaluationRepository.save(review);
            updateClientRatingAvg(clientEvaluatee.getId());

            return EvaluationResponse.from(savedReview);
        }

        throw new ServiceException("403", "평가를 등록할 권한이 없는 사용자입니다.");
    }

    @Transactional
    public EvaluationResponse updateEvaluation(Long evaluatorId, EvaluationUpdateReq request){
        Member member = memberRepository.findById(evaluatorId)
                .orElseThrow(() -> new ServiceException("404", "평가자를 찾을 수 없습니다."));

        EvaluationUpdateReq.Ratings  ratings = request.ratings();
        double average = (ratings.professionalism() + ratings.scheduleAdherence() +
                ratings.communication() + ratings.proactiveness()) / 4.0;
        int satisfactionScore = (int)Math.round(average);

        if(member.getRole() == Role.CLIENT) {
            //클라이언트가 프리랜서에 대한 평가 수정
            FreelancerEvaluation evaluation = freelancerEvaluationRepository.findById(request.evaluationId())
                    .orElseThrow(() -> new ServiceException("404", "해당 프리랜서 평가를 찾을 수 없습니다."));

            //현재 사용자가 이 평가를 등록한 클라이언트인지 확인
            if(!evaluation.getClient().getMember().getId().equals(evaluatorId)){
                throw new ServiceException("403", "해당 평가를 수정할 권한이 없습니다.");
            }

            evaluation.modify(
                    request.comment(), satisfactionScore, ratings.professionalism(),
                    ratings.scheduleAdherence(), ratings.communication(), ratings.proactiveness()
            );

            // 평점 재계산 (수정 후에도 평균을 다시 계산해야 함)
            updateFreelancerRatingAvg(evaluation.getFreelancer().getId());

            return EvaluationResponse.from(evaluation);
        }else if (member.getRole() == Role.FREELANCER) {
            // 프리랜서가 클라이언트에 대한 평가 수정
            ClientEvaluation evaluation = clientEvaluationRepository.findById(request.evaluationId())
                    .orElseThrow(() -> new ServiceException("404", "해당 클라이언트 평가를 찾을 수 없습니다."));

            // 현재 사용자가 이 평가를 등록한 프리랜서인지 확인
            if (!evaluation.getFreelancer().getMember().getId().equals(evaluatorId)) {
                throw new ServiceException("403", "해당 평가를 수정할 권한이 없습니다.");
            }

            evaluation.modify(
                    request.comment(), satisfactionScore, ratings.professionalism(),
                    ratings.scheduleAdherence(), ratings.communication(), ratings.proactiveness()
            );

            // 평점 재계산
            updateClientRatingAvg(evaluation.getClient().getId());

            return EvaluationResponse.from(evaluation);
        }
        throw new ServiceException("403", "평가를 수정할 권한이 없는 사용자입니다.");
    }

    //프리랜서 총 평점 계산
    private void updateFreelancerRatingAvg(Long freelancerId) {
        List<FreelancerEvaluation> evaluations = freelancerEvaluationRepository.findByFreelancerIdDetails(freelancerId);

        double average = evaluations.stream()
                .mapToInt(FreelancerEvaluation::getRatingSatisfaction)
                .average()
                .orElse(0.0);

        Freelancer freelancer = freelancerRepository.findById(freelancerId)
                .orElseThrow(() -> new ServiceException("404", "평점 업데이트 중 프리랜서를 찾을 수 없습니다."));

        freelancer.updateRatingAvg(average);
    }

    //클라이언트 총 평점 계산
    private void updateClientRatingAvg(Long clientId) {
        List<ClientEvaluation> evaluations = clientEvaluationRepository.findByClientId(clientId);

        double average = evaluations.stream()
                .mapToInt(ClientEvaluation::getRatingSatisfaction)
                .average()
                .orElse(0.0);

        Client client = clientRepository.findById(clientId)
                .orElseThrow(() -> new ServiceException("404", "평점 업데이트 중 클라이언트를 찾을 수 없습니다."));

        client.updateRatingAvg(average);
    }

    //자신이 받은 평가 리스트를 반환
    @Transactional(readOnly = true)
    public EvaluationsWithCountResponse getEvaluations(Long userId) {
        Member member = memberRepository.findById(userId)
                .orElseThrow(() -> new ServiceException("404", "사용자를 찾을 수 없습니다."));

        List<EvaluationResponse> evaluationResponses; // 결과를 담을 리스트

        // 역할에 따라 분기하여 평가 목록을 가져옴
        if (member.getRole() == Role.CLIENT) {
            List<ClientEvaluation> evaluations = clientEvaluationRepository.findByClientId(userId);
            evaluationResponses = evaluations.stream()
                    .map(EvaluationResponse::from)
                    .collect(Collectors.toList());
        } else if (member.getRole() == Role.FREELANCER) {
            List<FreelancerEvaluation> evaluations = freelancerEvaluationRepository.findByFreelancerIdDetails(userId);
            evaluationResponses = evaluations.stream()
                    .map(EvaluationResponse::from)
                    .collect(Collectors.toList());
        } else {
            evaluationResponses = Collections.emptyList();
        }

        // 최종적으로 개수(evaluationResponses.size())와 목록을 DTO에 담아 반환
        return new EvaluationsWithCountResponse(evaluationResponses.size(), evaluationResponses);
    }


    //자신이 작성한 평가 리스트 반환
    @Transactional(readOnly = true)
    public EvaluationsWithCountResponse getWrittenEvaluations(Long userId){
        Member member = memberRepository.findById(userId)
                .orElseThrow(() -> new ServiceException("404", "사용자를 찾을 수 없습니다."));

        //반환할 평가 리스트를 저장할 변수 선언
        List<EvaluationResponse> evaluationResponses;

        //역할에 따라 분기
        if(member.getRole() == Role.CLIENT){
            //클라이언트가 자신이 작성한 평가 목록 조회
            List<FreelancerEvaluation> evaluations = freelancerEvaluationRepository.findByClientId(userId);

            evaluationResponses = evaluations.stream()
                    .map(EvaluationResponse::from)
                    .collect(Collectors.toList());
        }
        else if (member.getRole() == Role.FREELANCER){
            //프리랜서가 자신이 작성한 평가 목록 조회
            List<ClientEvaluation> evaluations = clientEvaluationRepository.findByFreelancerId(userId);

            evaluationResponses = evaluations.stream()
                    .map(EvaluationResponse::from)
                    .collect(Collectors.toList());
        }
        else{
            evaluationResponses = Collections.emptyList();
        }
        return new EvaluationsWithCountResponse(evaluationResponses.size(), evaluationResponses);
    }

    public EvaluationsWithCountResponse getMyEvaluations(Long freelancerId) {
        Freelancer freelancer = freelancerRepository.findById(freelancerId)
                .orElseThrow(() -> new ServiceException("404", "프리랜서를 찾을 수 없습니다."));

        List<FreelancerEvaluation> evaluations = freelancerEvaluationRepository.findByFreelancerIdDetails(freelancerId);

        List<EvaluationResponse> evaluationResponses = evaluations.stream()
                .map(EvaluationResponse::from)
                .collect(Collectors.toList());

        return new EvaluationsWithCountResponse(evaluationResponses.size(), evaluationResponses);
    }
}