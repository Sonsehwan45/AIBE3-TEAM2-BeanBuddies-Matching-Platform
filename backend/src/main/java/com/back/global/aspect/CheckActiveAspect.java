package com.back.global.aspect;

import com.back.global.response.ApiResponse;
import com.back.global.security.CustomUserDetails;
import jakarta.servlet.http.HttpServletResponse;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
@Aspect
@Component
public class CheckActiveAspect {

    private final HttpServletResponse response;

    public CheckActiveAspect(HttpServletResponse response) {
        this.response = response;
    }

    @Around("@annotation(com.back.global.security.annotation.CheckActive) || @within(com.back.global.security.annotation.CheckActive)")
    public Object checkActive(ProceedingJoinPoint joinPoint) throws Throwable {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();

        if (principal instanceof CustomUserDetails user) {
            if (!user.isActive()) {
                response.setStatus(403);
                return new ApiResponse<>("403-2", "비활성 계정입니다.");
            }
        }

        return joinPoint.proceed();
    }
}
