package com.back.domain.member.member.constant;

import com.back.domain.member.member.entity.Member;
import org.springframework.util.StringUtils;

public enum Role {
    CLIENT("Client"),
    FREELANCER("Freelancer"),
    ADMIN("Admin");

    private final String description;

    Role(String description) {
        this.description = description;
    }

}
