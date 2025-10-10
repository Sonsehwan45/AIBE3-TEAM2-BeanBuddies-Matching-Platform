package com.back.domain.freelancer.join.entity;

import com.back.domain.common.skill.entity.Skill;
import com.back.domain.freelancer.freelancer.entity.Freelancer;
import com.back.domain.freelancer.join.compositekey.FreelancerSkillId;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor
public class FreelancerSkill {

    @EmbeddedId
    private FreelancerSkillId id;

    @MapsId("freelancerId")
    @ManyToOne
    @JoinColumn(name = "freelancer_id")
    private Freelancer freelancer;

    @MapsId("skillId")
    @ManyToOne
    @JoinColumn(name = "skill_id")
    private Skill skill;

    public FreelancerSkill(Freelancer freelancer, Skill skill) {
        this.freelancer = freelancer;
        this.skill = skill;
        this.id = new FreelancerSkillId(freelancer.getId(), skill.getId());
    }
}