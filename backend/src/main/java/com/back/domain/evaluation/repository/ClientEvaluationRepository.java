package com.back.domain.evaluation.repository;

import com.back.domain.evaluation.entity.ClientEvaluation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClientEvaluationRepository extends JpaRepository<ClientEvaluation,Long> {
    List<ClientEvaluation> findByClientId(Long clientId);

    //프리랜서ID(평자가)로 프리랜서가 작성한 평가 리스트 조회
    List<ClientEvaluation> findByFreelancerId(Long freelancerId);
}
