package com.back.domain.recommendations.recommendations.view;

import java.math.BigDecimal;

public interface ProjectScoreView {
    Long getProjectId();
    String getTitle();
    String getSummary();
    BigDecimal getPrice();
    String getDuration();
    String getStatus();
    String getPreferred_condition();
    Double getTextScore();
}
