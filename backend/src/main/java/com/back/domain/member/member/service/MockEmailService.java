package com.back.domain.member.member.service;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

@Service
@Profile("test")
public class MockEmailService implements EmailService {

    public void sendEmailMessage(String toEmail, String subject, String text) {
    }

    public void sendEmailCode(String purpose, String email) {
    }

    public void verifyEmailCode(String purpose, String email, String code) {
    }

    public boolean isVerified(String purpose, String email) {
        return true;
    }
}
