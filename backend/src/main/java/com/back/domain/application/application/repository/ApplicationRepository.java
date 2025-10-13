package com.back.domain.application.application.repository;

import com.back.domain.application.application.entity.Application;
import com.back.domain.freelancer.freelancer.entity.Freelancer;
import com.back.domain.project.project.entity.Project;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, Long> {
    Optional<Application> findFirstByOrderByIdDesc();

    List<Application> findAllByProject(Project project);
    List<Application> findAllByFreelancer(Freelancer freelancer);

    Page<Application> findAllByFreelancer(Freelancer freelancer, Pageable pageable);
    Page<Application> findAllByProject(Project project, Pageable pageable);
}
