package com.back.standard.converter;

import com.back.domain.freelancer.freelancer.constant.CareerLevel;
import java.util.Arrays;
import java.util.List;
import org.springframework.stereotype.Component;

@Component
public class FreelancerSearchConditionConverter {

    public CareerLevel convertCareerLevel(String careerLevel) {
        return CareerLevel.of(careerLevel);
    }

    public List<Long> convertIds(String input) {
        if (input == null || input.isBlank()) {
            return List.of();
        }

        return Arrays.stream(input.trim().split(","))
                .map(String::trim)
                .map(Long::valueOf)
                .toList();
    }
}
