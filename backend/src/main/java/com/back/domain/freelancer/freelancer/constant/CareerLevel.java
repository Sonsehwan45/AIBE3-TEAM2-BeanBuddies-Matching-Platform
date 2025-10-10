package com.back.domain.freelancer.freelancer.constant;

import java.util.Arrays;
import lombok.Getter;

@Getter
public enum CareerLevel {
    NEWBIE("신입", 0, 0),
    JUNIOR("주니어", 1, 2),
    MID("미드", 3, 6),
    SENIOR("시니어", 7, Integer.MAX_VALUE),
    UNDEFINED("미입력", -1, -1)
    ;

    private final String description;
    private final int minYear;
    private final int maxYear;

    CareerLevel(String description, int minYear, int maxYear) {
        this.description = description;
        this.minYear = minYear;
        this.maxYear = maxYear;
    }

    public static CareerLevel of(Integer year) {
        if (year == null) {
            return UNDEFINED;
        }

        return Arrays.stream(CareerLevel.values())
                .filter(level -> level.minYear <= year && year <= level.maxYear)
                .findFirst()
                .orElse(UNDEFINED);
    }

    public static CareerLevel of(String str) {
        if (str == null) {
            return UNDEFINED;
        }

        return Arrays.stream(CareerLevel.values())
                .filter(level -> level.name().equalsIgnoreCase(str))
                .findFirst()
                .orElse(UNDEFINED);
    }
}
