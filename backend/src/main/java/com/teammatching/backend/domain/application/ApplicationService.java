package com.teammatching.backend.domain.application;

import com.teammatching.backend.domain.application.dto.ApplicationRequest;
import com.teammatching.backend.domain.application.dto.ApplicationResponse;
import com.teammatching.backend.domain.application.dto.ApplicationStatusUpdateRequest;
import com.teammatching.backend.domain.project.Project;
import com.teammatching.backend.domain.project.ProjectRepository;
import com.teammatching.backend.domain.user.User;
import com.teammatching.backend.domain.user.UserRepository;
import com.teammatching.backend.global.exception.BusinessException;
import com.teammatching.backend.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    @Transactional
    public ApplicationResponse applyProject(Long projectId, String email, ApplicationRequest request) {
        User applicant = userRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new BusinessException(ErrorCode.PROJECT_NOT_FOUND));

        // 모집이 완료된 프로젝트인지 검증
        if (project.isLeader(email)) {
            throw new BusinessException(ErrorCode.SELF_APPLICATION_NOT_ALLOWED);
        }

        if (!project.isRecruiting(LocalDateTime.now())) {
            throw new BusinessException(ErrorCode.PROJECT_CLOSED);
        }

        // 중복 지원 방지 로직 (DB에서 이미 지원한 내역이 있는지 조회)
        if (applicationRepository.existsByApplicantAndProject(applicant, project)) {
            throw new BusinessException(ErrorCode.DUPLICATE_APPLICATION);
        }

        Application application = Application.builder()
                .applicant(applicant)
                .project(project)
                .message(request.getMessage())
                .status(ApplicationStatus.PENDING)
                .build();

        Application savedApplication = applicationRepository.save(application);
        return ApplicationResponse.from(savedApplication);
    }

    public List<ApplicationResponse> getApplications(Long projectId, String email) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new BusinessException(ErrorCode.PROJECT_NOT_FOUND));

        // 🌟 [확실한 수정] 현재 요청을 보낸 유저 객체를 식별합니다.
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        // 해당 프로젝트에 접수된 전체 지원서 목록을 가져옵니다.
        List<Application> applications = applicationRepository.findByProject(project);

        // 🌟 [핵심 보안 추가] 현재 로그인한 유저가 이 프로젝트에 승인(ACCEPTED)된 팀원인지 검증합니다.
        boolean isAcceptedMember = applications.stream()
                .anyMatch(app -> app.getApplicant().equals(user) && app.getStatus() == ApplicationStatus.ACCEPTED);

        // 🌟 [확실한 수정] 팀장도 아니고, 승인된 팀원도 아니라면 가차없이 접근을 차단합니다.
        if (!project.isLeader(email) && !isAcceptedMember) {
            throw new BusinessException(ErrorCode.FORBIDDEN_APPLICATION_ACCESS);
        }

        return applications.stream()
                .map(ApplicationResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public ApplicationResponse updateApplicationStatus(Long applicationId, String email, ApplicationStatusUpdateRequest request) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new BusinessException(ErrorCode.APPLICATION_NOT_FOUND));

        // 상태 변경(수락/거절)은 프로젝트 리더만 가능
        if (!application.getProject().isLeader(email)) {
            throw new BusinessException(ErrorCode.FORBIDDEN_APPLICATION_ACCESS);
        }

        if (!application.isPending() || request.getStatus() == ApplicationStatus.PENDING) {
            throw new BusinessException(ErrorCode.INVALID_APPLICATION_STATUS_TRANSITION);
        }

        application.updateStatus(request.getStatus());

        if (request.getStatus() == ApplicationStatus.ACCEPTED &&
                applicationRepository.countByProjectAndStatus(application.getProject(), ApplicationStatus.ACCEPTED)
                        >= application.getProject().getRecruitCount()) {
            application.getProject().complete();
        }

        return ApplicationResponse.from(application);
    }

    public List<ApplicationResponse> getMySentApplications(String email) {
        User applicant = userRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        return applicationRepository.findByApplicant(applicant).stream()
                .map(ApplicationResponse::from)
                .collect(Collectors.toList());
    }
}
