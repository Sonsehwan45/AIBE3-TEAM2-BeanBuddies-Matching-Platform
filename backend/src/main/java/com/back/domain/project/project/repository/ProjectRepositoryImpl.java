package com.back.domain.project.project.repository;

import com.back.domain.project.project.constant.ProjectStatus;
import com.back.domain.project.project.entity.Project;
import com.querydsl.core.types.Order;
import com.querydsl.core.types.OrderSpecifier;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.core.types.dsl.PathBuilder;
import com.querydsl.jpa.impl.JPAQueryFactory;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.util.List;

import static com.back.domain.project.project.entity.QProject.project;
import static com.back.domain.project.project.entity.QProjectInterest.projectInterest;
import static com.back.domain.project.project.entity.QProjectSkill.projectSkill;


@RequiredArgsConstructor
public class ProjectRepositoryImpl implements ProjectRepositoryCustom{
    private final JPAQueryFactory queryFactory;

    @Override
    public Page<Project> searchProjects(
            String keywordType,
            String keyword,
            List<Long> skillIds,
            List<Long> interestIds,
            ProjectStatus status,
            Pageable pageable
    ) {
        // 조건 생성
        BooleanExpression keywordCond = createKeywordCondition(keywordType, keyword);
        BooleanExpression skillCond = createSkillCondition(skillIds);
        BooleanExpression interestCond = createInterestCondition(interestIds);
        BooleanExpression statusCond = (status != null) ? project.status.eq(status) : null;

        // QueryDSL Query
        var query = queryFactory
                .selectFrom(project)
                .where(keywordCond, skillCond, interestCond, statusCond);

        // Pageable Sort 반영
        if (pageable.getSort().isSorted()) {
            PathBuilder<Project> pathBuilder = new PathBuilder<>(Project.class, "project");
            pageable.getSort().forEach(order -> {
                query.orderBy(
                        new OrderSpecifier(
                                order.isAscending() ? Order.ASC : Order.DESC,
                                pathBuilder.get(order.getProperty())
                        )
                );
            });
        } else {
            // 기본 정렬
            query.orderBy(project.createDate.desc());
        }

        // 페이징 적용
        long offset = pageable.getOffset();
        int limit = pageable.getPageSize();

        List<Project> content = query
                .offset(offset)
                .limit(limit)
                .fetch();

        // 전체 카운트
        long total = queryFactory
                .selectFrom(project)
                .where(keywordCond, skillCond, interestCond, statusCond)
                .fetchCount();

        return new PageImpl<>(content, pageable, total);
    }


    // -----------------------------
    // 조건 생성 메서드
    // -----------------------------
    private BooleanExpression createKeywordCondition(String keywordType, String keyword) {
        if (keyword == null || keyword.isBlank()) return null;

        return switch (keywordType.toLowerCase()) {
            case "title" -> project.title.containsIgnoreCase(keyword);
            case "summary" -> project.summary.containsIgnoreCase(keyword);
            case "description" -> project.description.containsIgnoreCase(keyword);
            case "" -> project.title.containsIgnoreCase(keyword)
                    .or(project.summary.containsIgnoreCase(keyword))
                    .or(project.description.containsIgnoreCase(keyword));
            default -> null;
        };
    }

    private BooleanExpression createSkillCondition(List<Long> skillIds) {
        if (skillIds == null || skillIds.isEmpty()) return null;

        return project.id.in(
                queryFactory
                        .select(projectSkill.project.id)
                        .from(projectSkill)
                        .where(projectSkill.skill.id.in(skillIds))
                        .groupBy(projectSkill.project.id)
                        .having(projectSkill.skill.id.countDistinct().eq((long) skillIds.size()))
        );
    }

    private BooleanExpression createInterestCondition(List<Long> interestIds) {
        if (interestIds == null || interestIds.isEmpty()) return null;

        return project.id.in(
                queryFactory
                        .select(projectInterest.project.id)
                        .from(projectInterest)
                        .where(projectInterest.interest.id.in(interestIds))
                        .groupBy(projectInterest.project.id)
                        .having(projectInterest.interest.id.countDistinct().eq((long) interestIds.size()))
        );
    }
}
