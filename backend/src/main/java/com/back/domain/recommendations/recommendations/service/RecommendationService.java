package com.back.domain.recommendations.recommendations.service;

import com.back.domain.member.member.constant.Role;
import com.back.domain.member.member.entity.Member;
import com.back.domain.member.member.repository.MemberRepository;
import com.back.domain.project.project.entity.Project;
import com.back.domain.project.project.repository.ProjectRepository;
import com.back.domain.recommendations.recommendations.dto.ProjectOptionDto;
import com.back.domain.recommendations.recommendations.repository.FreelancersSearchRepository;
import com.back.domain.recommendations.recommendations.repository.ProjectsSearchRepository;
import com.back.global.exception.ServiceException;
import com.back.global.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class RecommendationService {

    private final MemberRepository memberRepo;
    private final ProjectRepository projectRepo;
    private final ProjectsSearchRepository projectsSearchRepo;
    private final FreelancersSearchRepository freelancersSearchRepo;

    // ===== 가중치 (매칭 페어별) =====
    // 프리랜서 -> 프로젝트 (job -> title, career -> preferred_condition, tech_stack -> working_condition)
    private static final double W_TITLE = 1.2;
    private static final double W_PREF  = 1.0;
    private static final double W_WORK  = 1.6;

    // 프로젝트 -> 프리랜서 (title -> job, preferred_condition -> career, working_condition -> tech_stack)
    private static final double W_JOB     = 1.3;
    private static final double W_CAREER  = 0.9;
    private static final double W_FSTACK  = 1.5;

    private static final double RF_TOP = 1.25;
    private static final double DEFAULT_RATING = 2.5; // 미평가 시 1.00배(= 0.75 + 0.1*2.5)

    public Page<?> recommendForUser(CustomUserDetails user, Long projectIdOrNull, int page, int size) {
        Member me = memberRepo.findById(user.getId())
                .orElseThrow(() -> new ServiceException("401-2", "사용자 정보를 찾을 수 없습니다"));

        Pageable pageable = PageRequest.of(page, size);

        if (me.getRole() == Role.FREELANCER) {
            var fsOpt = freelancersSearchRepo.findFirstByFreelancerId(me.getId());
            if (fsOpt.isEmpty()) return Page.empty(pageable);
            var fs = fsOpt.get();

            String qTitleAny = toAnyBooleanQuery(fs.getJob());
            String qPrefAny  = toAnyBooleanQuery(flattenCareer(fs.getCareer()));
            String qWorkAny  = toAnyBooleanQuery(fs.getTechStack());

            return projectsSearchRepo.scoreProjects(
                    qTitleAny, qPrefAny, qWorkAny,
                    W_TITLE, W_PREF, W_WORK,
                    pageable
            );
        }

        if (me.getRole() == Role.CLIENT) {
            Long targetProjectId = projectIdOrNull;
            if (targetProjectId == null) {
                // 최근 프로젝트(예: author 기준) 가져오는 기존 로직 유지
                var lastProjectOpt = projectRepo.findByIdWithAuthor(me.getId());
                if (lastProjectOpt.isEmpty()) return Page.empty(pageable);
                targetProjectId = lastProjectOpt.get().getId();
            }

            var psOpt = projectsSearchRepo.findFirstByProjectId(targetProjectId);
            if (psOpt.isEmpty()) return Page.empty(pageable);
            var ps = psOpt.get();

            String qJobAny    = toAnyBooleanQuery(ps.getTitle());
            String qCareerAny = toAnyBooleanQuery(ps.getPreferredCondition());
            String qStackAny  = toAnyBooleanQuery(ps.getWorkingCondition());

            return freelancersSearchRepo.scoreFreelancers(
                    qJobAny, qCareerAny, qStackAny,
                    W_JOB, W_CAREER, W_FSTACK,
                    RF_TOP, DEFAULT_RATING,
                    pageable
            );
        }
        return Page.empty(pageable);
    }

    public List<ProjectOptionDto> getMyProjectOptions(CustomUserDetails user, int limit) {
        Member me = memberRepo.findById(user.getId())
                .orElseThrow(() -> new ServiceException("401-2", "사용자 정보를 찾을 수 없습니다"));

        if (me.getRole() != Role.CLIENT) return Collections.emptyList();

        int pageSize = Math.max(1, Math.min(limit, 200));
        Pageable pageable = PageRequest.of(0, pageSize, Sort.by(Sort.Direction.DESC, "createDate"));

        Page<Project> page = projectRepo.findByClientId(me.getId(), pageable);
        return page.getContent().stream()
                .map(p -> new ProjectOptionDto(p.getId(), p.getTitle(),
                        p.getStatus() == null ? null : p.getStatus().name()))
                .toList();
    }


    private Member getCurrentMember() {
        SecurityContext context = SecurityContextHolder.getContext();
        Authentication auth = (context != null) ? context.getAuthentication() : null;

        if (auth == null || !auth.isAuthenticated()
                || "anonymousUser".equals(String.valueOf(auth.getPrincipal()))) {
            throw new ServiceException("401-111", "로그인 정보가 없습니다");
        }

        String username = auth.getName();
        return memberRepo.findByUsername(username)
                .orElseThrow(() -> new ServiceException("401-222", "사용자 정보를 찾을 수 없습니다"));
    }

    /** 텍스트 → Mroonga Boolean(+토큰) 질의 변환기 */
    private String toBooleanQuery(String text) {
        if (text == null) return "";
        String cleaned = text
                .replaceAll("[\\p{Cntrl}]+", " ")
                .replaceAll("[\\p{Punct}]+", " ")
                .replaceAll("\\s+", " ")
                .trim();

        if (cleaned.isBlank()) return "";

        String[] split = cleaned.split("[\\s,;/|]+");
        List<String> tokens = Stream.of(split)
                .filter(s -> s != null && !s.isBlank())
                .map(String::trim)
                .distinct()
                .toList();

        if (tokens.isEmpty()) return "";
        return tokens.stream()
                .map(t -> "+" + t)
                .collect(Collectors.joining(" "));
    }

    /** career(Map<String,Integer>) -> "java spring backend ..." */
    private String flattenCareer(Map<String, Integer> career) {
        if (career == null || career.isEmpty()) return "";
        return career.keySet().stream()
                .filter(k -> k != null && !k.isBlank())
                .map(String::trim)
                .distinct()
                .collect(Collectors.joining(" "));
    }

    /** 부분 일치용 불리언 쿼리(OR): '+토큰' 없이 공백 구분.
     *  비거나 전부 제거되면 더미 토큰을 넣어 AGAINST 에러 방지. */
    private String toAnyBooleanQuery(String text) {
        if (text == null) return "__noop__";
        String cleaned = text
                .replaceAll("[\\p{Cntrl}]+", " ")
                .replaceAll("[\\p{Punct}]+", " ")
                .replaceAll("\\s+", " ")
                .trim();
        if (cleaned.isBlank()) return "__noop__";
        String[] split = cleaned.split("[\\s,;/|]+");
        String q = Stream.of(split)
                .filter(s -> s != null && !s.isBlank())
                .map(String::trim)
                .distinct()
                .collect(Collectors.joining(" "));
        return q.isBlank() ? "__noop__" : q;
    }
}