package com.back.domain.recommendations.recommendations.repository;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

@Repository
@RequiredArgsConstructor
public class SearchIndexRepository {

    @PersistenceContext
    private final EntityManager em;

    /** 프로젝트 1건 upsert  */
    public int upsertProjectSearch(Long projectId) {
        String sql = """
            REPLACE INTO project_search
            (project_id, title, summary, duration, price, status,
             description, preferred_condition, working_condition)
            SELECT
                p.id, p.title, p.summary, p.duration, p.price, p.status,
                p.description, p.preferred_condition, p.working_condition
            FROM project p
            WHERE p.id = :projectId
            """;
        return em.createNativeQuery(sql)
                .setParameter("projectId", projectId)
                .executeUpdate();
    }

    /** 프리랜서 1건 upsert */
    public int upsertFreelancerSearch(Long freelancerMemberId) {
        String sql = """
            REPLACE INTO freelancer_search
            (freelancer_id, job, one_liner, career, tech_stack, rating_avg, status)
            SELECT
                f.member_id AS freelancer_id,
                f.job,
                f.comment,
                f.career,
                (
                  SELECT GROUP_CONCAT(s.name ORDER BY s.name SEPARATOR ' ')
                  FROM freelancer_skill fs
                  JOIN skill s ON s.id = fs.skill_id
                  WHERE fs.freelancer_id = f.member_id
                ) AS tech_stack,
                f.rating_avg,
                m.status
            FROM freelancer f
            JOIN member m ON m.id = f.member_id
            WHERE f.member_id = :freelancerMemberId
            """;
        return em.createNativeQuery(sql)
                .setParameter("freelancerMemberId", freelancerMemberId)
                .executeUpdate();
    }

    /** 전체 리빌드(프로젝트) – DELETE + INSERT */
    @Transactional
    public int rebuildAllProjects() {
        em.createNativeQuery("TRUNCATE TABLE project_search").executeUpdate();

        String sql = """
        INSERT INTO project_search
        (project_id, title, summary, duration, price, `status`,
         description, preferred_condition, working_condition)
        SELECT
            p.client_id,
            COALESCE(p.title, ''),
            p.summary,
            p.duration,
            p.price,
            p.status,
            p.description,
            p.preferred_condition,
            p.working_condition
        FROM project p
        """;
        return em.createNativeQuery(sql).executeUpdate();
    }

    /** 전체 리빌드(프리랜서) – DELETE + INSERT */
    @Transactional
    public int rebuildAllFreelancers() {
        em.createNativeQuery("TRUNCATE TABLE freelancer_search").executeUpdate();

        String sql = """
        INSERT INTO freelancer_search
        (freelancer_id, job, one_liner, career, tech_stack, rating_avg, status)
        SELECT
            f.member_id AS freelancer_id,
            f.job,
            f.comment AS one_liner,
            f.career,
            (
              SELECT GROUP_CONCAT(s.name ORDER BY s.name SEPARATOR ' ')
              FROM freelancer_skill fs
              JOIN skill s ON s.id = fs.skill_id
              WHERE fs.freelancer_id = f.member_id
            ) AS tech_stack,
            f.rating_avg,
            m.status
        FROM freelancer f
        JOIN member m ON m.id = f.member_id
        """;
        return em.createNativeQuery(sql).executeUpdate();
    }
}