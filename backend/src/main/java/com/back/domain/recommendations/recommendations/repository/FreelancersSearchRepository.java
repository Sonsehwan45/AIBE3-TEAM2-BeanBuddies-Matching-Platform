package com.back.domain.recommendations.recommendations.repository;

import com.back.domain.recommendations.recommendations.entity.FreelancersSearch;
import com.back.domain.recommendations.recommendations.view.FreelancerScoreView;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface FreelancersSearchRepository extends JpaRepository<FreelancersSearch, Long> {

    Optional<FreelancersSearch> findFirstByFreelancerId(Long freelancerId);

    @Query(value = """
    SELECT
      f.freelancer_id                                    AS freelancerId,
      f.job                                              AS jobRole,
      (
        (  MATCH(f.job)            AGAINST (:qJobAny    IN BOOLEAN MODE) * :wJob
         + MATCH(f.career)         AGAINST (:qCareerAny IN BOOLEAN MODE) * :wCareer
         + MATCH(f.tech_stack)     AGAINST (:qStackAny  IN BOOLEAN MODE) * :wStack
        )
        *
        (
          (:rfTop - 0.5) + 0.1 * LEAST(GREATEST(COALESCE(f.rating_avg, :defaultRating), 0.0), 5.0)
        )
      ) AS textScore
    FROM freelancer_search f
    WHERE f.status = 'ACTIVE'
      AND (
            MATCH(f.job)        AGAINST (:qJobAny    IN BOOLEAN MODE)
         OR MATCH(f.career)     AGAINST (:qCareerAny IN BOOLEAN MODE)
         OR MATCH(f.tech_stack) AGAINST (:qStackAny  IN BOOLEAN MODE)
      )
    ORDER BY textScore DESC
    """,
            countQuery = """
    SELECT COUNT(*)
    FROM freelancer_search f
    WHERE f.status = 'ACTIVE'
      AND (
            MATCH(f.job)        AGAINST (:qJobAny    IN BOOLEAN MODE)
         OR MATCH(f.career)     AGAINST (:qCareerAny IN BOOLEAN MODE)
         OR MATCH(f.tech_stack) AGAINST (:qStackAny  IN BOOLEAN MODE)
      )
    """,
            nativeQuery = true)
    Page<FreelancerScoreView> scoreFreelancers(
            @Param("qJobAny")      String qJobAny,
            @Param("qCareerAny")   String qCareerAny,
            @Param("qStackAny")    String qStackAny,
            @Param("wJob")         double wJob,
            @Param("wCareer")      double wCareer,
            @Param("wStack")       double wStack,
            @Param("rfTop")        double rfTop,
            @Param("defaultRating") double defaultRating,
            Pageable pageable
    );
}