package com.back.domain.member.member.service;

import com.back.domain.application.application.entity.Application;
import com.back.domain.application.application.repository.ApplicationRepository;
import com.back.domain.client.client.entity.Client;
import com.back.domain.freelancer.freelancer.entity.Freelancer;
import com.back.domain.member.member.constant.ProfileScope;
import com.back.domain.member.member.constant.Role;
import com.back.domain.member.member.dto.ClientUpdateDto;
import com.back.domain.member.member.dto.FreelancerUpdateDto;
import com.back.domain.member.member.entity.Member;
import com.back.domain.member.member.repository.MemberRepository;
import com.back.global.exception.ServiceException;
import com.back.global.security.CustomUserDetails;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class MemberService {
    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final ApplicationRepository applicationRepository;

    private boolean initFlag = false;

    public void setInitFlag(boolean flag) {
        this.initFlag = flag;
    }

    @Transactional
    public Member join(String role, String name, String username, String password, String passwordConfirm,
                       String email) {
        //이메일 인증 확인
        if(!initFlag) {
            if (!emailService.isVerified("JOIN", email)) {
                throw new ServiceException("400-3", "이메일 인증이 완료되지 않았습니다.");
            }
        }

        //이미 사용중인 아이디인지 확인
        memberRepository.findByUsername(username)
                .ifPresent(_member -> {
                    throw new ServiceException("409-1", "이미 존재하는 회원입니다.");
                });

        //비밀번호 확인
        if (!password.equals(passwordConfirm)) {
            throw new ServiceException("400-4", "비밀번호와 비밀번호 확인이 일치하지 않습니다.");
        }

        //비밀번호 암호화
        String encodedPassword = passwordEncoder.encode(password);

        //DTO -> ENTITY 변환
        Member member = new Member(role, name, username, encodedPassword, email);

        //회원 유형에 따른 엔티티 등록
        if (member.isFreelancer()) {
            Freelancer freelancer = new Freelancer(member);
            member.registerFreelancer(freelancer);
        }
        if (member.isClient()) {
            Client client = new Client(member);
            member.registerClient(client);
        }

        //DB 반영 후 반환
        return memberRepository.save(member);
    }

    @Transactional
    public void updateFreelancerProfile(Member member, FreelancerUpdateDto dto) {
        if (member.getRole() != Role.FREELANCER || member.getFreelancer() == null) {
            throw new ServiceException("403-1", "프리랜서 회원만 프로필을 수정할 수 있습니다.");
        }
        // Update common fields
        if (dto.getName() != null) member.updateName(dto.getName());
        if (dto.getProfileImgUrl() != null) member.updateProfileImgUrl(dto.getProfileImgUrl());
        if (dto.getProfileScope() != null) member.updateProfileScope(dto.getProfileScope());

        Freelancer freelancer = member.getFreelancer();
        freelancer.updateInfo(dto.getJob(), dto.getFreelancerEmail(), dto.getComment(), dto.getCareer());
        // TODO: skills and interests update logic

        memberRepository.save(member);
    }

    @Transactional
    public void updateClientProfile(Member member, ClientUpdateDto dto) {
        if (member.getRole() != Role.CLIENT || member.getClient() == null) {
            throw new ServiceException("403-2", "클라이언트 회원만 프로필을 수정할 수 있습니다.");
        }
        // Update common fields
        if (dto.getName() != null) member.updateName(dto.getName());
        if (dto.getProfileImgUrl() != null) member.updateProfileImgUrl(dto.getProfileImgUrl());
        if (dto.getProfileScope() != null) member.updateProfileScope(dto.getProfileScope());

        Client client = member.getClient();
        client.update(dto.getCompanySize(), dto.getCompanyDescription(), dto.getRepresentative(), dto.getBusinessNo(), dto.getCompanyPhone(), dto.getCompanyEmail());

        memberRepository.save(member);
    }

    public Optional<Member> findByUsername(String username) {
        return memberRepository.findByUsername(username);
    }

    public long count() {
        return memberRepository.count();
    }

    public Member changeStatus(Member member, String status) {
        member.changeStatus(status);
        return member;
    }

    public void checkPassword(Member member, String password) {
        if(!passwordEncoder.matches(password, member.getPassword())) {
            throw new ServiceException("401-2", "비밀번호가 일치하지 않습니다.");
        }
    }

    public Member findById(Long id) {
        return memberRepository.findById(id).orElseThrow(() -> new ServiceException("404-1", "해당 회원을 찾을 수 없습니다."));
    }

    public void updatePassword(Member member, String currentPassword, String newPassword, String newPasswordConfirm) {
        if(!passwordEncoder.matches(currentPassword, member.getPassword())) {
            throw new ServiceException("401-3", "현재 비밀번호가 일치하지 않습니다.");
        }

        if(!newPassword.equals(newPasswordConfirm)) {
            throw new ServiceException("400-6", "새 비밀번호 확인이 일치하지 않습니다.");
        }

        member.updatePassword(passwordEncoder.encode(newPassword));
        memberRepository.save(member);
    }

    public void sendTempPasswordCode(String username, String email) {
        Member member = memberRepository.findByUsername(username)
                .orElseThrow(() -> new ServiceException("404-1", "해당 회원을 찾을 수 없습니다."));

        if(!member.getEmail().equals(email)) {
            throw new ServiceException("400-5", "이메일이 회원 정보와 일치하지 않습니다.");
        }

        emailService.sendEmailCode("TEMPPW", email);
    }

    public void issueTempPassword(String username, String email, String code) {

        Member member = memberRepository.findByUsername(username)
                .orElseThrow(() -> new ServiceException("404-1", "해당 회원이 존재하지 않습니다."));

        if(!member.getEmail().equals(email)) {
            throw new ServiceException("400-2", "이메일이 회원 정보와 일치하지 않습니다.");
        }

        // 코드 확인
        emailService.verifyEmailCode("TEMPPW", email, code);

        //임시 비밀번호 생성
        String tempPassword = generateTempPassword();

        //DB에 암호화해서 저장
        member.updatePassword(passwordEncoder.encode(tempPassword));
        memberRepository.save(member);

        // 이메일로 임시 비밀번호 전송
        emailService.sendEmailMessage(email, "임시 비밀번호 발급", tempPassword);
    }

    private String generateTempPassword() {
        int length = 10;
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        SecureRandom random = new SecureRandom();
        StringBuilder tempPassword = new StringBuilder(length);

        for(int i=0; i<length; i++) {
            int index = random.nextInt(chars.length());
            tempPassword.append(chars.charAt(index));
        }

        return tempPassword.toString();
    }

    public Member getProfile(Long userId, CustomUserDetails user) {
        Member member = findById(userId);

        if (member.getProfileScope() == ProfileScope.PUBLIC) {
            return member;
        }

        // 자신의 프로필은 항상 접근 가능
        if (user != null && Objects.equals(user.getId(), member.getId())) {
            return member;
        }

        // 프리랜서의 비공개 프로필 접근 제어
        if (member.isFreelancer()) {
            if (user == null) {
                throw new ServiceException("401-1", "로그인이 필요합니다.");
            }

            Member requestMember = findById(user.getId());
            if (requestMember.isClient()) {
                List<Application> applications = applicationRepository.findAllByFreelancer(member.getFreelancer());
                boolean hasApplied = applications.stream()
                        .anyMatch(app -> app.getProject().getClient().getMember().getId().equals(requestMember.getId()));

                if (hasApplied) {
                    return member;
                }
            }
        }

        throw new ServiceException("403-3", "프로필을 조회할 권한이 없습니다.");
    }
}
