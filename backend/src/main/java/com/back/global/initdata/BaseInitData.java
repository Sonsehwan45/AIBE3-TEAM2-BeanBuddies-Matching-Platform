package com.back.global.initdata;

import com.back.domain.common.interest.service.InterestService;
import com.back.domain.common.skill.service.SkillService;
import com.back.domain.member.member.entity.Member;
import com.back.domain.member.member.service.MemberService;
import com.back.domain.project.project.service.ProjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@RequiredArgsConstructor
@Configuration
public class BaseInitData {

    @Autowired
    @Lazy
    private BaseInitData self;

    private final MemberService memberService;
    private final ProjectService projectService;
    private final SkillService skillService;
    private final InterestService interestService;


    @Bean
    ApplicationRunner baseInitDataApplicationRunner() {
        return args -> {
            self.addMember();
            self.addSkillAndInterest();
            self.addProject();
        };
    }

    @Transactional
    public void addMember() {

        if (memberService.count() > 0) return;

        //임의 데이터 추가
        Member admin = memberService.join("ADMIN", "관리자", "admin", "1234", "1234", "test@test.com");
        Member client1 = memberService.join("CLIENT", "클라이언트1", "client1", "1234", "1234", "test@test.com");
        Member client2 = memberService.join("CLIENT", "클라이언트2", "client2", "1234", "1234", "test@test.com");
        Member freelancer1 = memberService.join("FREELANCER", "프리랜서1", "freelancer1", "1234", "1234", "test@test.com");
        Member freelancer2 = memberService.join("FREELANCER", "프리랜서2", "freelancer2", "1234", "1234", "test@test.com");

        //클라이언트2, 프리랜서2는 활동 정지 상태로 변경
        memberService.changeStatus(client2, "INACTIVE");
        memberService.changeStatus(freelancer2, "INACTIVE");
    }

    @Transactional
    public void addSkillAndInterest() {
        if(skillService.count() > 0) return;

        skillService.create("Java");
        skillService.create("Spring boot");
        skillService.create("React");

        interestService.create("웹 개발");
        interestService.create("모바일 앱");
        interestService.create("데이터 사이언스");
    }

    @Transactional
    public void addProject() {
        if (projectService.count() > 0) return;

        List<Long> skillIds1 = List.of(1L, 2L);
        List<Long> interestIds1 = List.of(1L, 2L);

        List<Long> skillIds2 = List.of(2L, 3L);
        List<Long> interestIds2 = List.of(2L, 3L);

        List<Long> skillIds3 = List.of(1L, 2L, 3L);
        List<Long> interestIds3 = List.of(1L, 2L, 3L);

        Member client1 = memberService.findByUsername("client1").get();
        Member client2 = memberService.findByUsername("client2").get();

        projectService.create(
                client2,
                "테스트 프로젝트 1",
                "테스트 요약 1",
                BigDecimal.valueOf(1_000_000),
                "우대 조건 1",
                "급여 조건 1",
                "업무 조건 1",
                "1개월",
                "상세 설명 1",
                LocalDateTime.now().plusMonths(1),
                skillIds1,
                interestIds1
        );

        projectService.create(
                client1,
                "테스트 프로젝트 2",
                "테스트 요약 2",
                BigDecimal.valueOf(2_000_000),
                "우대 조건 2",
                "급여 조건 2",
                "업무 조건 2",
                "2개월",
                "상세 설명 2",
                LocalDateTime.now().plusMonths(2),
                skillIds2,
                interestIds2
        );

        projectService.create(
                client1,
                "테스트 프로젝트 3",
                "테스트 요약 3",
                BigDecimal.valueOf(3_000_000),
                "우대 조건 3",
                "급여 조건 3",
                "업무 조건 3",
                "3개월",
                "상세 설명 3",
                LocalDateTime.now().plusMonths(3),
                skillIds3,
                interestIds3
        );
    }
}

