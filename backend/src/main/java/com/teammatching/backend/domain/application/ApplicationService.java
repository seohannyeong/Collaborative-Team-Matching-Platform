package com.teammatching.backend.domain.application;

import com.teammatching.backend.domain.application.dto.ApplicationRequest;
import com.teammatching.backend.domain.application.dto.ApplicationResponse;
import com.teammatching.backend.domain.application.dto.ApplicationStatusUpdateRequest;
import com.teammatching.backend.domain.project.Project;
import com.teammatching.backend.domain.project.ProjectRepository;
import com.teammatching.backend.domain.project.ProjectStatus;
import com.teammatching.backend.domain.user.User;
import com.teammatching.backend.domain.user.UserRepository;
import com.teammatching.backend.global.exception.BusinessException;
import com.teammatching.backend.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
        if (project.getStatus() == ProjectStatus.COMPLETED) {
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

        // 지원자 목록은 프로젝트 리더만 조회 가능
        if (!project.isLeader(email)) {
            throw new BusinessException(ErrorCode.FORBIDDEN_APPLICATION_ACCESS);
        }

        return applicationRepository.findByProject(project).stream()
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

        application.updateStatus(request.getStatus());

        return ApplicationResponse.from(application);
    }
}
