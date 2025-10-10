package com.back.global.security;

import com.back.domain.member.member.entity.Member;
import com.back.domain.member.member.service.AuthService;
import com.back.domain.member.member.service.MemberService;
import com.back.global.jwt.JwtProvider;
import com.back.global.web.CookieHelper;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtProvider jwtProvider;
    private final CookieHelper cookieHelper;
    private final MemberService memberService;
    private final AuthService authService;
    private final TokenBlacklistService tokenBlacklistService;

    private final List<String> skipUrls = List.of(
            "/api/v1/members/login",
            "/api/v1/members/join"
    );

    //요청당 한 번만 호출되는 로직, doFilter는 같은 요청에 대해 여러번 호출될 수 있음
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {

        //api 요청이 아니면 패스
        if(!request.getRequestURI().startsWith("/api/")) {
            filterChain.doFilter(request, response);
            return;
        }

        //인증 필요없는 경로는 패스
        if(skipUrls.contains(request.getRequestURI())) {
            filterChain.doFilter(request, response);
            return;
        }

        //accessToken 추출
        String header = request.getHeader("Authorization");
        if(header == null || !header.startsWith("Bearer ")) {
            //AccessToken 없으면 인증 안 된 상태로 통과
            filterChain.doFilter(request, response);
            return;
        }
        String accessToken = header.replace("Bearer ", "");

        //블랙리스트 확인
        if(tokenBlacklistService.isBlacklisted(accessToken)) {
            filterChain.doFilter(request, response);
            return;
        }

        //accessToken이 없을 때 -> refreshToken 확인 후 재발급
        Claims accessClaims = jwtProvider.getClaims(accessToken, true);
        if(accessClaims == null) {
            String refreshToken = cookieHelper.getCookieValue("refreshToken", null);

            if(refreshToken == null || refreshToken.isBlank()) {
                filterChain.doFilter(request, response);
                return;
            }
            accessClaims = reIssueAccessToken(refreshToken, request, response);
        }

        //accessToken으로 인증 정보 저장
        if(accessClaims != null) {
            setAuthentication(accessClaims);
        }

        filterChain.doFilter(request, response);
    }

    private Claims reIssueAccessToken(String refreshToken, HttpServletRequest request, HttpServletResponse response) {
        //refreshToken 추출 후 유효성 검사
        Claims refreshClaims = jwtProvider.getClaims(refreshToken, false);
        log.info("RefreshToken Claims: {}", refreshClaims);
        if(refreshClaims == null) return null;

        //member 정보로 accessToken 재발급
        Long memberId = refreshClaims.get("id", Long.class);
        Member member = memberService.findById(memberId);
        String newAccessToken = authService.reissueAccessToken(member);

        //헤더 설정
        response.setHeader("Authorization", "Bearer " + newAccessToken);

        //새로 설정한 토큰의 Claim 추출
        return jwtProvider.getClaims(newAccessToken, true);
    }

    private void setAuthentication(Claims claims) {
        //accessToken으로 UserDetails 객체 생성
        CustomUserDetails userDetails = new CustomUserDetails(
                ((Number) claims.get("id")).longValue(),
                (String) claims.get("name"),
                (String) claims.get("role"),
                (String) claims.get("status")
        );

        //Spring Security 인증 토큰 생성
        UsernamePasswordAuthenticationToken authToken =
                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());

        //SecurityContext에 인증 정보 저장
        SecurityContextHolder.getContext().setAuthentication(authToken);
    }
}
