package com.back.global.initdata;

import com.back.domain.application.application.dto.ApplicationWriteReqBody;
import com.back.domain.application.application.entity.Application;
import com.back.domain.application.application.service.ApplicationService;
import com.back.domain.client.client.entity.Client;
import com.back.domain.client.client.service.ClientService;
import com.back.domain.common.interest.service.InterestService;
import com.back.domain.common.skill.entity.Skill;
import com.back.domain.common.skill.service.SkillService;
import com.back.domain.evaluation.dto.EvaluationCreateReq;
import com.back.domain.evaluation.dto.EvaluationCreateReq.Ratings;
import com.back.domain.evaluation.service.EvaluationService;
import com.back.domain.freelancer.freelancer.entity.Freelancer;
import com.back.domain.freelancer.freelancer.service.FreelancerService;
import com.back.domain.member.member.entity.Member;
import com.back.domain.member.member.service.MemberService;
import com.back.domain.project.project.entity.Project;
import com.back.domain.project.project.service.ProjectService;
import com.back.domain.proposal.proposal.service.ProposalService;
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
import java.util.Map;

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
    private final ApplicationService applicationService;
    private final FreelancerService freelancerService;
    private final ProposalService proposalService;
    private final EvaluationService evaluationService;

    @Bean
    ApplicationRunner baseInitDataApplicationRunner() {
        return args -> {
            self.addMember();
            self.addSkillAndInterest();
            self.addProject();
            self.addApplication();
            self.updateFreelancerInfo();
            self.addProposal();
        };
    }


    @Transactional
    public void addMember() {
        if (memberService.count() > 0) {
            return;
        }
        memberService.setInitFlag(true);

        //임의 데이터 추가
        Member admin = memberService.join("ADMIN", "관리자", "admin", "1234", "1234", "test@test.com");
        Member client1 = memberService.join("CLIENT", "클라이언트1", "client1", "1234", "1234", "test@test.com");
        Member client2 = memberService.join("CLIENT", "클라이언트2", "client2", "1234", "1234", "test@test.com");
        Member freelancer1 = memberService.join("FREELANCER", "프리랜서1", "freelancer1", "1234", "1234", "test@test.com");
        Member freelancer2 = memberService.join("FREELANCER", "프리랜서2", "freelancer2", "1234", "1234", "test@test.com");
        Member freelancer3 = memberService.join("FREELANCER", "프리랜서3", "freelancer3", "1234", "1234", "test@test.com");
        Member freelancer4 = memberService.join("FREELANCER", "프리랜서4", "freelancer4", "1234", "1234", "test@test.com");
        Member freelancer5 = memberService.join("FREELANCER", "프리랜서5", "freelancer5", "1234", "1234", "test@test.com");
        Member client3 = memberService.join("CLIENT", "클라이언트3", "client3", "1234", "1234", "test@test.com");

        for (int i = 6; i <= 50; i++) {
            memberService.join("FREELANCER", "프리랜서" + i, "freelancer" + i, "1234", "1234", "test@test.com");
        }

        //클라이언트2, 프리랜서2는 활동 정지 상태로 변경
        memberService.changeStatus(client2, "INACTIVE");
        memberService.changeStatus(freelancer2, "INACTIVE");

        memberService.setInitFlag(false);
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

        // skill, interest id 목록
        List<Long> allSkillIds = List.of(1L, 2L, 3L);
        List<Long> allInterestIds = List.of(1L, 2L, 3L);

        Member clientMember1 = memberService.findByUsername("client1").get();
        Client client1 = clientService.findById(clientMember1.getId());
        Member clientMember3 = memberService.findByUsername("client3").get();
        Client client3 = clientService.findById(clientMember3.getId());

        // 테스트에서 검증하는 1~3번 프로젝트는 조합을 명확히 지정
        projectService.create(
                client1,
                "테스트 프로젝트 1",
                "테스트 요약 1",
                BigDecimal.valueOf(1_000_000L),
                "우대 조건 1",
                "급여 조건 1",
                "업무 조건 1",
                "1개월",
                "상세 설명 1",
                LocalDateTime.now().plusMonths(1),
                List.of(1L, 2L, 3L), // skill
                List.of(1L, 2L, 3L)  // interest
        );
        projectService.create(
                client3,
                "테스트 프로젝트 2",
                "테스트 요약 2",
                BigDecimal.valueOf(2_000_000L),
                "우대 조건 2",
                "급여 조건 2",
                "업무 조건 2",
                "2개월",
                "상세 설명 2",
                LocalDateTime.now().plusMonths(2),
                List.of(2L, 3L),     // skill
                List.of(2L, 3L)      // interest
        );
        projectService.create(
                client1,
                "테스트 프로젝트 3",
                "테스트 요약 3",
                BigDecimal.valueOf(3_000_000L),
                "우대 조건 3",
                "급여 조건 3",
                "업무 조건 3",
                "3개월",
                "상세 설명 3",
                LocalDateTime.now().plusMonths(3),
                List.of(2L, 3L),     // skill
                List.of(3L)          // interest
        );

        // 4~25번은 기존 방식대로 다양하게 생성
        for (int i = 4; i <= 25; i++) {
            Client client = (i % 2 == 1) ? client1 : client3;
            List<Long> skillIds = allSkillIds.subList(0, (i % 3) + 1); // 1~3개
            List<Long> interestIds = allInterestIds.subList(0, ((i + 1) % 3) + 1); // 1~3개

            projectService.create(
                    client,
                    "테스트 프로젝트 " + i,
                    "테스트 요약 " + i,
                    BigDecimal.valueOf(1_000_000L * i),
                    "우대 조건 " + i,
                    "급여 조건 " + i,
                    "업무 조건 " + i,
                    i + "개월",
                    "상세 설명 " + i,
                    LocalDateTime.now().plusMonths(i),
                    skillIds,
                    interestIds
            );
        }
    }

    @Transactional
    public void addApplication() {
        if (applicationService.count() > 0) {
            return;
        }

        // 프리랜서 회원 조회
        Member freelancerMember1 = memberService.findByUsername("freelancer1").get();
        Freelancer freelancer1 = freelancerService.findById(freelancerMember1.getId());
        Member freelancerMember2 = memberService.findByUsername("freelancer2").get();
        Freelancer freelancer2 = freelancerService.findById(freelancerMember2.getId());

        // 프로젝트 조회
        Project project1 = projectService.findById(1);
        Project project2 = projectService.findById(2);
        Project project3 = projectService.findById(3);

        // 지원서 3개 생성
        Application application1 = applicationService.create(
                new ApplicationWriteReqBody(
                        BigDecimal.valueOf(1_000_000),
                        "1개월",
                        "주 5일, 원격 근무",
                        "추가 자료 없음"
                ),
                freelancer1,
                project1
        );

        Application application2 = applicationService.create(
                new ApplicationWriteReqBody(
                        BigDecimal.valueOf(2_000_000),
                        "2개월",
                        "주 3일, 출근 근무",
                        "디자인 자료 필요"
                ),
                freelancer1,
                project2
        );

        Application application3 = applicationService.create(
                new ApplicationWriteReqBody(
                        BigDecimal.valueOf(2_500_000),
                        "3개월",
                        "주 4일, 혼합 근무",
                        "기술 자료 요청"
                ),
                freelancer1,
                project3
        );
    }

    @Transactional
    public void addProposal() {
        if (proposalService.count() > 0) {
            return;
        }

        Project project = projectService.findById(1L);
        Member member = project.getClient().getMember();
        proposalService.createProposal(member, 1L, 4L, "프로젝트 제안 메시지 1");
        proposalService.createProposal(member, 1L, 6L, "프로젝트 제안 메시지 2");
    }

    @Transactional
    public void updateFreelancerInfo() {
        Long freelancerId1 = memberService.findByUsername("freelancer1").get().getFreelancer().getId();
        Long freelancerId2 = memberService.findByUsername("freelancer2").get().getFreelancer().getId();
        Long freelancerId3 = memberService.findByUsername("freelancer3").get().getFreelancer().getId();
        Long freelancerId4 = memberService.findByUsername("freelancer4").get().getFreelancer().getId();
        Long freelancerId5 = memberService.findByUsername("freelancer5").get().getFreelancer().getId();

        freelancerService.updateFreelancer(freelancerId1, "백엔드", "test@test.com", "안녕하세요",
                Map.of("Spring", 24, "JPA", 30), List.of(1L, 2L));

        freelancerService.updateFreelancer(freelancerId2, "백엔드", "test@test.com", "안녕하세요",
                Map.of("Python", 10), List.of(1L, 2L));

        freelancerService.updateFreelancer(freelancerId3, "풀스택", "test@test.com", "안녕하세요",
                Map.of("스프링", 24, "리액트", 48), List.of(1L, 2L, 3L));

        freelancerService.updateFreelancer(freelancerId4, "프론트엔드", "test@test.com", "안녕하세요",
                Map.of("React", 100, "Next.js", 30), List.of(3L));

        freelancerService.updateFreelancer(freelancerId5, "프론트엔드", "test@test.com", "안녕하세요",
                null, List.of());

        List<String> jobs = List.of("백엔드", "프론트엔드", "풀스택", "백엔드", "모바일");
        List<String> comments = List.of("안녕하세요", "잘 부탁드립니다", "열심히 하겠습니다");
        List<List<Long>> skills = List.of(
                List.of(1L), List.of(2L), List.of(3L),
                List.of(1L, 2L), List.of(1L, 3L), List.of(2L, 3L),
                List.of(1L, 2L, 3L)
        );
        List<Integer> careerMonths = List.of(5, 12, 18, 24, 30, 36, 42, 48, 54);
        List<String> evaluationComments = List.of("좋은 프리랜서입니다.", "다음에 또 함께 일하고 싶습니다.", "프로젝트를 성공적으로 완료했습니다.");
        List<Long> projectIds = List.of(1L, 2L, 3L, 4L, 5L, 6L, 7L);
        List<Integer> ratingsList = List.of(5, 4, 3, 2, 1, 1, 2, 2, 3, 4, 4, 5, 2, 3, 1, 4, 5);
        List<Long> evaluatorIds = List.of(2L, 3L);

        for (int i = 6; i <= 50; i++) {
            Long freelancerId = memberService.findByUsername("freelancer" + i).get().getFreelancer().getId();
            freelancerService.updateFreelancer(
                    freelancerId,
                    jobs.get(i % jobs.size()),
                    "test" + i + "@test.com",
                    comments.get(i % comments.size()),
                    Map.of("Java", careerMonths.get(i % careerMonths.size()), "Spring",
                            careerMonths.get(i % careerMonths.size())),
                    skills.get(i % skills.size()));

            // 프리랜서 평가 데이터 추가
            evaluationService.createEvaluation(
                    evaluatorIds.get(i % evaluatorIds.size()),
                    new EvaluationCreateReq(
                            projectIds.get(i % projectIds.size()),
                            freelancerId,
                            new Ratings(
                                    ratingsList.get(i % ratingsList.size()),
                                    ratingsList.get((i + 1) % ratingsList.size()),
                                    ratingsList.get((i + 2) % ratingsList.size()),
                                    ratingsList.get((i + 3) % ratingsList.size())
                            ),
                    evaluationComments.get(i % evaluationComments.size()))
            );
        }
    }
}

