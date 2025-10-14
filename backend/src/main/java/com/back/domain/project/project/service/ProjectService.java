package com.back.domain.project.project.service;

import com.back.domain.application.application.entity.Application;
import com.back.domain.application.application.service.ApplicationService;
import com.back.domain.client.client.entity.Client;
import com.back.domain.common.interest.dto.InterestDto;
import com.back.domain.common.interest.entity.Interest;
import com.back.domain.common.interest.service.InterestService;
import com.back.domain.common.skill.dto.SkillDto;
import com.back.domain.common.skill.entity.Skill;
import com.back.domain.common.skill.service.SkillService;
import com.back.domain.member.member.entity.Member;
import com.back.domain.project.project.constant.ProjectStatus;
import com.back.domain.project.project.dto.ProjectSearchDto;
import com.back.domain.project.project.dto.ProjectSummaryDto;
import com.back.domain.project.project.entity.Project;
import com.back.domain.project.project.entity.ProjectInterest;
import com.back.domain.project.project.entity.ProjectSkill;
import com.back.domain.project.project.repository.ProjectInterestRepository;
import com.back.domain.project.project.repository.ProjectRepository;
import com.back.domain.project.project.repository.ProjectSkillRepository;
import com.back.global.exception.ServiceException;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ProjectService {
    private final ProjectRepository projectRepository;

    private final ApplicationService applicationService;
    private final InterestService interestService;
    private final SkillService skillService;

    private final ProjectInterestRepository projectInterestRepository;
    private final ProjectSkillRepository projectSkillRepository;

    public long count() {
        return projectRepository.count();
    }

    public Project create(
            Client client,
            String title,
            String summary,
            BigDecimal price,
            String preferredCondition,
            String payCondition,
            String workingCondition,
            String duration,
            String description,
            LocalDateTime deadline,
            List<Long> skills,
            List<Long> interests
    ) {
        Project project = new Project(
                client,
                title,
                summary,
                price,
                preferredCondition,
                payCondition,
                workingCondition,
                duration,
                description,
                deadline
                );
        projectRepository.save(project);

        List<Skill> skillList = skillService.findAllById(skills);
        projectSkillRepository.saveAll(
                skillList.stream()
                        .map(skill -> new ProjectSkill(project, skill))
                        .toList()
        );

        List<Interest> interestList = interestService.findAllById(interests);
        projectInterestRepository.saveAll(
                interestList.stream()
                        .map(interest -> new ProjectInterest(project, interest))
                        .toList()
        );

        return project;
    }

    public Optional<Project> findLatest() {
        return projectRepository.findFirstByOrderByIdDesc();
    }

    public Project
    findById(long id) {
        return projectRepository.findById(id).orElseThrow(
                () -> new ServiceException("404-1", "해당 프로젝트가 존재하지 않습니다.")
        );
    }

    public void delete(Project project) {
        // projectSkill과 projectInterest는 orphanRemoval 옵션을 통해 자동 삭제
        // application 삭제
        List<Application> applications = applicationService.findAllByProject(project);
        for(Application application: applications) applicationService.delete(application);

        projectRepository.delete(project);
    }

    public List<ProjectSkill> findProjectSkillAllByProject(Project project) {
        return projectSkillRepository.findAllByProject(project);
    }

    public List<ProjectInterest> findProjectInterestAllByProject(Project project) {
        return projectInterestRepository.findAllByProject(project);
    }

    public void update(
            Project project,
            String title,
            String summary,
            BigDecimal price,
            String preferredCondition,
            String payCondition,
            String workingCondition,
            String duration,
            String description,
            LocalDateTime deadline,
            ProjectStatus status,
            List<Long> skills,
            List<Long> interests
    ) {
        project.modify(
                title,
                summary,
                price,
                preferredCondition,
                payCondition,
                workingCondition,
                duration,
                description,
                deadline,
                status
        );

        // ProjectSkill, ProjectInterest 수정 (삭제 후 추가)
        // 1. ProjectSkill, ProjectInterest 삭제
        projectSkillRepository.deleteAllByProject(project);
        projectInterestRepository.deleteAllByProject(project);

        // 2. ProjectSkill, ProjectInterest 새로 추가
        List<Skill> skillList = skillService.findAllById(skills);
        for (Skill skill : skillList) {
            projectSkillRepository.save(new ProjectSkill(project, skill));
        }

        List<Interest> interestList = interestService.findAllById(interests);
        for (Interest interest : interestList) {
            projectInterestRepository.save(new ProjectInterest(project, interest));
        }
    }

    public List<Project> getList() {
        return projectRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Page<ProjectSummaryDto> search(ProjectSearchDto searchDto, Pageable pageable) {
        // QueryDSL 기반 search 호출
        Page<Project> projects = projectRepository.searchProjects(
                searchDto.keywordType(),
                searchDto.keyword(),
                searchDto.skillIds(),
                searchDto.interestIds(),
                searchDto.status(),
                pageable
        );

        // DTO 변환
        return projects.map(project -> {
            List<SkillDto> skills = skillService.findByProjectId(project.getId());
            List<InterestDto> interests = interestService.findByProjectId(project.getId());
            return new ProjectSummaryDto(project, skills, interests);
        });
    }

    @Transactional(readOnly = true)
    public Project findByIdWithAuthor(Long id) {
        return projectRepository.findByIdWithAuthor(id).orElseThrow(
                () -> new EntityNotFoundException("해당 프로젝트가 존재하지 않습니다.")
        );
    }

    public boolean isAuthor(Member member, Project project) {
        return project.getClient().getMember().getId().equals(member.getId());
    }

    @Transactional(readOnly = true)
    public List<Project> findAllByMemberId(Long memberId) {
        return projectRepository.findAllByClientMemberIdOrderByIdDesc(memberId);
    }
}
