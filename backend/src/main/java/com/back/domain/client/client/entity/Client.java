package com.back.domain.client.client.entity;

import com.back.domain.member.member.entity.Member;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import lombok.Getter;
import lombok.NoArgsConstructor;

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
    private float ratingAvg;

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
}
