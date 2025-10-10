package com.back.domain.freelancer.join.compositekey;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

@Embeddable
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode
public class FreelancerInterestId {

    @Column(name = "freelancer_id")
    private Long freelancerId;

    @Column(name = "interest_id")
    private Long interestId;
}
