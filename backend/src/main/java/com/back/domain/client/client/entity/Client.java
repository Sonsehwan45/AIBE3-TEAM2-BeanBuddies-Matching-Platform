package com.back.domain.client.client.entity;

import com.back.domain.member.member.entity.Member;
import com.back.domain.project.project.entity.Project;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@NoArgsConstructor
@Getter
public class Client {

    @Id
    private Long id;

    @MapsId
    @OneToOne
    @JoinColumn(name = "member_id")
    private Member member;

    private String companySize;
    private String companyDescription;
    private String representative;
    private String businessNo;
    private String companyPhone;
    private String companyEmail;

    @Column(name = "rating_avg")
    //읽기전용?
    private double ratingAvg;

    //클라이언트 - 프로젝트
    @OneToMany(mappedBy = "client", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Project> projects = new ArrayList<>();

    public Client(Member member) {
        this.member = member;
    }

    public void join(Member member) {
        this.member = member;
    }

    // 클라이언트 정보 수정
    // NOTE : 현재 Client의 대부분의 필드는 null 허용이므로, null 체크는 하지 않음.
    // 다만 null 비허용으로 하고 초기 생성시, 빈 문자열로 초기화하는 방안도 고려할 수 있음.
    public void update(String companySize, String companyDescription, String representative,
                       String businessNo, String companyPhone, String companyEmail) {
        this.companySize = companySize;
        this.companyDescription = companyDescription;
        this.representative = representative;
        this.businessNo = businessNo;
        this.companyPhone = companyPhone;
        this.companyEmail = companyEmail;
    }

    //이미 계산된 평가 평균을 소수점 첫째 자리까지 반올림하기 위한 메서드
    public void updateRatingAvg(double ratingAvg) {
        this.ratingAvg = Math.round(ratingAvg * 10.0) / 10.0;
    }

    //회원 탈퇴 처리
    public void deleteInfo() {
        this.companySize = null;
        this.companyDescription = null;
        this.representative = null;
        this.businessNo = null;
        this.companyPhone = null;
        this.companyEmail = null;
    }
}
