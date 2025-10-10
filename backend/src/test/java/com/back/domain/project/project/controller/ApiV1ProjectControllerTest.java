package com.back.domain.project.project.controller;

import com.back.domain.member.member.service.MemberService;
import com.back.domain.project.project.constant.ProjectStatus;
import com.back.domain.project.project.entity.Project;
import com.back.domain.project.project.entity.ProjectInterest;
import com.back.domain.project.project.entity.ProjectSkill;
import com.back.domain.project.project.service.ProjectService;
import com.back.global.exception.ServiceException;
import org.hamcrest.Matchers;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithUserDetails;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ActiveProfiles("test")
@SpringBootTest
@AutoConfigureMockMvc
@Transactional
class ApiV1ProjectControllerTest {
    @Autowired
    private MockMvc mvc; // MockMvc를 주입받습니다.
    @Autowired
    ProjectService projectService;
    @Autowired
    private MemberService memberService;

    @Test
    @DisplayName("프로젝트 생성")
    @WithUserDetails(value = "client1", userDetailsServiceBeanName = "customUserDetailsService")
    void t1() throws  Exception {
        ResultActions resultActions = mvc.perform(
                post("/api/v1/projects")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                {
                    "title": "테스트 프로젝트",
                    "summary": "테스트 요약",
                    "duration": "1개월",
                    "price": 1000000,
                    "preferredCondition": "우대 조건",
                    "payCondition": "급여 조건",
                    "workingCondition": "업무 조건",
                    "description": "상세 설명",
                    "deadline": "2025-12-31T23:59:59",
                    "skills": [1, 2],
                    "interests": [1, 2]
                }
                """)
        ).andDo(print());

        // DB에서 가장 최근 프로젝트 조회
        Project project = projectService.findLatest().orElseThrow(
                () -> new ServiceException("401-1", "프로젝트가 생성되지 않았습니다.")
        );

        // 응답 검증
        resultActions
                .andExpect(status().isCreated())
                .andExpect(handler().handlerType(ApiV1ProjectController.class))
                .andExpect(handler().methodName("write"))
                .andExpect(jsonPath("$.resultCode").value("201-1"))
                .andExpect(jsonPath("$.msg").value("%d번 프로젝트가 생성되었습니다.".formatted(project.getId())))
                .andExpect(jsonPath("$.data.id").value(project.getId()))
                .andExpect(jsonPath("$.data.title").value("테스트 프로젝트"))
                .andExpect(jsonPath("$.data.id").value(project.getId()))
                .andExpect(jsonPath("$.data.title").value("테스트 프로젝트"))
                .andExpect(jsonPath("$.data.summary").value("테스트 요약"))
                .andExpect(jsonPath("$.data.duration").value("1개월"))
                .andExpect(jsonPath("$.data.price").value(1000000))
                .andExpect(jsonPath("$.data.preferredCondition").value("우대 조건"))
                .andExpect(jsonPath("$.data.payCondition").value("급여 조건"))
                .andExpect(jsonPath("$.data.workingCondition").value("업무 조건"))
                .andExpect(jsonPath("$.data.description").value("상세 설명"))
                .andExpect(jsonPath("$.data.deadline").value("2025-12-31T23:59:59"))
                .andExpect(jsonPath("$.data.ownerName").value("클라이언트1"))


                // Skills 검증
                .andExpect(jsonPath("$.data.skills").isArray())
                .andExpect(jsonPath("$.data.skills.length()").value(2))
                .andExpect(jsonPath("$.data.skills[0].id").value(1))
                .andExpect(jsonPath("$.data.skills[0].name").value("Java"))
                .andExpect(jsonPath("$.data.skills[1].id").value(2))
                .andExpect(jsonPath("$.data.skills[1].name").value("Spring boot"))

                // Interests 검증
                .andExpect(jsonPath("$.data.interests").isArray())
                .andExpect(jsonPath("$.data.interests.length()").value(2))
                .andExpect(jsonPath("$.data.interests[0].id").value(1))
                .andExpect(jsonPath("$.data.interests[0].name").value("웹 개발"))
                .andExpect(jsonPath("$.data.interests[1].id").value(2))
                .andExpect(jsonPath("$.data.interests[1].name").value("모바일 앱"));
    }

    @Test
    @DisplayName("프로젝트 등록 (제목 누락)")
    @WithUserDetails(value = "client1", userDetailsServiceBeanName = "customUserDetailsService")
    void t1_1() throws Exception {
        ResultActions resultActions = mvc.perform(
                post("/api/v1/projects")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                {
                    "title": "",
                    "summary": "테스트 요약",
                    "duration": "1개월",
                    "price": 1000000,
                    "preferredCondition": "우대 조건",
                    "payCondition": "급여 조건",
                    "workingCondition": "업무 조건",
                    "description": "상세 설명",
                    "deadline": "2025-12-31T23:59:59",
                    "skills": [1, 2],
                    "interests": [1, 2]
                }
                """)
        ).andDo(print());

        // 응답 검증
        resultActions
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.resultCode").value("400-1"))
                .andExpect(jsonPath("$.msg").value("title-NotBlank-제목은 필수입니다."));
    }

    @Test
    @DisplayName("프로젝트 생성 - client 아닌 유저 등록 시도 시 Fail")
    @WithUserDetails(value = "freelancer1", userDetailsServiceBeanName = "customUserDetailsService")
    void t1_2() throws  Exception {
        ResultActions resultActions = mvc.perform(
                post("/api/v1/projects")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                {
                    "title": "테스트 프로젝트",
                    "summary": "테스트 요약",
                    "duration": "1개월",
                    "price": 1000000,
                    "preferredCondition": "우대 조건",
                    "payCondition": "급여 조건",
                    "workingCondition": "업무 조건",
                    "description": "상세 설명",
                    "deadline": "2025-12-31T23:59:59",
                    "skills": [1, 2],
                    "interests": [1, 2]
                }
                """)
        ).andDo(print());

        // 응답 검증
        resultActions
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.resultCode").value("403-1"))
                .andExpect(jsonPath("$.msg").value("권한이 없습니다."));
    }

    @Test
    @DisplayName("프로젝트 삭제")
    @WithUserDetails(value = "client1", userDetailsServiceBeanName = "customUserDetailsService")
    void t2() throws  Exception {
        long id = 1;
        Project project = projectService.findById(id);
        ResultActions resultActions = mvc.perform(
                delete("/api/v1/projects/" + id)
        ).andDo(print());

        resultActions
                .andExpect(status().isOk())
                .andExpect(handler().handlerType(ApiV1ProjectController.class))
                .andExpect(handler().methodName("delete"))
                .andExpect(jsonPath("$.resultCode").value("200-1"))
                .andExpect(jsonPath("$.msg").value("%d번 프로젝트가 삭제되었습니다.".formatted(id)));

        // 연관 ProjectSkill/ProjectInterest 삭제 확인
        assertThat(projectService.findProjectSkillAllByProject(project)).isEmpty();
        assertThat(projectService.findProjectInterestAllByProject(project)).isEmpty();
    }

    @Test
    @DisplayName("프로젝트 삭제 - freelancer 시도 시 Fail")
    @WithUserDetails(value = "freelancer1", userDetailsServiceBeanName = "customUserDetailsService")
    void t2_1() throws  Exception {
        long id = 1;
        Project project = projectService.findById(id);
        ResultActions resultActions = mvc.perform(
                delete("/api/v1/projects/" + id)
        ).andDo(print());

        resultActions
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.resultCode").value("403-1"))
                .andExpect(jsonPath("$.msg").value("권한이 없습니다."));
    }

    @Test
    @DisplayName("프로젝트 삭제 - 다른 client 시도 시 Fail")
    @WithUserDetails(value = "client3", userDetailsServiceBeanName = "customUserDetailsService")
    void t2_2() throws  Exception {
        long id = 1;
        Project project = projectService.findById(id);
        ResultActions resultActions = mvc.perform(
                delete("/api/v1/projects/" + id)
        ).andDo(print());

        resultActions
                .andExpect(status().isForbidden())
                .andExpect(handler().handlerType(ApiV1ProjectController.class))
                .andExpect(handler().methodName("delete"))
                .andExpect(jsonPath("$.resultCode").value("403-1"))
                .andExpect(jsonPath("$.msg").value("권한이 없습니다."));
    }

    @Test
    @DisplayName("프로젝트 수정")
    @WithUserDetails(value = "client1", userDetailsServiceBeanName = "customUserDetailsService")
    void t3() throws  Exception {
        long id = 1;
        Project project = projectService.findById(id);

        ResultActions resultActions = mvc.perform(
                patch("/api/v1/projects/" + id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                {
                    "title": "테스트 프로젝트 update",
                    "summary": "테스트 요약 update",
                    "duration": "2개월",
                    "price": 10000000,
                    "preferredCondition": "우대 조건  update",
                    "payCondition": "급여 조건  update",
                    "workingCondition": "업무 조건  update",
                    "description": "상세 설명  update",
                    "deadline": "2026-12-31T23:59:59",
                    "status": "IN_PROGRESS",
                    "skills": [1, 2, 3],
                    "interests": [1, 2, 3]
                }
                """)
        ).andDo(print());

        // 응답 검증 (업데이트된 값 기준)
        resultActions
                .andExpect(status().isOk())
                .andExpect(handler().handlerType(ApiV1ProjectController.class))
                .andExpect(handler().methodName("modify"))
                .andExpect(jsonPath("$.resultCode").value("200-1"))
                .andExpect(jsonPath("$.msg").value("%d번 프로젝트가 수정되었습니다.".formatted(project.getId())))
                .andExpect(jsonPath("$.data.id").value(project.getId()))
                .andExpect(jsonPath("$.data.title").value("테스트 프로젝트 update"))
                .andExpect(jsonPath("$.data.summary").value("테스트 요약 update"))
                .andExpect(jsonPath("$.data.duration").value("2개월"))
                .andExpect(jsonPath("$.data.price").value(10000000))
                .andExpect(jsonPath("$.data.preferredCondition").value("우대 조건  update"))
                .andExpect(jsonPath("$.data.payCondition").value("급여 조건  update"))
                .andExpect(jsonPath("$.data.workingCondition").value("업무 조건  update"))
                .andExpect(jsonPath("$.data.description").value("상세 설명  update"))
                .andExpect(jsonPath("$.data.deadline").value("2026-12-31T23:59:59"))
                .andExpect(jsonPath("$.data.skills").isArray())
                .andExpect(jsonPath("$.data.skills.length()").value(3))
                .andExpect(jsonPath("$.data.interests").isArray())
                .andExpect(jsonPath("$.data.interests.length()").value(3))
                .andExpect(jsonPath("$.data.ownerName").value("클라이언트1"))
                .andExpect(jsonPath("$.data.status").value("IN_PROGRESS"));

        // DB에서 실제 연결 상태 조회
        List<ProjectSkill> updatedSkills = projectService.findProjectSkillAllByProject(project);
        List<ProjectInterest> updatedInterests = projectService.findProjectInterestAllByProject(project);

        // skill 검증
        assertThat(updatedSkills)
                .extracting(ps -> ps.getSkill().getId())
                .containsExactlyInAnyOrder(1L, 2L, 3L);

        // interest 검증
        assertThat(updatedInterests)
                .extracting(pi -> pi.getInterest().getId())
                .containsExactlyInAnyOrder(1L, 2L, 3L);
    }

    @Test
    @DisplayName("프로젝트 수정 - freelancer 시도시 Fail")
    @WithUserDetails(value = "freelancer1", userDetailsServiceBeanName = "customUserDetailsService")
    void t3_1() throws  Exception {
        long id = 1;
        Project project = projectService.findById(id);

        ResultActions resultActions = mvc.perform(
                patch("/api/v1/projects/" + id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                {
                    "title": "테스트 프로젝트 update",
                    "summary": "테스트 요약 update",
                    "duration": "2개월",
                    "price": 10000000,
                    "preferredCondition": "우대 조건  update",
                    "payCondition": "급여 조건  update",
                    "workingCondition": "업무 조건  update",
                    "description": "상세 설명  update",
                    "deadline": "2026-12-31T23:59:59",
                    "status": "IN_PROGRESS",
                    "skills": [1, 2, 3],
                    "interests": [1, 2, 3]
                }
                """)
        ).andDo(print());

        resultActions
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.resultCode").value("403-1"))
                .andExpect(jsonPath("$.msg").value("권한이 없습니다."));
    }

    @Test
    @DisplayName("프로젝트 수정 - 다른 client 시도시 Fail")
    @WithUserDetails(value = "client3", userDetailsServiceBeanName = "customUserDetailsService")
    void t3_2() throws  Exception {
        long id = 1;
        Project project = projectService.findById(id);

        ResultActions resultActions = mvc.perform(
                patch("/api/v1/projects/" + id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                {
                    "title": "테스트 프로젝트 update",
                    "summary": "테스트 요약 update",
                    "duration": "2개월",
                    "price": 10000000,
                    "preferredCondition": "우대 조건  update",
                    "payCondition": "급여 조건  update",
                    "workingCondition": "업무 조건  update",
                    "description": "상세 설명  update",
                    "deadline": "2026-12-31T23:59:59",
                    "status": "IN_PROGRESS",
                    "skills": [1, 2, 3],
                    "interests": [1, 2, 3]
                }
                """)
        ).andDo(print());

        resultActions
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.resultCode").value("403-1"))
                .andExpect(jsonPath("$.msg").value("권한이 없습니다."));
    }

    @Test
    @DisplayName("프로젝트 단건조회")
    void t4() throws Exception {
        long id = 1;

        ResultActions resultActions = mvc
                .perform(
                        get("/api/v1/projects/" + id)
                )
                .andDo(print());

        Project project = projectService.findById(id);

        resultActions
                .andExpect(status().isOk())
                .andExpect(handler().handlerType(ApiV1ProjectController.class))
                .andExpect(handler().methodName("getItem"))
                .andExpect(jsonPath("$.id").value(project.getId()))
                .andExpect(jsonPath("$.title").value(project.getTitle()))
                .andExpect(jsonPath("$.summary").value(project.getSummary()))
                .andExpect(jsonPath("$.duration").value(project.getDuration()))
                .andExpect(jsonPath("$.price").value(project.getPrice().doubleValue()))
                .andExpect(jsonPath("$.preferredCondition").value(project.getPreferredCondition()))
                .andExpect(jsonPath("$.payCondition").value(project.getPayCondition()))
                .andExpect(jsonPath("$.workingCondition").value(project.getWorkingCondition()))
                .andExpect(jsonPath("$.description").value(project.getDescription()))
                .andExpect(jsonPath("$.deadline").value(Matchers.startsWith(project.getDeadline().toString().substring(0, 20))))
                .andExpect(jsonPath("$.ownerName").value(project.getClient().getMember().getName()))
                .andExpect(jsonPath("$.status").value(project.getStatus().toString()))
                .andExpect(jsonPath("$.createDate").value(Matchers.startsWith(project.getCreateDate().toString().substring(0, 20))))
                .andExpect(jsonPath("$.modifyDate").value(Matchers.startsWith(project.getModifyDate().toString().substring(0, 20))));

        // DB에서 실제 리스트 조회
        List<ProjectSkill> dbSkills = projectService.findProjectSkillAllByProject(project);
        List<ProjectInterest> dbInterests = projectService.findProjectInterestAllByProject(project);

        // JSON 배열 길이 검증
        resultActions
                .andExpect(jsonPath("$.skills", Matchers.hasSize(dbSkills.size())))
                .andExpect(jsonPath("$.interests", Matchers.hasSize(dbInterests.size())));

        for (int i = 0; i < dbSkills.size(); i++) {
            ProjectSkill ps = dbSkills.get(i);
            resultActions
                    .andExpect(jsonPath(String.format("$.skills[%d].id", i)).value(ps.getSkill().getId()))
                    .andExpect(jsonPath(String.format("$.skills[%d].name", i)).value(ps.getSkill().getName()));
        }

        for (int i = 0; i < dbInterests.size(); i++) {
            ProjectInterest pi = dbInterests.get(i);
            resultActions
                    .andExpect(jsonPath(String.format("$.interests[%d].id", i)).value(pi.getInterest().getId()))
                    .andExpect(jsonPath(String.format("$.interests[%d].name", i)).value(pi.getInterest().getName()));
        }

    }

    @Test
    @DisplayName("프로젝트 다건조회")
    void t5() throws Exception {
        // API 호출
        ResultActions resultActions = mvc
                .perform(get("/api/v1/projects/all"))
                .andDo(print());

        // DB에서 실제 프로젝트 리스트 조회
        List<Project> projectList = projectService.getList();

        // 기본 상태 코드 및 핸들러 검증
        resultActions
                .andExpect(status().isOk())
                .andExpect(handler().handlerType(ApiV1ProjectController.class))
                .andExpect(handler().methodName("getItems"))
                .andExpect(jsonPath("$", Matchers.hasSize(projectList.size()))); // 최상위 배열 길이 검증

        // 각 프로젝트별 상세 검증
        for (int i = 0; i < projectList.size(); i++) {
            Project project = projectList.get(i);

            resultActions
                    .andExpect(jsonPath(String.format("$[%d].id", i)).value(project.getId()))
                    .andExpect(jsonPath(String.format("$[%d].title", i)).value(project.getTitle()))
                    .andExpect(jsonPath(String.format("$[%d].summary", i)).value(project.getSummary()))
                    .andExpect(jsonPath(String.format("$[%d].duration", i)).value(project.getDuration()))
                    .andExpect(jsonPath(String.format("$[%d].price", i)).value(project.getPrice().doubleValue()))
                    .andExpect(jsonPath(String.format("$[%d].preferredCondition", i)).value(project.getPreferredCondition()))
                    .andExpect(jsonPath(String.format("$[%d].payCondition", i)).value(project.getPayCondition()))
                    .andExpect(jsonPath(String.format("$[%d].workingCondition", i)).value(project.getWorkingCondition()))
                    .andExpect(jsonPath(String.format("$[%d].description", i)).value(project.getDescription()))
                    .andExpect(jsonPath(String.format("$[%d].deadline", i), Matchers.startsWith(project.getDeadline().toString().substring(0, 20))))
                    .andExpect(jsonPath(String.format("$[%d].ownerName", i)).value(project.getClient().getMember().getName()))
                    .andExpect(jsonPath(String.format("$[%d].status", i)).value(project.getStatus().toString()))
                    .andExpect(jsonPath(String.format("$[%d].createDate", i), Matchers.startsWith(project.getCreateDate().toString().substring(0, 20))))
                    .andExpect(jsonPath(String.format("$[%d].modifyDate", i), Matchers.startsWith(project.getModifyDate().toString().substring(0, 20))));

            // 각 프로젝트의 스킬, 관심사 리스트 검증
            List<ProjectSkill> dbSkills = projectService.findProjectSkillAllByProject(project);
            List<ProjectInterest> dbInterests = projectService.findProjectInterestAllByProject(project);

            resultActions
                    .andExpect(jsonPath(String.format("$[%d].skills", i), Matchers.hasSize(dbSkills.size())))
                    .andExpect(jsonPath(String.format("$[%d].interests", i), Matchers.hasSize(dbInterests.size())));

            for (int j = 0; j < dbSkills.size(); j++) {
                ProjectSkill ps = dbSkills.get(j);
                resultActions
                        .andExpect(jsonPath(String.format("$[%d].skills[%d].id", i, j)).value(ps.getSkill().getId()))
                        .andExpect(jsonPath(String.format("$[%d].skills[%d].name", i, j)).value(ps.getSkill().getName()));
            }

            for (int j = 0; j < dbInterests.size(); j++) {
                ProjectInterest pi = dbInterests.get(j);
                resultActions
                        .andExpect(jsonPath(String.format("$[%d].interests[%d].id", i, j)).value(pi.getInterest().getId()))
                        .andExpect(jsonPath(String.format("$[%d].interests[%d].name", i, j)).value(pi.getInterest().getName()));
            }
        }
    }

    @Test
    @DisplayName("검색 조건 없는 경우 → 전체 조회")
    void t6_1() throws Exception {
        ResultActions resultActions = mvc.perform(get("/api/v1/projects")
                        .param("page", "0")
                        .param("size", "5"))

                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content").isArray());
    }

    @Test
    @DisplayName("프로젝트 상태 조건으로 검색")
    void t6_2() throws Exception {
        mvc.perform(get("/api/v1/projects")
                        .param("status", ProjectStatus.OPEN.name())
                        .param("page", "0")
                        .param("size", "5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content[0].status").value("OPEN"));
    }

    @Test
    @DisplayName("키워드 조건으로 검색 (제목 포함)")
    void t6_3() throws Exception {
        ResultActions resultActions = mvc.perform(get("/api/v1/projects")
                        .param("keywordType", "title")
                        .param("keyword", "프로젝트 1")
                        .param("page", "0")
                        .param("size", "5"))
                        .andDo(print());
        resultActions
                .andExpect(jsonPath("$.resultCode").value("200-1"))
                .andExpect(jsonPath("$.msg").value("조회 성공"))
                .andExpect(jsonPath("$.data.content").isArray())
                .andExpect(jsonPath("$.data.content[0].title").value("테스트 프로젝트 1"));
    }

    @Test
    @DisplayName("페이지 + content 데이터 검증 (ProjectSkill/Interest 별도 조회)")
    void t6_5() throws Exception {
        int page = 2; // 3번째 페이지 (0부터 시작)
        int size = 1; // 페이지당 1개

        List<Project> allProjects = projectService.getList();
        allProjects.sort(Comparator.comparing(Project::getCreateDate).reversed());
        Project expectedProject = allProjects.get(page * size);

        // 스킬과 관심사 별도 조회
        List<ProjectSkill> dbSkills = projectService.findProjectSkillAllByProject(expectedProject);
        List<ProjectInterest> dbInterests = projectService.findProjectInterestAllByProject(expectedProject);

        ResultActions resultActions = mvc.perform(get("/api/v1/projects")
                        .param("page", String.valueOf(page))
                        .param("size", String.valueOf(size))
                        .accept(MediaType.APPLICATION_JSON))
                .andDo(print());

        resultActions
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.resultCode").value("200-1"))
                .andExpect(jsonPath("$.msg").value("조회 성공"))
                .andExpect(jsonPath("$.data.pageable.pageNumber").value(page))
                .andExpect(jsonPath("$.data.pageable.pageSize").value(size))
                .andExpect(jsonPath("$.data.content", Matchers.hasSize(size)))
                .andExpect(jsonPath("$.data.totalElements").value(allProjects.size()))
                .andExpect(jsonPath("$.data.totalPages").value((int)Math.ceil((double)allProjects.size()/size)))
                .andExpect(jsonPath("$.data.first").value(false))
                .andExpect(jsonPath("$.data.last").value(true))
                // content 내부 데이터 검증
                .andExpect(jsonPath("$.data.content[0].id").value(expectedProject.getId()))
                .andExpect(jsonPath("$.data.content[0].title").value(expectedProject.getTitle()))
                .andExpect(jsonPath("$.data.content[0].summary").value(expectedProject.getSummary()))
                .andExpect(jsonPath("$.data.content[0].status").value(expectedProject.getStatus().toString()))
                .andExpect(jsonPath("$.data.content[0].ownerName").value(expectedProject.getClient().getMember().getName()))
                .andExpect(jsonPath("$.data.content[0].duration").value(expectedProject.getDuration()))
                .andExpect(jsonPath("$.data.content[0].price").value(expectedProject.getPrice().doubleValue()))
                .andExpect(jsonPath("$.data.content[0].deadline").value(expectedProject.getDeadline().toLocalDate().toString()))
                // skills 검증
                .andExpect(jsonPath("$.data.content[0].skills", Matchers.hasSize(dbSkills.size())))
                .andExpect(jsonPath("$.data.content[0].interests", Matchers.hasSize(dbInterests.size())));

        // 각 스킬 값 검증
        for (int i = 0; i < dbSkills.size(); i++) {
            ProjectSkill ps = dbSkills.get(i);
            resultActions
                    .andExpect(jsonPath("$.data.content[0].skills[%d].id".formatted(i)).value(ps.getSkill().getId()))
                    .andExpect(jsonPath("$.data.content[0].skills[%d].name".formatted(i)).value(ps.getSkill().getName()));
        }

        // 각 관심사 값 검증
        for (int i = 0; i < dbInterests.size(); i++) {
            ProjectInterest pi = dbInterests.get(i);
            resultActions
                    .andExpect(jsonPath("$.data.content[0].interests[%d]id".formatted(i)).value(pi.getInterest().getId()))
                    .andExpect(jsonPath("$.data.content[0].interests[%d].name".formatted(i)).value(pi.getInterest().getName()));
        }
    }


    @Test
    @DisplayName("프로젝트 검색 정렬 테스트")
    void t6_6() throws  Exception {
        int page = 2; // 3번째 페이지 (0부터 시작)
        int size = 1; // 페이지당 1개

        ResultActions resultActions = mvc.perform(get("/api/v1/projects")
                        .param("page", String.valueOf(page))
                        .param("size", String.valueOf(size))
                        .param("sort", "id,asc")
                        .accept(MediaType.APPLICATION_JSON))
                .andDo(print());

        Project project = projectService.findById(3);

        resultActions
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.resultCode").value("200-1"))
                .andExpect(jsonPath("$.msg").value("조회 성공"))
                .andExpect(jsonPath("$.data.pageable.pageNumber").value(page))
                .andExpect(jsonPath("$.data.pageable.pageSize").value(size))
                .andExpect(jsonPath("$.data.content[0].id").value(project.getId()));
    }

    @Test
    @DisplayName("프로젝트 검색 / skill & interest 필터링")
    void t6_7_1() throws Exception {
        ResultActions resultActions = mvc.perform(get("/api/v1/projects")
                        .param("skillIds", "1", "2", "3")
                        .param("interestIds", "1", "2", "3")
                        .accept(MediaType.APPLICATION_JSON))
                .andDo(print());

        resultActions
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content").isArray())
                .andExpect(jsonPath("$.data.content.length()").value(1)) // AND 조건에 맞는 프로젝트는 2개
                .andExpect(jsonPath("$.data.content[0].skills[*].id").value(Matchers.containsInAnyOrder(1, 2, 3)))
                .andExpect(jsonPath("$.data.content[0].interests[*].id").value(Matchers.containsInAnyOrder(1, 2, 3)));
    }

    @Test
    @DisplayName("프로젝트 검색 / skill 필터링")
    void t6_7_2() throws Exception {
        ResultActions resultActions = mvc.perform(get("/api/v1/projects")
                        .param("skillIds", "2", "3")        // skillIds = [Spring boot, React]
                        .accept(MediaType.APPLICATION_JSON))
                        .andDo(print());
        resultActions
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content").isArray())
                .andExpect(jsonPath("$.data.content.length()").value(2)) // 조건 만족 프로젝트는 2, 프로젝트 2와 3
                .andExpect(jsonPath("$.data.content[0].skills[*].id", Matchers.hasItem(2)))
                .andExpect(jsonPath("$.data.content[0].interests[*].id", Matchers.hasItem(2)));
    }

    @Test
    @DisplayName("프로젝트 검색 / interest 필터링")
    void t6_7_4() throws Exception {
        // 검색 조건: 데이터 사이언스
        ResultActions resultActions = mvc.perform(get("/api/v1/projects")
                        .param("interestIds", "3")
                        .accept(MediaType.APPLICATION_JSON))
                        .andDo(print());
        resultActions
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.content").isArray())
                .andExpect(jsonPath("$.data.content.length()").value(2)) // 프로젝트 2, 3
                .andExpect(jsonPath("$.data.content[0].interests[*].id").value(Matchers.hasItem(3)));
    }
}