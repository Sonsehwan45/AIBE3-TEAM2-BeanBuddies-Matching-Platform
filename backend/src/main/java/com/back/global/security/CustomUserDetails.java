package com.back.global.security;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

public class CustomUserDetails implements UserDetails {

    private final Long id;
    private final String name;
    private final String role;
    private final String status;

    public CustomUserDetails(Long id, String name, String role, String status) {
        this.id = id;
        this.name = name;
        this.role = role;
        this.status = status;
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

    //getter
    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getRole() {
        return role;
    }

    public String getStatus() {
        return status;
    }

    //사용하지 않는 getter
    @Override
    public String getPassword() {
        return "";
    }

    @Override
    public String getUsername() {
        return "";
    }
}
