package com.back.domain.evaluation.repository;

import com.back.domain.evaluation.entity.FreelancerEvaluation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FreelancerEvaluationRepository extends JpaRepository<FreelancerEvaluation, Long> {
    List<FreelancerEvaluation> findByFreelancerId(Long freelancerId);

    //클라이언트ID(평자가)로 클라이언트가 작성한 평가 리스트 조회
    List<FreelancerEvaluation> findByClientId(Long clientId);
}
