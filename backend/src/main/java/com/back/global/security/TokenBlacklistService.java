package com.back.global.security;

import com.back.global.jwt.JwtProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
public class TokenBlacklistService {
    private final RedisTemplate<String, String> redisTemplate;
    private final JwtProvider jwtProvider;
    private static final String ACCESS_PREFIX = "BLACKLIST:ACCESS:";

    //로그아웃 시 블랙리스트 등록
    public void addBlacklistToken(String token) {
        long ttl = jwtProvider.getRemainingSeconds(token, true);
        redisTemplate.opsForValue().set(ACCESS_PREFIX + token, "true", ttl, TimeUnit.SECONDS);
    }

    //블랙리스트 확인
    public boolean isBlacklisted(String token) {
        return Boolean.TRUE.equals(redisTemplate.hasKey(ACCESS_PREFIX + token));
    }
}
