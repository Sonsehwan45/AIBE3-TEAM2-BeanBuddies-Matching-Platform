package com.back.domain.freelancer.freelancer.service;

import com.back.domain.common.skill.entity.Skill;
import com.back.domain.common.skill.repository.SkillRepository;
import com.back.domain.freelancer.freelancer.dto.FreelancerSearchCondition;
import com.back.domain.freelancer.freelancer.dto.FreelancerSummary;
import com.back.domain.freelancer.freelancer.entity.Freelancer;
import com.back.domain.freelancer.freelancer.repository.FreelancerRepository;
import com.back.domain.freelancer.join.entity.FreelancerSkill;
import com.back.domain.freelancer.join.repository.FreelancerSkillRepository;
import jakarta.persistence.EntityNotFoundException;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class FreelancerService {

    private final FreelancerRepository freelancerRepository;
    private final FreelancerSkillRepository freelancerSkillRepository;
    private final SkillRepository skillRepository;

    public Freelancer findById(Long id) {
        return freelancerRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("존재하지 않는 프리랜서입니다."));
    }

    @Transactional
    public Freelancer updateFreelancer(Long id, String job, String freelancerEmail, String comment,
                                       Map<String, Integer> career, List<Long> skillIds) {
        Freelancer freelancer = findById(id);
        freelancer.updateInfo(job, freelancerEmail, comment, career);

        updateFreelancerSkills(freelancer, skillIds);

        return freelancerRepository.save(freelancer);
    }

    @Transactional(readOnly = true)
    public Page<FreelancerSummary> findAll(FreelancerSearchCondition condition, Pageable page) {
        int pageNumber = page.getPageNumber();
        int pageSize = page.getPageSize();

        return freelancerRepository.findAll(condition, PageRequest.of(pageNumber, pageSize));
    }

    private void updateFreelancerSkills(Freelancer freelancer, List<Long> newSkillIds) {
        if (freelancer.getSkills().equals(newSkillIds) || newSkillIds == null) {
            return;
        }

        // 기존 스킬 모두 삭제
        freelancerSkillRepository.deleteAllByFreelancerId(freelancer.getId());
        freelancer.getSkills().clear();

        List<Skill> findSkills = skillRepository.findAllById(newSkillIds);

        // 요청한 스킬 기존에 저장되어 있었는지 확인
        if (findSkills.size() != newSkillIds.size()) {
            throw new EntityNotFoundException("존재하지 않는 스킬 ID가 포함되어 있습니다.");
        }

        // FreelancerSkill 엔티티 생성 및 저장
        List<FreelancerSkill> newFreelancerSkills = findSkills.stream()
                .map(skill -> new FreelancerSkill(freelancer, skill))
                .toList();

        freelancerSkillRepository.saveAll(newFreelancerSkills);

        // 양방향 연관관계 동기화
        freelancer.getSkills().addAll(newFreelancerSkills);
    }
}
