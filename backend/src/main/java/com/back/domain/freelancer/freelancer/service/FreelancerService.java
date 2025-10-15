package com.back.domain.freelancer.freelancer.service;

import com.back.domain.common.skill.entity.Skill;
import com.back.domain.common.skill.repository.SkillRepository;
import com.back.domain.freelancer.freelancer.dto.FreelancerSearchCondition;
import com.back.domain.freelancer.freelancer.dto.FreelancerSummary;
import com.back.domain.freelancer.freelancer.entity.Freelancer;
import com.back.domain.freelancer.freelancer.repository.FreelancerRepository;
import jakarta.persistence.EntityNotFoundException;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class FreelancerService {

    private final FreelancerRepository freelancerRepository;
    private final SkillRepository skillRepository;

    @Transactional(readOnly = true)
    public Freelancer findById(Long id) {
        return freelancerRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("존재하지 않는 프리랜서입니다."));
    }

    @Transactional
    public Freelancer updateFreelancer(Long id, String job, String freelancerEmail, String comment,
                                       Map<String, Integer> career, List<Long> skillIds) {
        Freelancer freelancer = freelancerRepository.findByIdWithSkills(id)
                .orElseThrow(() -> new EntityNotFoundException("존재하지 않는 프리랜서입니다."));

        // 스킬 제외한 정보 업데이트
        freelancer.updateInfo(job, freelancerEmail, comment, career);

        // 스킬 업데이트(dirty checking, cascade, orphanRemoval 이용)
        updateFreelancerSkills(skillIds, freelancer);

        return freelancerRepository.save(freelancer);
    }

    private void updateFreelancerSkills(List<Long> skillIds, Freelancer freelancer) {
        List<Skill> findSkills = skillRepository.findAllById(skillIds);

        if (findSkills.size() != skillIds.size()) {
            throw new EntityNotFoundException("존재하지 않는 스킬 ID가 포함되어 있습니다.");
        }

        freelancer.updateSkills(findSkills);
    }

    @Transactional(readOnly = true)
    public Page<FreelancerSummary> findAll(FreelancerSearchCondition condition, Pageable page) {
        return freelancerRepository.findAll(condition, page);
    }

    @Transactional(readOnly = true)
    public Freelancer findByIdWithMember(Long id) {
        return freelancerRepository.findByIdWithMember(id)
                .orElseThrow(() -> new EntityNotFoundException("존재하지 않는 프리랜서입니다."));
    }
}
