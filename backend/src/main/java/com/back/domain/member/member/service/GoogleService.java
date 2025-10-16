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
public class GoogleService {

    @Getter
    @Value("${social.google.client-id}")
    private String clientId;

    @Value("${social.google.client-secret}")
    private String clientSecret;

    @Getter
    @Value("${social.google.redirect-uri-login}")
    private String loginRedirectUri;

    @Getter
    @Value("${social.google.redirect-uri-link}")
    private String linkRedirectUri;

    private final RestTemplate restTemplate;

    // code → access token
    private String getAccessToken(String code, String redirectUri) {
        String url = "https://oauth2.googleapis.com/token";

        MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
        params.add("code", code);
        params.add("client_id", clientId);
        params.add("client_secret", clientSecret);
        params.add("redirect_uri", redirectUri);
        params.add("grant_type", "authorization_code");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(params, headers);
        Map<String, Object> response = restTemplate.postForObject(url, request, Map.class);

        if (response == null || response.get("access_token") == null) {
            throw new RuntimeException("구글 access token 발급 실패");
        }

        return (String) response.get("access_token");
    }

    public String getAccessTokenForLogin(String code) {
        return getAccessToken(code, loginRedirectUri);
    }

    public String getAccessTokenForLink(String code) {
        return getAccessToken(code, linkRedirectUri);
    }

    // access token → providerId (구글 계정 고유 ID)
    public String getUserId(String accessToken) {
        String url = "https://www.googleapis.com/oauth2/v2/userinfo";

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);

        HttpEntity<Void> request = new HttpEntity<>(headers);
        Map<String, Object> response = restTemplate.exchange(url, HttpMethod.GET, request, Map.class).getBody();

        if (response == null || response.get("id") == null) {
            throw new RuntimeException("구글 사용자 정보 조회 실패");
        }

        return (String) response.get("id");
    }

    public String getUserIdFromLoginCode(String code) {
        String accessToken = getAccessTokenForLogin(code);
        return getUserId(accessToken);
    }

    public String getUserIdFromLinkCode(String code) {
        String accessToken = getAccessTokenForLink(code);
        return getUserId(accessToken);
    }
}
