package com.back.domain.freelancer.freelancer.repository;

import com.back.domain.freelancer.freelancer.constant.CareerLevel;
import com.back.domain.freelancer.freelancer.dto.FreelancerSearchCondition;
import com.back.domain.freelancer.freelancer.dto.FreelancerSummary;
import com.back.domain.freelancer.freelancer.entity.Freelancer;
import java.util.List;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Profile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.test.context.ActiveProfiles;

@ActiveProfiles("test")
@SpringBootTest
public class FreelancerRepositoryTest {

    @Autowired
    private FreelancerRepository repository;

    @Test
    @DisplayName("검색 조건 없음")
    void t1() {
        FreelancerSearchCondition condition = new FreelancerSearchCondition(null, null, null);
        Pageable pageable = PageRequest.of(0, 10);

        Page<FreelancerSummary> custom = repository.findAll(condition, pageable);
        List<Freelancer> jpaDefault = repository.findAll();

        Assertions.assertThat(custom).size().isEqualTo(jpaDefault.size());
    }

    @Test
    @DisplayName("검색 조건 - 경력(신입)")
    void t2_1() {
        FreelancerSearchCondition condition = new FreelancerSearchCondition(CareerLevel.NEWBIE, null, null);
        Pageable pageable = PageRequest.of(0, 10);

        Page<FreelancerSummary> findAll = repository.findAll(condition, pageable);

        Assertions.assertThat(findAll).size().isEqualTo(1);
    }

    @Test
    @DisplayName("검색 조건 - 경력(시니어)")
    void t2_2() {
        FreelancerSearchCondition condition = new FreelancerSearchCondition(CareerLevel.SENIOR, null, null);
        Pageable pageable = PageRequest.of(0, 10);

        Page<FreelancerSummary> findAll = repository.findAll(condition, pageable);

        Assertions.assertThat(findAll).size().isEqualTo(1);
    }

    @Test
    @DisplayName("검색 조건 - 경력(UNDEFINED - 미입력)")
    void t2_3() {
        FreelancerSearchCondition condition = new FreelancerSearchCondition(CareerLevel.UNDEFINED, null, null);
        Pageable pageable = PageRequest.of(0, 10);

        Page<FreelancerSummary> findAll = repository.findAll(condition, pageable);

        Assertions.assertThat(findAll).size().isEqualTo(5);
    }

    // TODO : ratingAvg 관련 추가
    @Test
    @DisplayName("검색 조건 - 평점")
    void t3_1() {
        FreelancerSearchCondition condition = new FreelancerSearchCondition(null, 0f, null);
        Pageable pageable = PageRequest.of(0, 10);

        Page<FreelancerSummary> findAll = repository.findAll(condition, pageable);

        Assertions.assertThat(findAll).size().isEqualTo(5);
    }


    @Test
    @DisplayName("검색 조건 - 기술스택(1번, 2번기술)")
    void t4_1() {
        FreelancerSearchCondition condition = new FreelancerSearchCondition(null, null, List.of(1L, 2L));
        Pageable pageable = PageRequest.of(0, 10);

        Page<FreelancerSummary> findAll = repository.findAll(condition, pageable);

        Assertions.assertThat(findAll).size().isEqualTo(3);
    }

    @Test
    @DisplayName("검색 조건 - 기술스택(3번기술)")
    void t4_2() {
        FreelancerSearchCondition condition = new FreelancerSearchCondition(null, null, List.of(3L));
        Pageable pageable = PageRequest.of(0, 10);

        Page<FreelancerSummary> findAll = repository.findAll(condition, pageable);

        Assertions.assertThat(findAll).size().isEqualTo(2);
    }
}


