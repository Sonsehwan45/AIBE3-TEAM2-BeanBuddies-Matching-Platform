package com.back.domain.freelancer.freelancer.repository;

import com.back.domain.freelancer.freelancer.entity.Freelancer;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface FreelancerRepository extends JpaRepository<Freelancer, Long>, FreelancerRepositoryCustom {

    @Query("SELECT f FROM Freelancer f JOIN FETCH f.member m WHERE f.id = :id")
    Optional<Freelancer> findByIdWithMember(Long id);
}
