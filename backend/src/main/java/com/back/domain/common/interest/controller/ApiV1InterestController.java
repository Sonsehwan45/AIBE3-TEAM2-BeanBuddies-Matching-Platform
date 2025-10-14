package com.back.domain.common.interest.controller;

import com.back.domain.common.interest.dto.InterestDto;
import com.back.domain.common.interest.service.InterestService;
import com.back.global.response.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Slf4j
@RestController
@RequiredArgsConstructor
@Tag(name="ApiV1InterestController", description = "API 관심 분야 컨트롤러")
@RequestMapping("/api/v1/interests")
public class ApiV1InterestController {
    private final InterestService interestService;

    @GetMapping
    @Transactional(readOnly=true)
    public ApiResponse<List<InterestDto>> findAll() {
        List<InterestDto> interestDtoList = interestService.findAll().stream()
                .map(InterestDto::new)
                .toList();
        return new ApiResponse<>(
                "200-1",
                "관심 분야 전체 조회 완료",
                interestDtoList
        );
    }
}
