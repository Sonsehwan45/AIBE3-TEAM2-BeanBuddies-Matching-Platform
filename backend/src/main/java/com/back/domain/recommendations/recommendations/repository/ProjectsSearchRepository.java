package com.back.domain.recommendations.recommendations.repository;

import com.back.domain.recommendations.recommendations.entity.ProjectsSearch;
import com.back.domain.recommendations.recommendations.view.ProjectScoreView;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProjectsSearchRepository extends JpaRepository<ProjectsSearch, Long> {

    Optional<ProjectsSearch> findFirstByProjectId(Long projectId);

    @Query(value = """
    SELECT
      p.project_id                                        AS projectId,
      p.title                                             AS title,
      (  MATCH(p.title)                AGAINST (:qTitleAny IN BOOLEAN MODE) * :wTitle
       + MATCH(p.preferred_condition)  AGAINST (:qPrefAny  IN BOOLEAN MODE) * :wPref
       + MATCH(p.working_condition)    AGAINST (:qWorkAny  IN BOOLEAN MODE) * :wWork
      )                                                   AS textScore
    FROM project_search p
    WHERE p.status = 'OPEN'
      AND (
            MATCH(p.title)               AGAINST (:qTitleAny IN BOOLEAN MODE)
         OR MATCH(p.preferred_condition) AGAINST (:qPrefAny  IN BOOLEAN MODE)
         OR MATCH(p.working_condition)   AGAINST (:qWorkAny  IN BOOLEAN MODE)
      )
    ORDER BY textScore DESC
    """,
            countQuery = """
    SELECT COUNT(*)
    FROM project_search p
    WHERE p.status = 'OPEN'
      AND (
            MATCH(p.title)               AGAINST (:qTitleAny IN BOOLEAN MODE)
         OR MATCH(p.preferred_condition) AGAINST (:qPrefAny  IN BOOLEAN MODE)
         OR MATCH(p.working_condition)   AGAINST (:qWorkAny  IN BOOLEAN MODE)
      )
    """,
            nativeQuery = true)
    Page<ProjectScoreView> scoreProjects(
            @Param("qTitleAny") String qTitleAny,
            @Param("qPrefAny")  String qPrefAny,
            @Param("qWorkAny")  String qWorkAny,
            @Param("wTitle")    double wTitle,
            @Param("wPref")     double wPref,
            @Param("wWork")     double wWork,
            Pageable pageable
    );
}