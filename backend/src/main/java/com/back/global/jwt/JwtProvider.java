package com.back.global.jwt;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;
import java.util.Map;

@Component
public class JwtProvider {

    private final String accessSecret;
    private final long accessExpireMillis;

    private final String refreshSecret;
    private final long refreshExpireMillis;

    public JwtProvider(
            @Value("${custom.jwt.accessToken.secretKey}") String accessSecret,
            @Value("${custom.jwt.accessToken.expireSeconds}") long accessExpireSeconds,
            @Value("${custom.jwt.refreshToken.secretKey}") String refreshSecret,
            @Value("${custom.jwt.refreshToken.expireSeconds}") long refreshExpireSeconds
    ) {
        this.accessSecret = accessSecret;
        this.accessExpireMillis = accessExpireSeconds * 1000L;
        this.refreshSecret = refreshSecret;
        this.refreshExpireMillis = refreshExpireSeconds * 1000L;
    }

    // Key 가져오는 helper
    private Key getKey(boolean isAccessToken) {
        String secret = isAccessToken ? accessSecret : refreshSecret;
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    // AccessToken 생성
    public String genAccessToken(Map<String, Object> claims) {
        Date issuedAt = new Date();
        Date expiration = new Date(issuedAt.getTime() + accessExpireMillis);

        return Jwts.builder()
                .setClaims(claims)
                .setIssuedAt(issuedAt)
                .setExpiration(expiration)
                .signWith(getKey(true))
                .compact();
    }

    // RefreshToken 생성
    public String genRefreshToken(Map<String, Object> claims) {
        Date issuedAt = new Date();
        Date expiration = new Date(issuedAt.getTime() + refreshExpireMillis);

        return Jwts.builder()
                .setClaims(claims)
                .setIssuedAt(issuedAt)
                .setExpiration(expiration)
                .signWith(getKey(false))
                .compact();
    }

    // Claims 추출
    public Claims getClaims(String token, boolean isAccessToken) {
        try {
            return Jwts.parser()
                    .setSigningKey(getKey(isAccessToken))  // Key 타입 필요
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
        } catch (Exception e) {
            return null; // 만료, 변조 등 실패 시 null
        }
    }

    // 토큰 유효성 검증
    public boolean validateToken(String token, boolean isAccessToken) {
        try {
            Jwts.parser()
                    .setSigningKey(getKey(isAccessToken))
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    //남은 만료 시간
    public long getRemainingSeconds(String token, boolean isAccessToken) {
        Claims claims = getClaims(token, isAccessToken);
        if(claims == null) return 0;
        long remainingMillis = claims.getExpiration().getTime() - new Date().getTime();
        return remainingMillis / 1000;
    }
}