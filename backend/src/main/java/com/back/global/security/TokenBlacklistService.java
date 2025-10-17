package com.back.global.security;

import com.back.global.jwt.JwtProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataAccessException;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
@RequiredArgsConstructor
@Slf4j
public class TokenBlacklistService {
    private final RedisTemplate<String, String> redisTemplate;
    private final JwtProvider jwtProvider;
    private static final String ACCESS_PREFIX = "BLACKLIST:ACCESS:";

    //로그아웃 시 블랙리스트 등록
    public void addBlacklistToken(String token) {
        try {
            long ttl = jwtProvider.getRemainingSeconds(token, true);
            if (ttl <= 0) return; // 이미 만료된 토큰은 등록 불필요
            redisTemplate.opsForValue().set(ACCESS_PREFIX + token, "true", ttl, TimeUnit.SECONDS);
        } catch (DataAccessException | IllegalStateException e) {
            // Redis 미연결/미설정 시에도 전체 요청이 실패하지 않도록 방어
            log.warn("Redis unavailable while adding blacklist token. Proceeding without blacklist. cause={}", e.getMessage());
        } catch (Exception e) {
            log.warn("Unexpected error adding token to blacklist: {}", e.toString());
        }
    }

    //블랙리스트 확인
    public boolean isBlacklisted(String token) {
        try {
            return Boolean.TRUE.equals(redisTemplate.hasKey(ACCESS_PREFIX + token));
        } catch (DataAccessException | IllegalStateException e) {
            // Redis 가용하지 않으면 블랙리스트 미적용(보수적 허용)
            log.warn("Redis unavailable while checking blacklist. Treating as not blacklisted. cause={}", e.getMessage());
            return false;
        } catch (Exception e) {
            log.warn("Unexpected error checking token blacklist: {}", e.toString());
            return false;
        }
    }
}
