package com.back.domain.recommendations.recommendations.service;

import com.back.domain.recommendations.recommendations.repository.SearchIndexRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SearchIndexService {

    private final SearchIndexRepository repo;

    /** 프로젝트 저장/수정 직후 호출 */
    @Transactional
    public void upsertProjectSearch(Long projectId) {
        repo.upsertProjectSearch(projectId);
    }

    /** 프리랜서 저장/수정 직후 호출 */
    @Transactional
    public void upsertFreelancerSearch(Long freelancerId) {
        repo.upsertFreelancerSearch(freelancerId);
    }

    /** 관리자용: 전체 리빌드 */
    @Transactional
    public void rebuildAll() {
        repo.rebuildAllProjects();
        repo.rebuildAllFreelancers();
    }
}