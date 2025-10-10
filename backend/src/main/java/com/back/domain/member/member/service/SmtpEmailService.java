package com.back.domain.member.member.service;

import com.back.global.exception.ServiceException;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
@Profile("dev")
@RequiredArgsConstructor
public class SmtpEmailService implements EmailService {

    private final JavaMailSender mailSender;
    private final RedisTemplate<String, String> redisTemplate;

    private static final String CODE_PREFIX = "EMAIL_AUTH_CODE:";
    private static final String VERIFIED_PREFIX = "EMAIL_AUTH_VERIFIED:";

    public void sendEmailMessage(String toEmail, String subject, String text) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(toEmail);
        message.setSubject(subject);
        message.setText(text);
        mailSender.send(message);
    }

    public void sendEmailCode(String purpose, String email) {
        //랜덤 인증 코드 생성
        String code = String.format("%06d", (int) (Math.random() * 1_000_000));

        //Redis에 저장 (3분 유효)
        redisTemplate.opsForValue().set(CODE_PREFIX + purpose + ":" + email, code, Duration.ofMinutes(3));

        //이메일 전송
        sendEmailMessage(
                email,
                purpose + " 인증 코드",
                "인증 코드: " + code + "\n유효시간: 3분"
        );
    }

    public void verifyEmailCode(String purpose, String email, String code) {
        String savedCode = redisTemplate.opsForValue().get(CODE_PREFIX + purpose + ":" + email);

        if(savedCode == null) {
            throw new ServiceException("404-1", "인증 코드가 만료되었거나 존재하지 않습니다.");
        }
        if(!savedCode.equals(code)) {
            throw new ServiceException("400-2", "인증 코드가 일치하지 않습니다.");
        }

        //인증 성공 표시(10분 간)
        redisTemplate.opsForValue().set(VERIFIED_PREFIX + purpose + ":" + email, code, Duration.ofMinutes(10));

        //인증 코드 삭제
        redisTemplate.delete(CODE_PREFIX + purpose + ":" + email);

    }

    public boolean isVerified(String purpose, String email) {
        // 인증 성공 여부 확인
        return redisTemplate.hasKey(VERIFIED_PREFIX + purpose + ":" + email);
    }
}
