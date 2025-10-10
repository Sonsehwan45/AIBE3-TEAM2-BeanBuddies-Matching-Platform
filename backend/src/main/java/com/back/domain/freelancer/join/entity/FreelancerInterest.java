package com.back.domain.freelancer.join.entity;

import com.back.domain.common.interest.entity.Interest;
import com.back.domain.freelancer.freelancer.entity.Freelancer;
import com.back.domain.freelancer.join.compositekey.FreelancerInterestId;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;

@Entity
public class FreelancerInterest {

    @EmbeddedId
    private FreelancerInterestId id;

    @MapsId("freelancerId")
    @ManyToOne
    @JoinColumn(name = "freelancer_id")
    private Freelancer freelancer;

    @MapsId("interestId")
    @ManyToOne
    @JoinColumn(name = "interest_id")
    private Interest interest;
}
