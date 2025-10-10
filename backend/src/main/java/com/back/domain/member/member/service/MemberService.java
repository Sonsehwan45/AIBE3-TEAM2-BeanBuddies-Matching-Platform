package com.back.domain.member.member.service;

import com.back.domain.client.client.entity.Client;
import com.back.domain.freelancer.freelancer.entity.Freelancer;
import com.back.domain.member.member.constant.Role;
import com.back.domain.member.member.entity.Member;
import com.back.domain.member.member.repository.MemberRepository;
import com.back.global.exception.ServiceException;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class MemberService {
    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public Member join(String role, String name, String username, String password, String passwordConfirm,
                       String email) {
        //이미 사용중인 아이디인지 확인
        memberRepository.findByUsername(username)
                .ifPresent(_member -> {
                    throw new ServiceException("409-1", "이미 존재하는 회원입니다.");
                });

        //비밀번호 확인
        if (!password.equals(passwordConfirm)) {
            throw new ServiceException("400-2", "비밀번호와 비밀번호 확인이 일치하지 않습니다.");
        }

        //비밀번호 암호화
        String encodedPassword = passwordEncoder.encode(password);

        //DTO -> ENTITY 변환
        Member member = new Member(role, name, username, encodedPassword, email);

        //회원 유형에 따른 엔티티 등록
        if (Role.isFreelancer(member)) {
            Freelancer freelancer = new Freelancer(member);
            member.registerFreelancer(freelancer);
        }
        if (Role.isClient(member)) {
            Client client = new Client(member);
            member.registerClient(client);
        }

        //DB 반영 후 반환
        return memberRepository.save(member);
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
}
