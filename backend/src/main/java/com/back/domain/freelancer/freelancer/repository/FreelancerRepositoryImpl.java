package com.back.domain.freelancer.freelancer.repository;

import static com.back.domain.freelancer.freelancer.entity.QFreelancer.freelancer;
import static com.back.domain.freelancer.join.entity.QFreelancerSkill.freelancerSkill;

import com.back.domain.common.skill.dto.SkillDto;
import com.back.domain.freelancer.freelancer.constant.CareerLevel;
import com.back.domain.freelancer.freelancer.dto.FreelancerSearchCondition;
import com.back.domain.freelancer.freelancer.dto.FreelancerSummary;
import com.querydsl.core.Tuple;
import com.querydsl.core.types.dsl.BooleanExpression;
import com.querydsl.jpa.impl.JPAQueryFactory;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

@RequiredArgsConstructor
public class FreelancerRepositoryImpl implements FreelancerRepositoryCustom {

    private final JPAQueryFactory queryFactory;

    // 검색조건 : 경력, 평점, 스킬
    // TODO : 정렬조건 추가
    public Page<FreelancerSummary> findAll(FreelancerSearchCondition condition, Pageable pageable) {
        long offset = pageable.getOffset();
        int limit = pageable.getPageSize();

        List<Tuple> freelancers = queryFactory.select(
                        freelancer.id,
                        freelancer.member.name,
                        freelancer.careerTotalYears,
                        freelancer.ratingAvg
                )
                .distinct()
                .where(
                        ratingAvgGoe(condition.ratingAvg()),
                        careerYearBetween(condition.careerLevel()),
                        skillIn(condition.skillIds())
                )
                .from(freelancer)
                .leftJoin(freelancer.skills, freelancerSkill)
                .offset(offset)
                .limit(limit)
                .orderBy()
                .fetch();

        List<Long> freelancerIds = freelancers.stream()
                .map(tuple -> tuple.get(freelancer.id))
                .toList();

        // 검색결과가 없으면 빈 페이지 반환
        if (freelancerIds.isEmpty()) {
            return new PageImpl<>(Collections.emptyList(), pageable, 0);
        }

        // 프리랜서 ID가 포함된 모든 스킬 조회
        List<Tuple> freelancersSkills = queryFactory.select(
                        freelancerSkill.freelancer.id,
                        freelancerSkill.skill.id,
                        freelancerSkill.skill.name
                )
                .from(freelancerSkill)
                .where(freelancerSkill.freelancer.id.in(freelancerIds))
                .fetch();

        // 프리랜서 - 스킬을 조합하기 위해
        // FreelancerId를 키로, 해당 FreelancerId를 포함하는 스킬 칼럼들로 그룹화
        Map<Long, List<SkillDto>> freelancerIdToSkill = groupByFreelancerSkill(freelancersSkills);

        // 두 개의 쿼리 조합
        List<FreelancerSummary> results = freelancers.stream()
                .map(tuple -> new FreelancerSummary(
                        tuple.get(freelancer.id),
                        tuple.get(freelancer.member.name),
                        tuple.get(freelancer.careerTotalYears),
                        tuple.get(freelancer.ratingAvg),
                        freelancerIdToSkill.get(tuple.get(freelancer.id))
                ))
                .toList();

        // 총 개수 쿼리
        long total = queryFactory
                .select(freelancer.countDistinct())
                .from(freelancer)
                .leftJoin(freelancer.skills, freelancerSkill)
                .where(
                        ratingAvgGoe(condition.ratingAvg()),
                        careerYearBetween(condition.careerLevel()),
                        skillIn(condition.skillIds())
                )
                .fetchOne();

        return new PageImpl<>(results, pageable, total);
    }

    private BooleanExpression ratingAvgGoe(Float ratingAvg) {
        if (ratingAvg == null) {
            return null;
        }
        return freelancer.ratingAvg.goe(ratingAvg);
    }

    private BooleanExpression careerYearBetween(CareerLevel careerLevel) {
        if (careerLevel == null || careerLevel == CareerLevel.UNDEFINED) {
            return null;
        }
        return freelancer.careerTotalYears.between(careerLevel.getMinYear(), careerLevel.getMaxYear());
    }

    private BooleanExpression skillIn(List<Long> skillIds) {
        if (skillIds == null || skillIds.isEmpty()) {
            return null;
        }
        return freelancer.skills.any().skill.id.in(skillIds);
    }

    private Map<Long, List<SkillDto>> groupByFreelancerSkill(List<Tuple> freelancersSkills) {
        return freelancersSkills.stream()
                .collect(
                        Collectors.groupingBy(
                                tuple -> tuple.get(freelancerSkill.freelancer.id),
                                Collectors.mapping(
                                        tuple -> new SkillDto(
                                                tuple.get(freelancerSkill.skill.id),
                                                tuple.get(freelancerSkill.skill.name)
                                        ),
                                        Collectors.toList()
                                )
                        ));
    }
}
