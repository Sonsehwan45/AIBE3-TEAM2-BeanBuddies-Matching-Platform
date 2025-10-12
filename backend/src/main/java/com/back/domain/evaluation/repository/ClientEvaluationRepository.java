package com.back.domain.evaluation.repository;

import com.back.domain.evaluation.entity.ClientEvaluation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ClientEvaluationRepository extends JpaRepository<ClientEvaluation,Long> {
    List<ClientEvaluation> findByClientId(Long clientId);
}
