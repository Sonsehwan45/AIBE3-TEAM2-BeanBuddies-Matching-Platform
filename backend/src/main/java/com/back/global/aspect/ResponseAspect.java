package com.back.global.aspect;

import com.back.global.response.ApiResponse;
import jakarta.servlet.http.HttpServletResponse;
import java.lang.annotation.Target;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class ResponseAspect {

    private final HttpServletResponse response;


    public ResponseAspect(HttpServletResponse response) {
        this.response  = response;
    }

    @Around("""
                execution(public com.back.global.response.ApiResponse *(..)) &&
                (
                    within(@org.springframework.stereotype.Controller *) ||
                    within(@org.springframework.web.bind.annotation.RestController *)
                ) &&
                (
                    @annotation(org.springframework.web.bind.annotation.GetMapping) ||
                    @annotation(org.springframework.web.bind.annotation.PostMapping) ||
                    @annotation(org.springframework.web.bind.annotation.PutMapping) ||
                    @annotation(org.springframework.web.bind.annotation.PatchMapping) ||
                    @annotation(org.springframework.web.bind.annotation.DeleteMapping) ||
                    @annotation(org.springframework.web.bind.annotation.RequestMapping)
                )
            """)
    public Object handleResponse(ProceedingJoinPoint joinPoint) throws Throwable {
        // 원래 컨트롤러 메서드 실행 (ex: write() 메서드 실행)
        Object proceed = joinPoint.proceed();

        // 반환값이 ApiResponse라면, 그 안에 있는 statusCode를 HttpServletResponse에 반영
        ApiResponse<?> apiResponse = (ApiResponse<?>) proceed;
        response.setStatus(apiResponse.statusCode());

        // 응답 본문은 그대로 클라이언트에게 전달
        return proceed;
    }
}