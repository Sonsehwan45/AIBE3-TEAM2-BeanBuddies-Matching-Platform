package com.back.domain.freelancer.freelancer.service;

import com.back.domain.freelancer.freelancer.dto.FreelancerSearchCondition;
import com.back.domain.freelancer.freelancer.dto.FreelancerSummary;
import com.back.domain.freelancer.freelancer.entity.Freelancer;
import com.back.domain.freelancer.freelancer.repository.FreelancerRepository;
import jakarta.persistence.EntityNotFoundException;
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

    public Freelancer findById(Long id) {
        return freelancerRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("존재하지 않는 프리랜서입니다."));
    }

    @Transactional
    public Freelancer updateFreelancer(Long id, String job, String freelancerEmail,
                                 String comment, Map<String, Integer> career) {
        Freelancer freelancer = findById(id);
        freelancer.updateInfo(job, freelancerEmail, comment, career);

        return freelancerRepository.save(freelancer);
    }

    @Transactional(readOnly = true)
    public Page<FreelancerSummary> findAll(FreelancerSearchCondition condition, Pageable page) {
        int pageNumber = page.getPageNumber();
        int pageSize = page.getPageSize();

        //TODO : 동적 쿼리 구현
        Page<Freelancer> freelancers = freelancerRepository.findAll(PageRequest.of(pageNumber, pageSize));
        return convertToSummary(freelancers);
    }

    private Page<FreelancerSummary> convertToSummary(Page<Freelancer> freelancers) {
        return freelancers.map(FreelancerSummary::new);
    }
}
