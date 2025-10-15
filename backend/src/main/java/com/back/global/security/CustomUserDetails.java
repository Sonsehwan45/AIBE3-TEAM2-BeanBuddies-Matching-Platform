package com.back.global.security;

import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@Slf4j
@Getter
public class CustomUserDetails implements UserDetails {

    private final Long id;
    private final String name;
    private final String role;
    private final String status;
    private final String profileImgUrl;

    public CustomUserDetails(Long id, String name, String role, String status, String profileImgUrl) {
        this.id = id;
        this.name = name;
        this.role = role;
        this.status = status;
        this.profileImgUrl = profileImgUrl;
    }

    //Role 설정
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + role));
    }

    //상태 확인
    public boolean isActive() {
        return status.equals("ACTIVE");
    }

    public boolean isInactive() {
        return status.equals("INACTIVE");
    }

    public boolean isWithDrawn() {
        return status.equals("WITHDRAWN");
    }

    //사용하지 않는 getter
    @Override
    @Deprecated
    public String getPassword() {
        log.warn("getPassword() 호출됨 : JWT 기반 인증에서 호출되어서는 안 됩니다.");
        return "";
    }

    @Override
    @Deprecated
    public String getUsername() {
        log.warn("getUsername() 호출됨 : JWT 기반 인증에서 호출되어서는 안 됩니다.");
        return "";
    }
}
