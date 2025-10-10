package com.back.domain.freelancer.freelancer.repository;

import com.back.domain.freelancer.freelancer.dto.FreelancerSearchCondition;
import com.back.domain.freelancer.freelancer.dto.FreelancerSummary;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface FreelancerRepositoryCustom {

    public Page<FreelancerSummary> findAll(FreelancerSearchCondition condition, Pageable pageable);
}
