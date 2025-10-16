package com.back.domain.application.application.service;

import com.back.domain.application.application.constant.ApplicationStatus;
import com.back.domain.application.application.dto.ApplicationWriteReqBody;
import com.back.domain.application.application.entity.Application;
import com.back.domain.application.application.repository.ApplicationRepository;
import com.back.domain.freelancer.freelancer.entity.Freelancer;
import com.back.domain.project.project.entity.Project;
import com.back.global.exception.ServiceException;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ApplicationService {
    private final ApplicationRepository applicationRepository;

    public long count() {
        return applicationRepository.count();
    }

    public Application create(ApplicationWriteReqBody reqBody, Freelancer freelancer, Project project) {
        Application application = new Application(reqBody, freelancer, project);

        return applicationRepository.save(application);
    }

    public Optional<Application> findLatest() {
        return applicationRepository.findFirstByOrderByIdDesc();
    }

    public Application findById(long id) {
        return applicationRepository.findByIdWithDetail(id).orElseThrow(
                () -> new ServiceException("401-1", "해당 지원서가 존재하지 않습니다.")
        );
    }

    public void update(Application application, ApplicationStatus status) {
        application.modifyStatus(status);
    }

    public void delete(Application application) {
        applicationRepository.delete(application);
    }

    public List<Application> findAllByProject(Project project) {
        return applicationRepository.findAllByProject(project);
    }

    public Page<Application> findAllByProject(Project project, Pageable pageable) {
        return applicationRepository.findAllByProject(project, pageable);
    }

    public List<Application> findAllByFreeLancer(Freelancer freelancer) {
        return applicationRepository.findAllByFreelancer(freelancer);
    }

    public Page<Application> findAllByFreeLancer(Freelancer freelancer, Pageable pageable) {
        return applicationRepository.findAllByFreelancer(freelancer, pageable);
    }

    public Optional<Application> findByProjectAndStatus(Project project, ApplicationStatus status) {
        return applicationRepository.findByProjectAndStatus(project, status);
    }
}
