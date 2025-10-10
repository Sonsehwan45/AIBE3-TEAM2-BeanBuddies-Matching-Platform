package com.back.domain.evaluation.repository;

import com.back.domain.evaluation.entity.FreelancerEvaluation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FreelancerEvaluationRepository extends JpaRepository<FreelancerEvaluation, Long> {
    List<FreelancerEvaluation> findByFreelancerId(Long freelancerId);
}
