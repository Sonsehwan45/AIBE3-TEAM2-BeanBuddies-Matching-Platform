package com.back.domain.freelancer.freelancer.controller;

import com.back.domain.freelancer.freelancer.dto.FreelancerSearchCondition;
import com.back.domain.freelancer.freelancer.dto.FreelancerSummary;
import com.back.domain.freelancer.freelancer.dto.FreelancerUpdateForm;
import com.back.domain.freelancer.freelancer.dto.FreelancerUpdateResponse;
import com.back.domain.freelancer.freelancer.entity.Freelancer;
import com.back.domain.freelancer.freelancer.service.FreelancerService;
import com.back.global.response.ApiResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/freelancers")
public class FreelancerController {

    private final FreelancerService freelancerService;

    // 프리랜서 정보 수정
    @PutMapping("/{id}")
    public ApiResponse<FreelancerUpdateResponse> updateFreelancer(@PathVariable Long id,
                                                                  @RequestBody FreelancerUpdateForm info) {
        Freelancer freelancer = freelancerService.updateFreelancer(
                id,
                info.job(),
                info.freelancerEmail(),
                info.comment(),
                info.career()
        );

        FreelancerUpdateResponse response = new FreelancerUpdateResponse(freelancer);

        return new ApiResponse<>(
                "200",
                "프리랜서 정보 변경",
                response
        );
    }

    // 프리랜서 목록 조회
    @GetMapping
    public ApiResponse<Page<FreelancerSummary>> getFreelancers(
            FreelancerSearchCondition condition,
            @PageableDefault(size = 20, sort = "ratingAvg", direction = Sort.Direction.DESC)
            Pageable pageable
    ) {
        Page<FreelancerSummary> result = freelancerService.findAll(condition, pageable);

        return new ApiResponse<>(
                "200",
                "프리랜서 목록",
                result
        );
    }
}
