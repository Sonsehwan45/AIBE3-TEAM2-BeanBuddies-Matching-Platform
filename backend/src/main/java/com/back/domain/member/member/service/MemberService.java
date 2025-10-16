package com.back.domain.member.member.service;

import com.back.domain.application.application.constant.ApplicationStatus;
import com.back.domain.application.application.entity.Application;
import com.back.domain.application.application.service.ApplicationService;
import com.back.domain.client.client.entity.Client;
import com.back.domain.freelancer.freelancer.entity.Freelancer;
import com.back.domain.member.member.constant.ProfileScope;
import com.back.domain.member.member.constant.Role;
import com.back.domain.member.member.dto.ClientUpdateDto;
import com.back.domain.member.member.dto.FreelancerUpdateDto;
import com.back.domain.member.member.entity.Member;
import com.back.domain.member.member.repository.MemberRepository;
import com.back.domain.project.project.constant.ProjectStatus;
import com.back.domain.project.project.entity.Project;
import com.back.domain.project.project.service.ProjectService;
import com.back.domain.proposal.proposal.constant.ProposalStatus;
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
    private final ApplicationService applicationService;
    private final ProjectService projectService;

    private boolean initFlag = false;

    public void setInitFlag(boolean flag) {
        this.initFlag = flag;
    }

    @Transactional
    public Member join(String profileImgUrl, String role, String name, String username, String password, String passwordConfirm,
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
        Member member = new Member(profileImgUrl, role, name, username, encodedPassword, email);

        //회원 유형에 따른 엔티티 등록
        if (member.isFreelancer()) {
            Freelancer freelancer = new Freelancer(member);
            member.registerFreelancer(freelancer);
        }
        if (member.isClient()) {
            Client client = new Client(member);
            member.registerClient(client);
        }

        //Redis에서 인증 정보 삭제
        emailService.clearVerification("JOIN", email);

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
        if (dto.getEmail() != null) member.updateEmail(dto.getEmail());
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
        if (dto.getEmail() != null) member.updateEmail(dto.getEmail());
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
            throw new ServiceException("400-4", "새 비밀번호와 비밀번호 확인이 일치하지 않습니다.");
        }

        member.updatePassword(passwordEncoder.encode(newPassword));
        memberRepository.save(member);
    }

    public void sendPasswordResetCode(String username, String email) {
        Member member = memberRepository.findByUsername(username)
                .orElseThrow(() -> new ServiceException("404-1", "해당 회원을 찾을 수 없습니다."));

        if(!member.getEmail().equals(email)) {
            throw new ServiceException("400-5", "이메일이 회원 정보와 일치하지 않습니다.");
        }

        emailService.sendEmailCode("PWRESET", email);
    }

    public void verifyPasswordResetCode(String username, String email, String code) {
        Member member = memberRepository.findByUsername(username)
                .orElseThrow(() -> new ServiceException("404-1", "해당 회원이 존재하지 않습니다."));

        if(!member.getEmail().equals(email)) {
            throw new ServiceException("400-2", "이메일이 회원 정보와 일치하지 않습니다.");
        }

        // 코드 확인
        emailService.verifyEmailCode("PWRESET", email, code);
    }

    public void resetPassword(String username, String email, String password, String passwordConfirm) {
        //username 확인
        Member member = findByUsername(username).orElseThrow(() -> new ServiceException("404-1", "해당 회원이 존재하지 않습니다."));

        //이메일 확인
        if(!member.getEmail().equals(email)) {
            throw new ServiceException("400-5", "이메일이 회원 정보와 일치하지 않습니다.");
        }
        
        //email 인증이 되었는지 확인
        if (!emailService.isVerified("PWRESET", email)) {
            throw new ServiceException("400-3", "이메일 인증이 완료되지 않았습니다.");
        }

        //비밀번호 확인
        if (!password.equals(passwordConfirm)) {
            throw new ServiceException("400-4", "비밀번호와 비밀번호 확인이 일치하지 않습니다.");
        }

        //DB에 저장
        member.updatePassword(passwordEncoder.encode(password));
        memberRepository.save(member);
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

    @Transactional(readOnly = true)
    public Member getProfile(Long userId, CustomUserDetails user) {
        Member member = findById(userId);

        if (member.getProfileScope() == ProfileScope.PUBLIC) {
            // initialize associations for DTO serialization outside transaction
            if (member.isClient() && member.getClient() != null) {
                member.getClient().getCompanyEmail();
                member.getClient().getCompanyPhone();
                member.getClient().getCompanySize();
                member.getClient().getCompanyDescription();
                member.getClient().getRepresentative();
                member.getClient().getBusinessNo();
                member.getClient().getProjects().size();
            }
            if (member.isFreelancer() && member.getFreelancer() != null) {
                member.getFreelancer().getJob();
                member.getFreelancer().getCareer();
                member.getFreelancer().getFreelancerEmail();
                member.getFreelancer().getComment();
                member.getFreelancer().getRatingAvg();
                if (member.getFreelancer().getSkills() != null) {
                    member.getFreelancer().getSkills().forEach(fs -> {
                        if (fs.getSkill() != null) fs.getSkill().getName();
                    });
                }
                if (member.getFreelancer().getInterests() != null) {
                    member.getFreelancer().getInterests().forEach(fi -> {
                        if (fi.getInterest() != null) fi.getInterest().getName();
                    });
                }
            }
            return member;
        }

        // 자신의 프로필은 항상 접근 가능
        if (user != null && Objects.equals(user.getId(), member.getId())) {
            // initialize associations similarly
            if (member.isClient() && member.getClient() != null) {
                member.getClient().getCompanyEmail();
                member.getClient().getCompanyPhone();
                member.getClient().getCompanySize();
                member.getClient().getCompanyDescription();
                member.getClient().getRepresentative();
                member.getClient().getBusinessNo();
                member.getClient().getProjects().size();
            }
            if (member.isFreelancer() && member.getFreelancer() != null) {
                member.getFreelancer().getJob();
                member.getFreelancer().getCareer();
                member.getFreelancer().getFreelancerEmail();
                member.getFreelancer().getComment();
                member.getFreelancer().getRatingAvg();
                if (member.getFreelancer().getSkills() != null) {
                    member.getFreelancer().getSkills().forEach(fs -> {
                        if (fs.getSkill() != null) fs.getSkill().getName();
                    });
                }
                if (member.getFreelancer().getInterests() != null) {
                    member.getFreelancer().getInterests().forEach(fi -> {
                        if (fi.getInterest() != null) fi.getInterest().getName();
                    });
                }
            }
            return member;
        }

        // 프리랜서의 비공개 프로필 접근 제어
        if (member.isFreelancer()) {
            if (user == null) {
                throw new ServiceException("401-1", "로그인이 필요합니다.");
            }

            Member requestMember = findById(user.getId());
            if (requestMember.isClient()) {
                List<Application> applications = applicationService.findAllByFreeLancer(member.getFreelancer());
                boolean hasApplied = applications.stream()
                        .anyMatch(app -> app.getProject().getClient().getMember().getId().equals(requestMember.getId()));

                if (hasApplied) {
                    // initialize associations before returning
                    if (member.isClient() && member.getClient() != null) {
                        member.getClient().getCompanyEmail();
                        member.getClient().getCompanyPhone();
                        member.getClient().getCompanySize();
                        member.getClient().getCompanyDescription();
                        member.getClient().getRepresentative();
                        member.getClient().getBusinessNo();
                        member.getClient().getProjects().size();
                    }
                    if (member.isFreelancer() && member.getFreelancer() != null) {
                        member.getFreelancer().getJob();
                        member.getFreelancer().getCareer();
                        member.getFreelancer().getFreelancerEmail();
                        member.getFreelancer().getComment();
                        member.getFreelancer().getRatingAvg();
                        if (member.getFreelancer().getSkills() != null) {
                            member.getFreelancer().getSkills().forEach(fs -> {
                                if (fs.getSkill() != null) fs.getSkill().getName();
                            });
                        }
                        if (member.getFreelancer().getInterests() != null) {
                            member.getFreelancer().getInterests().forEach(fi -> {
                                if (fi.getInterest() != null) fi.getInterest().getName();
                            });
                        }
                    }
                    return member;
                }
            }
        }

        throw new ServiceException("403-3", "프로필을 조회할 권한이 없습니다.");
    }

    public void withdrawMember(Member member, String password) {
        //비밀번호 확인
        checkPassword(member, password);

        //프리랜서 탈퇴 조건 확인
        if(member.isFreelancer() && member.getFreelancer() != null) {
            Freelancer freelancer = member.getFreelancer();

            // 참여 중인 프로젝트 있는지 확인
            boolean hasOngoingProjects = freelancer.getApplications().stream()
                    .anyMatch(app -> app.getStatus() == ApplicationStatus.ACCEPT && //지원서가 수락 상태고
                            (app.getProject().getStatus() == ProjectStatus.IN_PROGRESS //프로젝트가 진행
                                    || app.getProject().getStatus() == ProjectStatus.COMPLETED)); //혹은 완료 상태면 참여 중이라고 판단

            // 참여 중인 프로젝트가 있다면
            if (hasOngoingProjects) {
                throw new ServiceException("400-2", "참여 중인 프로젝트가 있어 탈퇴할 수 없습니다.");
            }

            // 지원서 WAIT 상태인 거 삭제, 제안서 WAIT 상태인 거 DENIED
            freelancer.getApplications().removeIf(app -> app.getStatus() == ApplicationStatus.WAIT);
            freelancer.getProposals().forEach(proposal -> {
                if (proposal.getStatus() == ProposalStatus.WAIT) {
                    proposal.updateStatus(ProposalStatus.DENIED);
                }
            });
        }

        //클라이언트 탈퇴 조건 확인
        if(member.isClient() && member.getClient() != null) {
            Client client = member.getClient();

            //진행 중인 프로젝트 있는 지 확인
            boolean hasOngoingProjects = client.getProjects().stream()
                    .anyMatch(project -> project.getStatus() == ProjectStatus.IN_PROGRESS //프로젝트가 진행 중
                            || project.getStatus() == ProjectStatus.COMPLETED); //혹은 완료 상태면 진행 중인 걸로 판단

            if(hasOngoingProjects) {
                throw new ServiceException("400-3", "진행 중인 프로젝트가 있어 탈퇴할 수 없습니다.");
            }

            // 오픈 중인 프로젝트 CLOSED 처리
            client.getProjects().forEach(project -> {
                if(project.getStatus() == ProjectStatus.OPEN) {
                    project.updateStatus(ProjectStatus.CLOSED);
                }
            });

            // 지원서 WAIT 상태인 거 DENIED, 제안서 WAIT 상태인 거 삭제
            client.getProjects().forEach(project -> {
                project.getApplications().forEach(app -> {
                    if(app.getStatus() == ApplicationStatus.WAIT) {
                        app.modifyStatus(ApplicationStatus.DENIED);
                    }
                });
                project.getProposals().removeIf(proposal -> proposal.getStatus() == ProposalStatus.WAIT);
            });
        }

        // 회원 비식별화
        member.withdraw();

        //DB 저장
        memberRepository.save(member);
    }

    //완료된 프로젝트의 협업 상대방 프로필 조회
    @Transactional(readOnly = true)
    public Member getCollaboratorProfile(Long projectId, Member currentUser){
        //프로젝트 정보 조회
        Project project = projectService.findById(projectId);

        //프로젝트가 완료 상태인지 확인
        if(project.getStatus() != ProjectStatus.COMPLETED){
            throw new ServiceException("400", "완료된 프로젝트에 대해서만 협업 상대방을 조회할 수 있습니다");
        }

        //프로젝트에 수락된 지원서 조회
        Application acceptedApplication = applicationService.findByProjectAndStatus(project, ApplicationStatus.ACCEPT)
                .orElseThrow(() -> new ServiceException("404", "프로젝트에 매칭된 프리랜서 정보를 찾을 수 없습니다."));

        Freelancer freelancer = acceptedApplication.getFreelancer();
        Client client = acceptedApplication.getClient();

        //현재 로그인한 유저의 역할에 따라 상대방 Member 객체 반환
        if(currentUser.isFreelancer() && currentUser.getId().equals(freelancer.getId())){
            // 로그인한 유저가 이 프로젝트를 수행한 프리랜서가 맞다면, 클라이언트 정보를 반환
            return client.getMember();
        }
        else if (currentUser.isClient() && currentUser.getId().equals(client.getId())) {
            // 로그인한 유저가 이 프로젝트를 등록한 클라이언트가 맞다면, 프리랜서 정보를 반환
            return freelancer.getMember();
        }
        else {
            // 둘 다 아니라면 권한 없음
            throw new ServiceException("403", "해당 프로젝트의 협업 상대방 정보를 조회할 권한이 없습니다.");
        }
    }
}
