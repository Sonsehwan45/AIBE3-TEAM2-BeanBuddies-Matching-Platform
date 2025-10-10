package com.back.domain.freelancer.freelancer.repository;

import com.back.domain.freelancer.freelancer.entity.Freelancer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FreelancerRepository extends JpaRepository<Freelancer, Long>, FreelancerRepositoryCustom {

}
