package com.back.domain.member.member.service;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.beans.factory.annotation.Value;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class KakaoService {

    @Getter
    @Value("${social.kakao.client-id}")
    private String clientId;

    @Value("${social.kakao.client-secret}")
    private String clientSecret;

    @Getter
    @Value("${social.kakao.redirect-uri-link}")
    private String linkRedirectUri;

    @Getter
    @Value("${social.kakao.redirect-uri-login}")
    private String loginRedirectUri;


    private final RestTemplate restTemplate;


    // authorization code → access token
    // 로그인용
    public String getAccessTokenForLogin(String code) {
        return getAccessToken(code, loginRedirectUri);
    }

    // 링크용
    public String getAccessTokenForLink(String code) {
        return getAccessToken(code, linkRedirectUri);
    }

    // 공통 내부 메서드
    private String getAccessToken(String code, String redirectUri) {
        String url = "https://kauth.kakao.com/oauth/token";

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
            throw new RuntimeException("카카오 access token 발급 실패");
        }

        return (String) response.get("access_token");
    }

    // access token → providerId
    public String getUserId(String accessToken) {
        String url = "https://kapi.kakao.com/v2/user/me";

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);

        HttpEntity<Void> request = new HttpEntity<>(headers);
        Map<String, Object> response = restTemplate.exchange(url, HttpMethod.GET, request, Map.class).getBody();

        if (response == null || response.get("id") == null) {
            throw new RuntimeException("카카오 사용자 정보 조회 실패");
        }

        return String.valueOf(response.get("id"));
    }

    // code → providerId (로그인용)
    public String getUserIdFromLoginCode(String code) {
        String accessToken = getAccessTokenForLogin(code);
        return getUserId(accessToken);
    }

    // code → providerId (링크용)
    public String getUserIdFromLinkCode(String code) {
        String accessToken = getAccessTokenForLink(code);
        return getUserId(accessToken);
    }
}

