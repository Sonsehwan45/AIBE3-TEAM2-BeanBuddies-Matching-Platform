package com.back.domain.common.skill.service;

import com.back.domain.common.skill.dto.SkillDto;
import com.back.domain.common.skill.entity.Skill;
import com.back.domain.common.skill.repository.SkillRepository;
import com.back.domain.project.project.repository.ProjectSkillRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SkillService {
    private final SkillRepository skillRepository;
    private final ProjectSkillRepository projectSkillRepository;

    public long count() {
        return skillRepository.count();
    }

    public void create(String name) {
        Skill skill = new Skill(name);
        skillRepository.save(skill);
    }

    public List<SkillDto> findByProjectId(Long projectId) {
        return projectSkillRepository.findAllByProject_Id(projectId)
                .stream()
                .map(ps -> new SkillDto(ps.getSkill()))
                .toList();
    }

    public List<Skill> findAllById(List<Long> skillsId) {
        return skillRepository.findAllById(skillsId);
    }

    public List<Skill> findAll() {
        return skillRepository.findAll();
    }
}
