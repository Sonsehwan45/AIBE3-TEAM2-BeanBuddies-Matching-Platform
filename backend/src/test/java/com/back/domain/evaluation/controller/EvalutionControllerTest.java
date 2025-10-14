package com.back.domain.evaluation.controller;

import com.back.domain.client.client.entity.Client;
import com.back.domain.client.client.repository.ClientRepository;
import com.back.domain.evaluation.dto.EvaluationCreateReq;
import com.back.domain.evaluation.entity.FreelancerEvaluation;
import com.back.domain.evaluation.repository.FreelancerEvaluationRepository;
import com.back.domain.freelancer.freelancer.entity.Freelancer;
import com.back.domain.freelancer.freelancer.repository.FreelancerRepository;
import com.back.domain.member.member.constant.Role;
import com.back.domain.member.member.entity.Member;
import com.back.domain.member.member.repository.MemberRepository;
import com.back.domain.project.project.constant.ProjectStatus;
import com.back.domain.project.project.entity.Project;
import com.back.domain.project.project.repository.ProjectRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithUserDetails;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class EvaluationControllerTest {

    @Autowired
    private MockMvc mockMvc;
    @Autowired
    private ObjectMapper objectMapper;
    @Autowired
    private MemberRepository memberRepository;
    @Autowired
    private ClientRepository clientRepository;
    @Autowired
    private FreelancerRepository freelancerRepository;
    @Autowired
    private ProjectRepository projectRepository;
    @Autowired
    private FreelancerEvaluationRepository freelancerEvaluationRepository;
    @Autowired
    private EntityManager em;

    private Member clientMember;
    private Member freelancerMember;
    private Project project;

    @BeforeEach
    void setUp() {

        clientMember = new Member("CLIENT", "password1234", "김클라", "01012345678", "client@test.com");
        memberRepository.save(clientMember);
        Client savedClient = clientRepository.save(new Client(clientMember));

        freelancerMember = new Member("FREELANCER", "password1234", "박프리", "01087654321", "freelancer@test.com");
        memberRepository.save(freelancerMember);
        freelancerRepository.save(new Freelancer(freelancerMember));

        project = new Project(
                savedClient,
                "테스트 프로젝트",
                "요약입니다.",
                new BigDecimal("1000000"),
                "우대 조건입니다.",
                "급여 조건입니다.",
                "업무 조건입니다.",
                "1개월",
                "상세 설명입니다.",
                LocalDateTime.now().plusMonths(1)
        );
        projectRepository.save(project);

        em.flush();
        em.clear();
    }

    @Test
    @DisplayName("평가 생성 API를 호출하면 DB에 평가가 저장되고 201 Created를 응답한다")
    @WithUserDetails(value = "client@test.com", userDetailsServiceBeanName = "customUserDetailsService")
    void v1() throws Exception {
        EvaluationCreateReq.Ratings ratings = new EvaluationCreateReq.Ratings(5, 5, 4, 4); // 평균 4.5 -> 반올림 5
        EvaluationCreateReq requestDto = new EvaluationCreateReq(project.getId(), freelancerMember.getId(), ratings, "상세한 검증 테스트 코멘트");

        ResultActions actions = mockMvc.perform(
                post("/api/v1/evaluations")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDto))
                        .with(csrf())
        );

        actions
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.statusCode").value("201"))
                .andExpect(jsonPath("$.message").value("평가가 성공적으로 등록되었습니다."));

        List<FreelancerEvaluation> evaluations = freelancerEvaluationRepository.findAll();
        assertThat(evaluations).hasSize(1);

        FreelancerEvaluation savedEvaluation = evaluations.get(0);
        assertThat(savedEvaluation.getProject().getId()).isEqualTo(project.getId());
        assertThat(savedEvaluation.getClient().getId()).isEqualTo(clientMember.getId());
        assertThat(savedEvaluation.getFreelancer().getId()).isEqualTo(freelancerMember.getId());
        assertThat(savedEvaluation.getComment()).isEqualTo("상세한 검증 테스트 코멘트");
        assertThat(savedEvaluation.getRatingSatisfaction()).isEqualTo(5); // 4.5에서 반올림된 5가 맞는지 확인
        assertThat(savedEvaluation.getRatingProfessionalism()).isEqualTo(5);
        assertThat(savedEvaluation.getRatingScheduleAdherence()).isEqualTo(5);
        assertThat(savedEvaluation.getRatingCommunication()).isEqualTo(4);
        assertThat(savedEvaluation.getRatingProactiveness()).isEqualTo(4);
    }
}