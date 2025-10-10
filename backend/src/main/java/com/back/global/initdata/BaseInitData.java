package com.back.global.initdata;

import com.back.domain.client.client.entity.Client;
import com.back.domain.client.client.service.ClientService;
import com.back.domain.common.interest.service.InterestService;
import com.back.domain.common.skill.service.SkillService;
import com.back.domain.freelancer.freelancer.entity.Freelancer;
import com.back.domain.freelancer.freelancer.service.FreelancerService;
import com.back.domain.member.member.entity.Member;
import com.back.domain.member.member.service.MemberService;
import com.back.domain.project.project.service.ProjectService;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Configuration
public class BaseInitData {

    @Autowired
    @Lazy
    private BaseInitData self;

    private final MemberService memberService;
    private final ClientService clientService;
    private final ProjectService projectService;
    private final SkillService skillService;
    private final InterestService interestService;
    private final FreelancerService freelancerService;

    @Bean
    ApplicationRunner baseInitDataApplicationRunner() {
        return args -> {
            self.addMember();
            self.addSkillAndInterest();
            self.addProject();
            self.updateFreelancerInfo();
        };
    }


    @Transactional
    public void addMember() {

        if (memberService.count() > 0) {
            return;
        }

        //임의 데이터 추가
        Member admin = memberService.join("ADMIN", "관리자", "admin", "1234", "1234", "test@test.com");
        Member client1 = memberService.join("CLIENT", "클라이언트1", "client1", "1234", "1234", "test@test.com");
        Member client2 = memberService.join("CLIENT", "클라이언트2", "client2", "1234", "1234", "test@test.com");
        Member freelancer1 = memberService.join("FREELANCER", "프리랜서1", "freelancer1", "1234", "1234", "test@test.com");
        Member freelancer2 = memberService.join("FREELANCER", "프리랜서2", "freelancer2", "1234", "1234", "test@test.com");
        Member freelancer3 = memberService.join("FREELANCER", "프리랜서3", "freelancer3", "1234", "1234", "test@test.com");
        Member freelancer4 = memberService.join("FREELANCER", "프리랜서4", "freelancer4", "1234", "1234", "test@test.com");
        Member freelancer5 = memberService.join("FREELANCER", "프리랜서5", "freelancer5", "1234", "1234", "test@test.com");

        //클라이언트2, 프리랜서2는 활동 정지 상태로 변경
        memberService.changeStatus(client2, "INACTIVE");
        memberService.changeStatus(freelancer2, "INACTIVE");
    }

    @Transactional
    public void addSkillAndInterest() {
        if (skillService.count() > 0) {
            return;
        }

        skillService.create("Java");
        skillService.create("Spring boot");
        skillService.create("React");

        interestService.create("웹 개발");
        interestService.create("모바일 앱");
        interestService.create("데이터 사이언스");
    }

    @Transactional
    public void addProject() {
        if (projectService.count() > 0) {
            return;
        }

        List<Long> skillIds1 = List.of(1L, 2L);
        List<Long> interestIds1 = List.of(1L, 2L);

        List<Long> skillIds2 = List.of(2L, 3L);
        List<Long> interestIds2 = List.of(2L, 3L);

        List<Long> skillIds3 = List.of(1L, 2L, 3L);
        List<Long> interestIds3 = List.of(1L, 2L, 3L);

        Member clientMember1 = memberService.findByUsername("client1").get();
        Client client1 = clientService.findById(clientMember1.getId());
        Member clientMember2 = memberService.findByUsername("client2").get();
        Client client2 = clientService.findById(clientMember2.getId());

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

    @Transactional
    public void updateFreelancerInfo() {
        Freelancer freelancer1 = freelancerService.findById(4L);

        freelancerService.updateFreelancer(4L, "백엔드", "test@test.com", "안녕하세요",
                Map.of("Spring", 24, "JPA", 30), List.of(1L, 2L));

        freelancerService.updateFreelancer(5L, "백엔드", "test@test.com", "안녕하세요",
                Map.of("Python", 10), List.of(1L, 2L));

        freelancerService.updateFreelancer(6L, "풀스택", "test@test.com", "안녕하세요",
                Map.of("스프링", 24, "리액트", 48), List.of(1L, 2L, 3L));

        freelancerService.updateFreelancer(7L, "프론트엔드", "test@test.com", "안녕하세요",
                Map.of("React", 100, "Next.js", 30), List.of(3L));

        freelancerService.updateFreelancer(8L, "프론트엔드", "test@test.com", "안녕하세요",
                null, null);
    }
}

