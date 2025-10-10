package com.back.domain.member.member.service;

public interface EmailServiceInterface {
    void sendEmailMessage(String toEmail, String subject, String text);
    void sendEmailCode(String purpose, String email);
    void verifyEmailCode(String purpose, String email, String code);
    boolean isVerified(String purpose, String email);
}
