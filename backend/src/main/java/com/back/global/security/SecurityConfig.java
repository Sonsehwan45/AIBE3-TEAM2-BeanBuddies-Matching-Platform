package com.back.global.security;

import com.back.global.response.ApiResponse;
import com.back.standard.json.JsonUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                //요청에 대한 권한 설정
                .authorizeHttpRequests(auth -> auth
                        //누구나 접근 가능
                        .requestMatchers("/api/*/test/public").permitAll()
                        .requestMatchers("/api/*/members/join/**").permitAll()
                        .requestMatchers("/api/*/members/temp-password/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/projects/**").permitAll() // 프로젝트 단건/다건 조회
                        .requestMatchers(HttpMethod.GET, "/api/v1/projects/*/applications/**").permitAll() // 지원서 단건/다건 조회

                        //인증된 사용자만 접근 가능
                        .requestMatchers("/api/*/test/auth").authenticated()
                        .requestMatchers("/api/*/test/auth/me").authenticated()
                        .requestMatchers("/api/*/members/password-update").authenticated()


                        //프리랜서만 접근 가능
                        .requestMatchers("/api/*/test/auth/freelancer").hasRole("FREELANCER")
                        .requestMatchers(HttpMethod.POST, "/api/v1/projects/*/applications").hasRole("FREELANCER") // 지원서 등록
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/projects/*/applications/**").hasRole("FREELANCER") // 지원서 삭제

                        //클라이언트만 접근 가능
                        .requestMatchers("/api/*/test/auth/client").hasRole("CLIENT")
                        .requestMatchers(HttpMethod.POST, "/api/*/projects").hasRole("CLIENT") // 프로젝트 등록
                        .requestMatchers(HttpMethod.DELETE, "/api/*/projects/**").hasRole("CLIENT") // 프로젝트 삭제
                        .requestMatchers(HttpMethod.PATCH, "/api/*/projects/**").hasRole("CLIENT") // 프로젝트 수정
                        .requestMatchers(HttpMethod.PATCH, "/api/v1/projects/*/applications/**").hasRole("CLIENT") // 지원서 수정 (클라이언트가 하는 기능!)

                        //관리자만 접근 가능
                        .requestMatchers("/api/*/test/auth/admin").hasRole("ADMIN")

                        //그 외 요청은 인증 필요없음
                        .anyRequest().permitAll()
                )

                // REST API용 Security 기본 기능 비활성화
                .csrf(AbstractHttpConfigurer::disable) // csrf 보호기능 비활성화
                .formLogin(AbstractHttpConfigurer::disable) // 기본 로그인 폼 비활성
                .logout(AbstractHttpConfigurer::disable) // 로그아웃 기능 비활성화
                .httpBasic(AbstractHttpConfigurer::disable) // HTTP Basic 인증 비활성화
                .sessionManagement(AbstractHttpConfigurer::disable) // 세션 관리 비활성화

                //jwt 인증 필터 추가
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)

                //인증/인가 예외 처리
                .exceptionHandling(
                exceptionHandling -> exceptionHandling
                        //인증 실패
                        .authenticationEntryPoint(
                                (request, response, authException) -> {
                                    response.setContentType("application/json;charset=UTF-8");

                                    response.setStatus(401);
                                    response.getWriter().write(
                                            JsonUtil.toString(
                                                    new ApiResponse<Void>(
                                                            "401-1",
                                                            "로그인 후 이용해주세요."
                                                    )
                                            )
                                    );
                                }
                        )
                        //권한 부족
                        .accessDeniedHandler(
                                (request, response, accessDeniedException) -> {
                                    response.setContentType("application/json;charset=UTF-8");

                                    response.setStatus(403);
                                    response.getWriter().write(
                                            JsonUtil.toString(
                                                    new ApiResponse<Void>(
                                                            "403-1",
                                                            "권한이 없습니다."
                                                    )
                                            )
                                    );
                                }
                        )
                );

        return http.build();
    }

    @Bean
    public UrlBasedCorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        //cors 설정
        configuration.setAllowedOrigins(List.of("http://localhost:3000")); // 허용할 출처(origin)
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE")); // 허용할 메서드
        configuration.setAllowCredentials(true); //인증 정보를 포함한 요청(쿠키, 헤더) 허용 여부
        configuration.setAllowedHeaders(List.of("*")); //허용할 헤더 (* → 모든 헤더 허용)

        //설정을 특정 경로 패턴에 적용
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", configuration);

        return source;
    }
}