package com.back.global.initdata;

import com.back.domain.application.application.dto.ApplicationWriteReqBody;
import com.back.domain.application.application.service.ApplicationService;
import com.back.domain.client.client.entity.Client;
import com.back.domain.client.client.service.ClientService;
import com.back.domain.common.interest.service.InterestService;
import com.back.domain.common.skill.service.SkillService;
import com.back.domain.evaluation.dto.EvaluationCreateReq;
import com.back.domain.evaluation.service.EvaluationService;
import com.back.domain.freelancer.freelancer.entity.Freelancer;
import com.back.domain.freelancer.freelancer.service.FreelancerService;
import com.back.domain.member.member.entity.Member;
import com.back.domain.member.member.service.MemberService;
import com.back.domain.project.project.entity.Project;
import com.back.domain.project.project.service.ProjectService;
import com.back.domain.proposal.proposal.service.ProposalService;
import com.back.domain.recommendations.recommendations.service.SearchIndexService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.context.annotation.Profile;
import org.springframework.core.annotation.Order;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
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
    private final SearchIndexService searchIndexService;

    @Bean
    @Order(1)
    ApplicationRunner baseInitDataApplicationRunner() {
        return args -> {
            self.addMember();
            self.addSkillAndInterest();
            self.addProject();
            //self.addApplication();
            self.updateFreelancerInfo();
            self.updateClientInfo();
            //self.addProposal();
            self.synchronization();
        };
    }

    @Bean
    @Profile("dev")
    @Order(2)
    ApplicationRunner devBaseInitDataApplicationRunner() {
        return args -> {
            self.addDevMember();            // 여유 인원 추가(31~50) - 안전
            self.updateDevFreelancerInfo(); // 남은 인원 보강 - 안전
        };
    }

    // ========================= Members =========================
    @Transactional
    public void addMember() {
        // 충분히 있으면 스킵(이미 운영 DB에 실제 데이터가 있을 수 있음)
        if (memberService.count() >= 40) return;

        memberService.setInitFlag(true);

        // Admin
        if (memberService.findByUsername("admin").isEmpty()) {
            memberService.join(null, "ADMIN", "관리자", "admin", "1234", "1234", "admin@example.com");
        }

        // Clients (4)
        String[][] clients = {
                {"CLIENT","에이스테크","client1","client1@example.com"},
                {"CLIENT","브라이트소프트","client2","client2@example.com"},
                {"CLIENT","코어시스템즈","client3","client3@example.com"},
                {"CLIENT","디지털웍스","client4","client4@example.com"}
        };
        for (String[] c : clients) {
            if (memberService.findByUsername(c[2]).isEmpty()) {
                memberService.join(null, c[0], c[1], c[2], "1234", "1234", c[3]);
            }
        }
        // client2 비활성
        memberService.findByUsername("client2").ifPresent(m -> memberService.changeStatus(m, "INACTIVE"));

        // Freelancers (01~30)
        for (int i = 1; i <= 30; i++) {
            String uname = String.format("freelancer%d", i);
            if (memberService.findByUsername(uname).isEmpty()) {
                memberService.join(null, "FREELANCER",
                        "프리랜서" + String.format("%d", i),
                        uname, "1234", "1234", uname + "@example.com");
            }
        }
        // freelancer02 비활성
        memberService.findByUsername("freelancer2").ifPresent(m -> memberService.changeStatus(m, "INACTIVE"));

        memberService.setInitFlag(false);
    }

    // dev에서 여유 인원 보강(31~50) — 안전
    @Transactional
    public void addDevMember() {
        if (memberService.count() >= 60) return;
        memberService.setInitFlag(true);
        for (int i = 31; i <= 50; i++) {
            String uname = String.format("freelancer%d", i);
            if (memberService.findByUsername(uname).isEmpty()) {
                memberService.join(null, "FREELANCER",
                        "프리랜서" + String.format("%d", i),
                        uname, "1234", "1234", uname + "@example.com");
            }
        }
        memberService.setInitFlag(false);
    }

    // ===================== Skills & Interests =====================
    @Transactional
    public void addSkillAndInterest() {
        if (skillService.count() > 0) return;

        // Skills
        List<String> skills = List.of(
                "Java","Spring Boot","JPA","React","Next.js","TypeScript","Node.js","AWS",
                "Docker","Kubernetes","Python","MySQL"
        );
        skills.forEach(skillService::create);

        // Interests
        List<String> interests = List.of(
                "웹 개발","모바일 앱","데이터 엔지니어링","클라우드/인프라"
        );
        interests.forEach(interestService::create);
    }

    // ========================= Projects =========================
    @Transactional
    public void addProject() {
        if (projectService.count() >= 20) return;

        // 사용 가능한 클라이언트 모으기
        List<String> clientUsernames = List.of("client1","client2","client3","client4");
        List<Client> clients = new ArrayList<>();
        for (String cu : clientUsernames) {
            memberService.findByUsername(cu).ifPresent(m -> {
                try { clients.add(clientService.findById(m.getId())); } catch (Exception ignore) {}
            });
        }
        if (clients.isEmpty()) return;

        // 대표 3개
        createProjectSafe(
                clients.get(0),
                "사내 업무 시스템 백엔드 리뉴얼",
                "레거시 Spring MVC → Spring Boot로 마이그레이션 및 모듈화",
                BigDecimal.valueOf(15_000_000),
                "JPA/대규모 트래픽 경험자 우대, 코드 리뷰 경험",
                "월 700만원 (협의)",
                "주 5일, 원격/출퇴근 혼합",
                "6개월",
                "ERP/주문/정산 백엔드 구조를 Spring Boot/JPA 기반으로 재구성하고 성능·테스트 커버리지 강화",
                LocalDateTime.now().plusMonths(2),
                List.of(1L,2L,3L,12L,9L),
                List.of(1L)
        );
        createProjectSafe(
                clients.get(Math.min(1, clients.size()-1)),
                "리액트 기반 관리자 포털 구축",
                "디자인 시스템/컴포넌트 정비 + 접근성 개선",
                BigDecimal.valueOf(9_000_000),
                "Next.js 경험, TypeScript 숙련, 접근성 고려",
                "월 600만원 (협의)",
                "주 5일, 원격",
                "4개월",
                "운영/CS용 관리자 포털(권한/대시보드/리스트/상세/차트)을 React/Next.js로 신규 구축",
                LocalDateTime.now().plusMonths(1),
                List.of(4L,5L,6L),
                List.of(1L)
        );
        createProjectSafe(
                clients.get(0),
                "데이터 파이프라인 고도화",
                "S3 → ETL → DW 적재 파이프라인 안정화",
                BigDecimal.valueOf(20_000_000),
                "Python/AWS 경험, Airflow 우대",
                "월 800만원 (협의)",
                "주 5일, 원격",
                "5개월",
                "ETL 설계/개선과 모니터링·알림 시스템 정비, 비용/성능 최적화",
                LocalDateTime.now().plusMonths(3),
                List.of(11L,8L,9L),
                List.of(3L,4L)
        );

        // 추가 17개(총 20개 근접)
        String[] titles = {
                "고객센터 챗봇 고도화","사내 SSO 통합","실시간 알림 서버 구축","데이터 시각화 대시보드",
                "모바일 하이브리드 앱 PoC","서버리스 로그 파이프라인","CI/CD 파이프라인 표준화","대용량 배치 성능 개선",
                "클라우드 비용 최적화","권한/감사 로깅 체계화","API 게이트웨이 통합","멀티테넌트 SaaS 콘솔",
                "이벤트소싱 기반 주문시스템","문서검색(벡터DB) 실험","데이터 카탈로그 정비","서비스 헬스체크 대시보드",
                "모놀리식 → 마이크로서비스 전환"
        };
        List<List<Long>> skillSets = List.of(
                List.of(7L,11L),                // Node.js, Python
                List.of(1L,2L,6L),              // Java, Spring Boot, TS
                List.of(7L,8L,9L),              // Node.js, AWS, Docker
                List.of(4L,6L,12L),             // React, TS, MySQL
                List.of(5L,6L,7L),              // Next.js, TS, Node.js
                List.of(11L,8L),                // Python, AWS
                List.of(1L,2L,9L),              // Java, Spring Boot, Docker
                List.of(1L,3L,12L),             // Java, JPA, MySQL
                List.of(8L,9L,10L),             // AWS, Docker, K8s
                List.of(1L,2L,6L),              // Java, Spring Boot, TS
                List.of(7L,8L),                 // Node.js, AWS
                List.of(4L,5L,6L),              // React, Next.js, TS
                List.of(1L,2L,7L),              // Java, Spring Boot, Node.js
                List.of(11L,8L),                // Python, AWS
                List.of(12L,8L,9L),             // MySQL, AWS, Docker
                List.of(4L,6L),                 // React, TS
                List.of(1L,2L,10L)              // Java, Spring Boot, K8s
        );
        List<List<Long>> interestSets = List.of(
                List.of(1L), List.of(1L), List.of(4L), List.of(1L),
                List.of(2L), List.of(4L), List.of(4L), List.of(3L),
                List.of(4L), List.of(1L), List.of(4L), List.of(1L),
                List.of(1L), List.of(3L), List.of(3L), List.of(1L),
                List.of(1L)
        );

        for (int i = 0; i < titles.length; i++) {
            Client c = clients.get(i % clients.size());
            createProjectSafe(
                    c,
                    titles[i],
                    "프로젝트 요약: " + titles[i],
                    BigDecimal.valueOf(6_000_000L + (i * 500_000L)),
                    "우대 조건: 관련 실무 경험 보유",
                    "급여 조건 협의",
                    "근무 조건 협의",
                    (3 + (i % 6)) + "개월",
                    "상세 설명: " + titles[i] + " 수행",
                    LocalDateTime.now().plusMonths(1 + (i % 6)),
                    skillSets.get(i % skillSets.size()),
                    interestSets.get(i % interestSets.size())
            );
        }
    }

    private void createProjectSafe(
            Client client, String title, String summary, BigDecimal price,
            String preferred, String pay, String working, String duration,
            String description, LocalDateTime deadline,
            List<Long> skills, List<Long> interests
    ) {
        try {
            projectService.create(client, title, summary, price, preferred, pay, working,
                    duration, description, deadline, skills, interests);
        } catch (Exception ignore) {}
    }

    // ========================= Applications (safe) =========================
    @Transactional
    public void addApplication() {
        if (applicationService.count() > 0) return;

        // 프리랜서 3명 확보
        List<Freelancer> fl = new ArrayList<>();
        for (int i = 1; i <= 40; i++) {
            String uname = String.format("freelancer%d", i);
            memberService.findByUsername(uname).ifPresent(m -> {
                if (m.getFreelancer() != null) {
                    try { fl.add(freelancerService.findById(m.getFreelancer().getId())); } catch (Exception ignore) {}
                }
            });
            if (fl.size() >= 3) break;
        }
        if (fl.isEmpty()) return;
        Freelancer f1 = fl.get(0);
        Freelancer f2 = fl.size() > 1 ? fl.get(1) : f1;
        Freelancer f3 = fl.size() > 2 ? fl.get(2) : f1;

        // 프로젝트 6개 확보
        List<Project> projects = new ArrayList<>();
        for (long pid = 1; pid <= 500; pid++) {
            try {
                projects.add(projectService.findById(pid));
            } catch (Exception ignore) {}
            if (projects.size() >= 6) break;
        }
        if (projects.isEmpty()) return;

        Project p1 = projects.get(0);
        Project p2 = projects.size() > 1 ? projects.get(1) : p1;
        Project p3 = projects.size() > 2 ? projects.get(2) : p1;

        // 샘플 지원서
        safeApply(f1, p1, new ApplicationWriteReqBody(
                BigDecimal.valueOf(1_800_000), "2개월", "주 5일, 원격", "추가 자료 없음"));
        safeApply(f1, p2, new ApplicationWriteReqBody(
                BigDecimal.valueOf(2_200_000), "3개월", "주 3일, 출근", "디자인 자료 검토 필요"));
        safeApply(f2, p3, new ApplicationWriteReqBody(
                BigDecimal.valueOf(2_700_000), "4개월", "주 4일, 혼합", "기술 문서 요청"));

        // f3가 마지막 프로젝트에 여러 건
        Project last = projects.get(projects.size()-1);
        for (int i = 1; i <= 10; i++) {
            safeApply(f3, last, new ApplicationWriteReqBody(
                    BigDecimal.valueOf(900_000L + (i * 100_000L)),
                    (i % 6 + 1) + "개월",
                    (i % 2 == 0) ? "주 5일, 원격" : "주 3일, 출근",
                    "추가 자료 없음"
            ));
        }
    }
    private void safeApply(Freelancer f, Project p, ApplicationWriteReqBody body) {
        try { applicationService.create(body, f, p); } catch (Exception ignore) {}
    }

    // ========================= Proposals (safe) =========================
    @Transactional
    public void addProposal() {
        if (proposalService.count() > 0) return;

        // 가장 앞의 프로젝트 1개
        Project project = null;
        for (long pid = 1; pid <= 500; pid++) {
            try { project = projectService.findById(pid); break; } catch (Exception ignore) {}
        }
        if (project == null) return;
        Member clientMember = project.getClient().getMember();

        // 프리랜서 2명 타겟팅
        List<Long> targets = new ArrayList<>();
        for (int i = 1; i <= 40; i++) {
            String uname = String.format("freelancer%d", i);
            var opt = memberService.findByUsername(uname);
            if (opt.isPresent() && opt.get().getFreelancer() != null) {
                targets.add(opt.get().getFreelancer().getId());
            }
            if (targets.size() >= 2) break;
        }
        if (targets.isEmpty()) return;

        try { proposalService.createProposal(clientMember, project.getId(), targets.get(0), "프로젝트 제안 메시지 1"); } catch (Exception ignore) {}
        if (targets.size() >= 2) {
            try { proposalService.createProposal(clientMember, project.getId(), targets.get(1), "프로젝트 제안 메시지 2"); } catch (Exception ignore) {}
        }
    }

    // ========================= Freelancer Profiles =========================
    @Transactional
    public void updateFreelancerInfo() {
        // 이미 채워졌으면 스킵
        var f01 = memberService.findByUsername("freelancer1").map(Member::getFreelancer);
        if (f01.isPresent() && f01.get().getJob() != null) return;

        // 앞쪽 10명 정도 상세 세팅
        updateF("freelancer1","백엔드",
                "Spring Boot/JPA 중심 백엔드 개발자",
                Map.of("Java", 60, "Spring Boot", 48, "JPA", 36, "MySQL", 30),
                List.of(1L,2L,3L));

        updateF("freelancer2","백엔드",
                "데이터 파이프라인/ETL 경험",
                Map.of("Python", 24, "AWS", 18, "Docker", 12),
                List.of(11L,8L));

        updateF("freelancer3","풀스택",
                "프론트/백/클라우드 전반 대응",
                Map.of("Java", 36, "Spring Boot", 30, "React", 36, "AWS", 24),
                List.of(1L,4L,8L));

        updateF("freelancer4","프론트엔드",
                "React/Next.js, DX 개선/접근성",
                Map.of("React", 48, "Next.js", 24, "TypeScript", 36),
                List.of(4L,5L,6L));

        updateF("freelancer5","프론트엔드",
                "주니어 프론트엔드, 학습 중",
                Map.of("React", 12),
                List.of(4L));

        updateF("freelancer6","백엔드",
                "마이크로서비스 전환 경험",
                Map.of("Java", 48, "Spring Boot", 36, "Docker", 24),
                List.of(1L,2L,9L));

        updateF("freelancer7","데이터 엔지니어",
                "ETL/데이터모델링/모니터링",
                Map.of("Python", 36, "AWS", 24, "MySQL", 30),
                List.of(11L,8L,12L));

        updateF("freelancer8","클라우드/플랫폼",
                "쿠버네티스/자동화/관찰성",
                Map.of("AWS", 36, "Docker", 30, "Kubernetes", 24),
                List.of(8L,9L,10L));

        updateF("freelancer9","프론트엔드",
                "디자인 시스템/컴포넌트 라이브러리",
                Map.of("React", 60, "TypeScript", 48, "Next.js", 36),
                List.of(4L,5L,6L));

        updateF("freelancer10","풀스택",
                "Node.js + React 기반 BFF",
                Map.of("Node.js", 36, "React", 36, "TypeScript", 36),
                List.of(7L,4L,6L));
        updateF("freelancer11","백엔드",
                "모놀리스를 MSA로 분해한 경험, 배포 자동화",
                Map.of("Java", 48, "Spring Boot", 42, "JPA", 30, "Docker", 18),
                List.of(1L,2L,3L,9L));

        updateF("freelancer12","프론트엔드",
                "React/Next.js로 대시보드/포털 구축",
                Map.of("React", 42, "Next.js", 30, "TypeScript", 36),
                List.of(4L,5L,6L));

        updateF("freelancer13","데이터 엔지니어",
                "ETL/데이터 모델링, 배치/스트리밍 파이프라인",
                Map.of("Python", 36, "AWS", 24, "MySQL", 30),
                List.of(11L,8L,12L));

        updateF("freelancer14","풀스택",
                "자바 백엔드 + 리액트 프론트, 전반 구현",
                Map.of("Java", 36, "Spring Boot", 24, "React", 30, "TypeScript", 24),
                List.of(1L,2L,4L,6L));

        updateF("freelancer15","클라우드/플랫폼",
                "인프라 코드/관찰성/오토스케일링",
                Map.of("AWS", 36, "Docker", 30, "Kubernetes", 24),
                List.of(8L,9L,10L));

        updateF("freelancer16","백엔드",
                "DB 튜닝/쿼리 최적화, JPA 고급 매핑",
                Map.of("Java", 30, "Spring Boot", 30, "JPA", 36, "MySQL", 36),
                List.of(1L,2L,3L,12L));

        updateF("freelancer17","프론트엔드",
                "SSR/SEO 최적화, 접근성 개선",
                Map.of("Next.js", 36, "React", 36, "TypeScript", 30),
                List.of(5L,4L,6L));

        updateF("freelancer18","백엔드",
                "Node 기반 API/BFF, 서버리스 일부 경험",
                Map.of("Node.js", 36, "TypeScript", 30, "AWS", 18),
                List.of(7L,6L,8L));

        updateF("freelancer19","데이터 엔지니어",
                "로그 수집/정규화, 품질 모니터링",
                Map.of("Python", 30, "AWS", 24, "Docker", 18),
                List.of(11L,8L,9L));

        updateF("freelancer20","풀스택",
                "React + Node로 MVP 빠른 구축",
                Map.of("React", 30, "Node.js", 30, "Docker", 18),
                List.of(4L,7L,9L));

        updateF("freelancer21","프론트엔드",
                "대형 SPA 유지보수/리팩터링",
                Map.of("React", 48, "TypeScript", 36, "Next.js", 24),
                List.of(4L,6L,5L));

        updateF("freelancer22","백엔드",
                "보안/권한/감사로그 중심의 엔터프라이즈 백엔드",
                Map.of("Java", 42, "Spring Boot", 36, "JPA", 24),
                List.of(1L,2L,3L));

        updateF("freelancer23","백엔드",
                "레거시 마이그레이션, 트랜잭션/락 이슈 해결",
                Map.of("Java", 36, "Spring Boot", 36, "MySQL", 36),
                List.of(1L,2L,12L));

        updateF("freelancer24","프론트엔드",
                "디자인 시스템 구축/컴포넌트 아키텍처",
                Map.of("React", 48, "TypeScript", 42, "Next.js", 30),
                List.of(4L,6L,5L));

        updateF("freelancer25","데이터 엔지니어",
                "DW 적재/모델링, 배치 스케줄링",
                Map.of("Python", 36, "MySQL", 36, "AWS", 24),
                List.of(11L,12L,8L));

        updateF("freelancer26","클라우드/플랫폼",
                "EKS 운영/배포 파이프라인/모니터링",
                Map.of("Kubernetes", 36, "Docker", 36, "AWS", 30),
                List.of(10L,9L,8L));

        updateF("freelancer27","백엔드",
                "API 표준화/문서화, 테스트 자동화",
                Map.of("Spring Boot", 36, "Java", 36, "MySQL", 24),
                List.of(2L,1L,12L));

        updateF("freelancer28","풀스택",
                "Next.js + Node.js 기반 전반 개발",
                Map.of("Next.js", 36, "Node.js", 36, "TypeScript", 30),
                List.of(5L,7L,6L));

        updateF("freelancer29","프론트엔드",
                "성능 최적화/코드 스플리팅/번들링",
                Map.of("React", 42, "TypeScript", 36, "Next.js", 24),
                List.of(4L,6L,5L));

        updateF("freelancer30","백엔드",
                "대용량 트래픽/캐싱/스케일링",
                Map.of("Java", 48, "Spring Boot", 42, "JPA", 30, "AWS", 24),
                List.of(1L,2L,3L,8L));
    }

    private void updateF(String uname, String job, String comment, Map<String,Integer> careers, List<Long> skills) {
        memberService.findByUsername(uname).ifPresent(m -> {
            if (m.getFreelancer() != null) {
                try {
                    freelancerService.updateFreelancer(
                            m.getFreelancer().getId(),
                            job,
                            uname + "@example.com",
                            comment,
                            careers,
                            skills
                    );
                } catch (Exception ignore) {}
            }
        });
    }

    // ========================= Client Info =========================
    @Transactional
    public void updateClientInfo() {
        memberService.findByUsername("client1").ifPresent(m -> {
            if (m.getClient() != null) {
                try {
                    clientService.updateClient(
                            m.getClient().getId(),
                            "STARTUP",
                            "이커머스/플랫폼 스타트업",
                            "홍길동",
                            "123-45-67890",
                            "02-1234-5678",
                            "biz@client1.com"
                    );
                } catch (Exception ignore) {}
            }
        });
    }

    // ========================= Dev Freelancer Info (safe) =========================
    @Transactional
    public void updateDevFreelancerInfo() {
        // 이미 dev 보강이 끝났으면 스킵(예: freelancer31의 job 존재)
        var any = memberService.findByUsername("freelancer31")
                .map(Member::getFreelancer)
                .map(Freelancer::getJob)
                .orElse(null);
        if (any != null) return;

        // 사용할 프로젝트(최대 7) — 평가 생성용
        List<Project> projects = new ArrayList<>();
        for (long pid = 1; pid <= 500; pid++) {
            try { projects.add(projectService.findById(pid)); } catch (Exception ignore) {}
            if (projects.size() >= 7) break;
        }
        if (projects.isEmpty()) return;

        List<String> jobs = List.of("백엔드","프론트엔드","풀스택","데이터","클라우드");
        List<String> comments = List.of("안녕하세요", "잘 부탁드립니다", "열심히 하겠습니다", "빠르게 적응합니다");
        List<List<Long>> skills = List.of(
                List.of(1L), List.of(2L), List.of(3L),
                List.of(4L), List.of(5L), List.of(6L),
                List.of(7L), List.of(8L), List.of(9L),
                List.of(10L), List.of(11L), List.of(12L),
                List.of(1L,2L), List.of(4L,6L), List.of(8L,9L)
        );
        List<Integer> months = List.of(6,12,18,24,30,36,42,48);

        int idx = 0;
        for (int i = 31; i <= 50; i++) {
            String uname = String.format("freelancer%02d", i);
            var opt = memberService.findByUsername(uname);
            if (opt.isEmpty() || opt.get().getFreelancer() == null) continue;

            Long fid = opt.get().getFreelancer().getId();
            try {
                freelancerService.updateFreelancer(
                        fid,
                        jobs.get(i % jobs.size()),
                        uname + "@example.com",
                        comments.get(i % comments.size()),
                        Map.of("Java", months.get(i % months.size()),
                                "Spring", months.get((i+1) % months.size())),
                        skills.get(i % skills.size())
                );
            } catch (Exception ignore) {}

            // 평가 1건 (가능할 때만)
            try {
                Project p = projects.get(idx % projects.size());
                Long evaluatorId = memberService.findByUsername("client1").map(Member::getId).orElse(null);
                if (evaluatorId != null) {
                    evaluationService.createEvaluation(
                            evaluatorId,
                            new EvaluationCreateReq(
                                    p.getId(),
                                    fid,
                                    new EvaluationCreateReq.Ratings(4,4,4,4),
                                    "수행이 원활했습니다."
                            )
                    );
                }
                idx++;
            } catch (Exception ignore) {}
        }
    }

    // ========================= Rebuild Search Index =========================
    public void synchronization() {
        try { searchIndexService.rebuildAll(); } catch (Exception ignore) {}
    }
}

