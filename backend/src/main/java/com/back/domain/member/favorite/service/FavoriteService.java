package com.back.domain.member.favorite.service;

import com.back.domain.freelancer.freelancer.entity.Freelancer;
import com.back.domain.freelancer.freelancer.service.FreelancerService;
import com.back.domain.member.favorite.entity.FreelancerFavorite;
import com.back.domain.member.favorite.entity.ProjectFavorite;
import com.back.domain.member.favorite.repository.FreelancerFavoriteRepository;
import com.back.domain.member.favorite.repository.ProjectFavoriteRepository;
import com.back.domain.member.member.entity.Member;
import com.back.domain.project.project.entity.Project;
import com.back.domain.project.project.service.ProjectService;
import com.back.global.exception.ServiceException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FavoriteService {
    private final ProjectFavoriteRepository projectFavoriteRepository;
    private final FreelancerFavoriteRepository freelancerFavoriteRepository;
    private final ProjectService projectService;
    private final FreelancerService freelancerService;

    @Transactional(readOnly = true)
    public List<ProjectFavorite> findProjectFavorites(Member member) {
        return projectFavoriteRepository.findAllByMember(member);
    }

    @Transactional
    public void addProjectFavorite(Member member, Long projectId) {
        Project project = projectService.findById(projectId);
        var existing = projectFavoriteRepository.findByMemberAndProject(member, project);
        if (existing.isPresent()) {
            throw new ServiceException("409-1", "이미 즐겨찾기에 추가된 프로젝트입니다.");
        }
        projectFavoriteRepository.save(new ProjectFavorite(member, project));
    }

    @Transactional
    public void removeProjectFavorite(Member member, Long projectId) {
        Project project = projectService.findById(projectId);
        var existing = projectFavoriteRepository.findByMemberAndProject(member, project);
        if (existing.isEmpty()) {
            throw new ServiceException("404-2", "즐겨찾기에 등록된 프로젝트가 아닙니다.");
        }
        projectFavoriteRepository.deleteByMemberAndProject(member, project);
    }

    @Transactional(readOnly = true)
    public List<FreelancerFavorite> findFreelancerFavorites(Member member) {
        return freelancerFavoriteRepository.findAllByMember(member);
    }

    @Transactional
    public void addFreelancerFavorite(Member member, Long freelancerMemberId) {
        // Freelancer id is mapped to Member id (MapsId), so use findByIdWithMember
        Freelancer freelancer = freelancerService.findByIdWithMember(freelancerMemberId);
        var existing = freelancerFavoriteRepository.findByMemberAndFreelancer(member, freelancer);
        if (existing.isPresent()) {
            throw new ServiceException("409-2", "이미 즐겨찾기에 추가된 프리랜서입니다.");
        }
        freelancerFavoriteRepository.save(new FreelancerFavorite(member, freelancer));
    }

    @Transactional
    public void removeFreelancerFavorite(Member member, Long freelancerMemberId) {
        Freelancer freelancer = freelancerService.findByIdWithMember(freelancerMemberId);
        var existing = freelancerFavoriteRepository.findByMemberAndFreelancer(member, freelancer);
        if (existing.isEmpty()) {
            throw new ServiceException("404-3", "즐겨찾기에 등록된 프리랜서가 아닙니다.");
        }
        freelancerFavoriteRepository.deleteByMemberAndFreelancer(member, freelancer);
    }
}
