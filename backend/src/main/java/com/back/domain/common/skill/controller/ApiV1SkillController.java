package com.back.domain.common.skill.controller;

import com.back.domain.common.skill.dto.SkillDto;
import com.back.domain.common.skill.service.SkillService;
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
@Tag(name="ApiV1SkillController", description = "API 기술 스택 컨트롤러")
@RequestMapping("/api/v1/skills")
public class ApiV1SkillController {
    private final SkillService skillService;

    @GetMapping
    @Transactional(readOnly=true)
    public ApiResponse<List<SkillDto>> findAll() {
        List<SkillDto> skillDtoList = skillService.findAll().stream()
                .map(SkillDto::new)
                .toList();

        return new ApiResponse<>(
                "200-1",
                "기술 스택 전체 조회 완료",
                skillDtoList
        );
    }
}
