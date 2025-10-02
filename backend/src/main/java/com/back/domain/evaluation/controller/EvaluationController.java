package com.back.domain.evaluation.controller;


import com.back.domain.evaluation.service.EvaluationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class EvaluationController {

    private final EvaluationService evaluationService;

    //평가 생성
    @PostMapping("/evaluation")
    public ResponseEntity<Void> createEvaluation(@RequestBody EvalutaionCreateReq request){
        //임의로 생성자의 아이디 생성
        Long currentUserId = 1L;

        evaluationService.createEvaluation(currentUserId, request);

        return ResponseEntity.status(HttpStatus.CREATED).build();
    }
}
