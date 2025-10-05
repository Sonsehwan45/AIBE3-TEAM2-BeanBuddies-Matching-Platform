package com.back.domain.application.application.service;

import com.back.domain.application.application.dto.ApplicationWriteReqBody;
import com.back.domain.application.application.entity.Application;
import com.back.domain.application.application.repository.ApplicationRepository;
import com.back.domain.freelancer.freelancer.entity.Freelancer;
import com.back.domain.project.project.entity.Project;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class ApplicationService {
    private final ApplicationRepository applicationRepository;

    public Application create(ApplicationWriteReqBody reqBody, Freelancer freelancer, Project project) {
        Application application = new Application(reqBody, freelancer, project);

        return applicationRepository.save(application);
    }

    public Optional<Application> findLatest() {
        return applicationRepository.findFirstByOrderByIdDesc();
    }
}
