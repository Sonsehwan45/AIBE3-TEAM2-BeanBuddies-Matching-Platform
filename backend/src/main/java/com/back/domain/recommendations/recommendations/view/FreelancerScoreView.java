package com.back.domain.recommendations.recommendations.view;

public interface FreelancerScoreView {
    Long getFreelancerId();
    String getJob();
    String getOne_liner();
    String getTech_stack();
    Double getRatingAvg();
    Double getTextScore();
}