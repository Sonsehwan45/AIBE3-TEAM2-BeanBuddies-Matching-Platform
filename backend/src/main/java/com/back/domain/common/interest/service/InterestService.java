package com.back.domain.common.interest.service;

import com.back.domain.common.interest.dto.InterestDto;
import com.back.domain.common.interest.entity.Interest;
import com.back.domain.common.interest.repository.InterestRepository;
import com.back.domain.project.project.repository.ProjectInterestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class InterestService {
    private final InterestRepository interestRepository;
    private final ProjectInterestRepository projectInterestRepository;

    public long count() {
        return interestRepository.count();
    }

    public List<InterestDto> findByProjectId(Long projectId) {
        return projectInterestRepository.findAllByProject_Id(projectId)
                .stream()
                .map(pi -> new InterestDto(pi.getInterest()))
                .toList();
    }

    public void create(String name) {
        Interest interest = new Interest(name);
        interestRepository.save(interest);
    }

    public List<Interest> findAllById(List<Long> interestsId) {
        return interestRepository.findAllById(interestsId);
    }
}
