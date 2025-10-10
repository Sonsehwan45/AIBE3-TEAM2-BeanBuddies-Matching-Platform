package com.back.domain.freelancer.join.repository;

import com.back.domain.freelancer.join.compositekey.FreelancerSkillId;
import com.back.domain.freelancer.join.entity.FreelancerSkill;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FreelancerSkillRepository extends JpaRepository<FreelancerSkill, FreelancerSkillId> {

    void deleteAllByFreelancerId(Long freelancerId);

    List<FreelancerSkill> findAllBySkillId(Long SkillId);
}
