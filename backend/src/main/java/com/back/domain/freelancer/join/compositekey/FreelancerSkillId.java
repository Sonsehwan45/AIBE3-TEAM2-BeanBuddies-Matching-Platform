package com.back.domain.freelancer.join.compositekey;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import java.io.Serializable;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Embeddable
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class FreelancerSkillId implements Serializable {

    @Column(name = "freelancer_id")
    private Long freelancerId;

    @Column(name = "skill_id")
    private Long skillId;
}
