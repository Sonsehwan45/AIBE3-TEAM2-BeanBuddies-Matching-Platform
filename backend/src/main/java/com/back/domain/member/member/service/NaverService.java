package com.back.domain.member.member.service;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class NaverService {

    private final RestTemplate restTemplate;

    @Getter
    @Value("${social.naver.client-id}")
    private String clientId;

    @Value("${social.naver.client-secret}")
    private String clientSecret;

    @Getter
    @Value("${social.naver.redirect-uri-login}")
    private String loginRedirectUri;

    @Getter
    @Value("${social.naver.redirect-uri-link}")
    private String linkRedirectUri;

    // 공통 AccessToken 요청
    private String getAccessToken(String code, String redirectUri) {
        String url = "https://nid.naver.com/oauth2.0/token";

        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("grant_type", "authorization_code");
        params.add("client_id", clientId);
        params.add("client_secret", clientSecret);
        params.add("redirect_uri", redirectUri);
        params.add("code", code);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);
        Map<String, Object> response = restTemplate.postForObject(url, request, Map.class);

        if (response == null || response.get("access_token") == null) {
            throw new RuntimeException("네이버 access token 발급 실패");
        }

        return (String) response.get("access_token");
    }

    public String getAccessTokenForLogin(String code) {
        return getAccessToken(code, loginRedirectUri);
    }

    public String getAccessTokenForLink(String code) {
        return getAccessToken(code, linkRedirectUri);
    }

    // access token → providerId (네이버는 "response.id"에 있음)
    public String getUserId(String accessToken) {
        String url = "https://openapi.naver.com/v1/nid/me";

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);

        HttpEntity<Void> request = new HttpEntity<>(headers);
        Map<String, Object> response = restTemplate.exchange(url, HttpMethod.GET, request, Map.class).getBody();

        if (response == null || response.get("response") == null) {
            throw new RuntimeException("네이버 사용자 정보 조회 실패");
        }

        Map<String, Object> resp = (Map<String, Object>) response.get("response");
        return String.valueOf(resp.get("id"));
    }

    // 로그인/연동용 메서드
    public String getUserIdFromLoginCode(String code) {
        String accessToken = getAccessTokenForLogin(code);
        return getUserId(accessToken);
    }

    public String getUserIdFromLinkCode(String code) {
        String accessToken = getAccessTokenForLink(code);
        return getUserId(accessToken);
    }
}
