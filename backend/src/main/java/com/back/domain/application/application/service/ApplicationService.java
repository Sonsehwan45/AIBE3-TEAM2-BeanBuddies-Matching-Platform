package com.back.domain.application.application.service;

import com.back.domain.application.application.constant.ApplicationStatus;
import com.back.domain.application.application.dto.ApplicationWriteReqBody;
import com.back.domain.application.application.entity.Application;
import com.back.domain.application.application.repository.ApplicationRepository;
import com.back.domain.freelancer.freelancer.entity.Freelancer;
import com.back.domain.project.project.entity.Project;
import com.back.global.exception.ServiceException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

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
        return applicationRepository.findById(id).orElseThrow(
                () -> new ServiceException("401-1", "해당 지원서가 존재하지 않습니다.")
        );
    }

    public void update(Application application, ApplicationStatus status) {
        application.modifyStatus(status);
    }

    public void delete(Application application) {
        applicationRepository.delete(application);
    }
}
