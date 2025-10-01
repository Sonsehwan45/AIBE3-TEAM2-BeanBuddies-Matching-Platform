package com.back.domain.evaluation.service;

import com.back.domain.evaluation.repository.ClientEvaluationRepository;
import com.back.domain.evaluation.repository.FreelancerEvaluationRepository;
import com.back.domain.member.member.repository.MemberRepository;
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


}
