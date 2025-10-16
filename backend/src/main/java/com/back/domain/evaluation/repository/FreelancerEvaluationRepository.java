package com.back.domain.evaluation.repository;

import com.back.domain.evaluation.entity.FreelancerEvaluation;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface FreelancerEvaluationRepository extends JpaRepository<FreelancerEvaluation, Long> {
    //클라이언트ID(평자가)로 클라이언트가 작성한 평가 리스트 조회
    List<FreelancerEvaluation> findByClientId(Long clientId);

    @Query("""
            SELECT fe FROM FreelancerEvaluation fe
            JOIN FETCH fe.project p
            JOIN FETCH fe.freelancer f
            JOIN FETCH fe.client c
            WHERE f.id = :freelancerId
            """)
    List<FreelancerEvaluation> findByFreelancerIdDetails(Long freelancerId);
}
