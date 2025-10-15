package com.back.domain.member.member.service;

import com.back.domain.application.application.constant.ApplicationStatus;
import com.back.domain.member.member.entity.Member;
import com.back.domain.project.project.constant.ProjectStatus;
import com.back.domain.proposal.proposal.constant.ProposalStatus;
import jakarta.transaction.Transactional;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.assertj.core.api.AssertionsForInterfaceTypes.assertThat;

@SpringBootTest
@Transactional
public class MemberServiceTest {

    @Autowired
    private MemberService memberService;

    // 프리랜서 탈퇴 성공 - WAIT 지원서, OPEN 프로젝트
    @Test
    @DisplayName("프리랜서 탈퇴 성공 - WAIT 지원서 삭제, 제안서 WAIT → DENIED")
    void withdrawFreelancer_success() {
        Member freelancerMember = memberService.findByUsername("freelancer3").get();

        // DB 그대로 사용, 상태 변경 없음
        assertThat(freelancerMember.getFreelancer().getApplications())
                .allMatch(app -> app.getStatus() == ApplicationStatus.WAIT);
        assertThat(freelancerMember.getFreelancer().getApplications())
                .allMatch(app -> app.getProject().getStatus() == ProjectStatus.OPEN);

        memberService.withdrawMember(freelancerMember, "1234");

        // 탈퇴 후 상태 검증
        assertThat(freelancerMember.getStatus().name()).isEqualTo("WITHDRAWN");

        // 탈퇴 후 비식별화 검증 - Member
        assertThat(freelancerMember.getUsername()).isNull();
        assertThat(freelancerMember.getPassword()).isNull();
        assertThat(freelancerMember.getEmail()).isNull();
        assertThat(freelancerMember.getProfileImgUrl()).isNull();
        assertThat(freelancerMember.getName()).isEqualTo("탈퇴한 회원입니다.");
        assertThat(freelancerMember.getDeleteDate()).isNotNull();

        // 탈퇴 후 비식별화 검증 - Freelancer
        assertThat(freelancerMember.getFreelancer().getJob()).isNull();
        assertThat(freelancerMember.getFreelancer().getFreelancerEmail()).isNull();
        assertThat(freelancerMember.getFreelancer().getComment()).isNull();
        assertThat(freelancerMember.getFreelancer().getCareer()).isNull();
        assertThat(freelancerMember.getFreelancer().getCareerTotalYears()).isNull();
        assertThat(freelancerMember.getFreelancer().getSkills()).isEmpty();
        assertThat(freelancerMember.getFreelancer().getInterests()).isEmpty();

        // 탈퇴 후 지원서 상태 검증
        assertThat(freelancerMember.getFreelancer().getApplications())
                .allMatch(app -> app.getStatus() != ApplicationStatus.WAIT);

        // 탈퇴 후 제안서 상태 검증
        assertThat(freelancerMember.getFreelancer().getProposals())
                .allMatch(proposal -> proposal.getStatus() == ProposalStatus.DENIED);
    }

    // 클라이언트 탈퇴 성공 - 진행 중 프로젝트 없음
    @Test
    @DisplayName("클라이언트 탈퇴 성공 - 진행 중 프로젝트 없음")
    void withdrawClient_success() {
        Member clientMember = memberService.findByUsername("client3").get();

        // DB 그대로 사용, 상태 변경 없음
        assertThat(clientMember.getClient().getProjects())
                .allMatch(project -> project.getStatus() == ProjectStatus.OPEN);

        memberService.withdrawMember(clientMember, "1234");

        // 탈퇴 후 검증
        assertThat(clientMember.getStatus().name()).isEqualTo("WITHDRAWN");

        // 탈퇴 후 비식별화 검증 - Member
        assertThat(clientMember.getUsername()).isNull();
        assertThat(clientMember.getPassword()).isNull();
        assertThat(clientMember.getEmail()).isNull();
        assertThat(clientMember.getProfileImgUrl()).isNull();
        assertThat(clientMember.getName()).isEqualTo("탈퇴한 회원입니다.");
        assertThat(clientMember.getDeleteDate()).isNotNull();

        // 탈퇴 후 비식별화 검증 - Client
        assertThat(clientMember.getClient().getCompanySize()).isNull();
        assertThat(clientMember.getClient().getCompanyDescription()).isNull();
        assertThat(clientMember.getClient().getRepresentative()).isNull();
        assertThat(clientMember.getClient().getBusinessNo()).isNull();
        assertThat(clientMember.getClient().getCompanyPhone()).isNull();
        assertThat(clientMember.getClient().getCompanyEmail()).isNull();

        // 탈퇴 후 프로젝트 상태 검증
        clientMember.getClient().getProjects().forEach(project ->
                assertThat(project.getStatus()).isEqualTo(ProjectStatus.CLOSED)
        );

        // 탈퇴 후 지원서 상태 검증
        clientMember.getClient().getProjects().forEach(project ->
                assertThat(project.getApplications())
                        .allMatch(app -> app.getStatus() == ApplicationStatus.DENIED)
        );

        // 탈퇴 후 제안서 상태 검증
        clientMember.getClient().getProjects().forEach(project ->
                assertThat(project.getProposals())
                        .allMatch(proposal -> proposal.getStatus() == ProposalStatus.DENIED)
        );
    }
}
