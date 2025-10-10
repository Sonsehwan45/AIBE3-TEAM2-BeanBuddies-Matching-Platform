package com.back.domain.member.member.entity;

import com.back.domain.client.client.entity.Client;
import com.back.domain.freelancer.freelancer.entity.Freelancer;
import com.back.domain.member.member.constant.MemberStatus;
import com.back.domain.member.member.constant.Role;
import com.back.global.jpa.entity.BaseEntity;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.OneToOne;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@Getter
@ToString
@NoArgsConstructor
public class Member extends BaseEntity {
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Role role;

    @Column(nullable = false)
    private String name;

    @Column(unique = true)
    private String username;

    private String password;

    private String email;

    //private String profileImgUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MemberStatus status;

    private LocalDateTime deleteDate;

    @OneToOne(mappedBy = "member", cascade = CascadeType.ALL, orphanRemoval = true)
    private Freelancer freelancer;

    @OneToOne(mappedBy = "member", cascade = CascadeType.ALL, orphanRemoval = true)
    private Client client;

    public Member(String role, String name, String username, String password, String email) {
        this.role = Role.valueOf(role);
        this.name = name;
        this.username = username;
        this.password = password;
        this.email = email;
        this.status = MemberStatus.valueOf("ACTIVE");
    }

    // Freelancer 등록 메서드 추가
    public void registerFreelancer(Freelancer freelancer) {
        this.freelancer = freelancer;
        freelancer.join(this);
    }

    // Client 등록 메서드 추가
    public void registerClient(Client client) {
        this.client = client;
        client.join(this);
    }

    public void changeStatus(String status) {
        this.status = MemberStatus.valueOf(status);
    }
}
