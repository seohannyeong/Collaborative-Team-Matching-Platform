package com.teammatching.backend.domain.application;

import com.teammatching.backend.TestRequestFactory;
import com.teammatching.backend.domain.application.dto.ApplicationResponse;
import com.teammatching.backend.domain.profile.ProfileRepository;
import com.teammatching.backend.domain.project.ProjectRepository;
import com.teammatching.backend.domain.project.ProjectService;
import com.teammatching.backend.domain.project.ProjectStatus;
import com.teammatching.backend.domain.project.dto.ProjectResponse;
import com.teammatching.backend.domain.user.UserRepository;
import com.teammatching.backend.domain.user.UserService;
import com.teammatching.backend.global.exception.BusinessException;
import com.teammatching.backend.global.exception.ErrorCode;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;
import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
class ApplicationServiceTest {

    @Autowired
    private ApplicationService applicationService;

    @Autowired
    private ProjectService projectService;

    @Autowired
    private UserService userService;

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private ProfileRepository profileRepository;

    @Autowired
    private UserRepository userRepository;

    private ProjectResponse project;

    @BeforeEach
    void setUp() {
        applicationRepository.deleteAll();
        projectRepository.deleteAll();
        profileRepository.deleteAll();
        userRepository.deleteAll();

        userService.signUp(TestRequestFactory.signUpRequest("leader@example.com", "password123", "leader"));
        userService.signUp(TestRequestFactory.signUpRequest("applicant@example.com", "password123", "applicant"));
        userService.signUp(TestRequestFactory.signUpRequest("other@example.com", "password123", "other"));
        project = projectService.createProject(
                "leader@example.com",
                TestRequestFactory.projectCreateRequest("Project", "Description", "Spring,React"));
    }

    @Test
    void applyProjectCreatesPendingApplication() {
        ApplicationResponse response = applicationService.applyProject(
                project.getId(),
                "applicant@example.com",
                TestRequestFactory.applicationRequest("I want to join."));

        assertThat(response.getApplicationId()).isNotNull();
        assertThat(response.getApplicantEmail()).isEqualTo("applicant@example.com");
        assertThat(response.getStatus()).isEqualTo(ApplicationStatus.PENDING);
    }

    @Test
    void applyProjectRejectsDuplicateApplication() {
        applicationService.applyProject(
                project.getId(),
                "applicant@example.com",
                TestRequestFactory.applicationRequest("First message."));

        assertThatThrownBy(() -> applicationService.applyProject(
                project.getId(),
                "applicant@example.com",
                TestRequestFactory.applicationRequest("Second message.")))
                .isInstanceOf(BusinessException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.DUPLICATE_APPLICATION);
    }

    @Test
    void applyProjectRejectsCompletedProject() {
        projectService.updateProject(
                project.getId(),
                "leader@example.com",
                TestRequestFactory.projectUpdateRequest("Project", "Description", "Spring,React", ProjectStatus.COMPLETED));

        assertThatThrownBy(() -> applicationService.applyProject(
                project.getId(),
                "applicant@example.com",
                TestRequestFactory.applicationRequest("I want to join.")))
                .isInstanceOf(BusinessException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.PROJECT_CLOSED);
    }

    @Test
    void applyProjectRejectsOwnProject() {
        assertThatThrownBy(() -> applicationService.applyProject(
                project.getId(),
                "leader@example.com",
                TestRequestFactory.applicationRequest("I own this project.")))
                .isInstanceOf(BusinessException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.SELF_APPLICATION_NOT_ALLOWED);
    }

    @Test
    void applyProjectRejectsPastDeadlineProject() {
        ProjectResponse expiredProject = projectService.createProject(
                "leader@example.com",
                TestRequestFactory.projectCreateRequest(
                        "Expired Project",
                        "Deadline is over",
                        "Spring",
                        3,
                        LocalDateTime.now().minusDays(1)));

        assertThatThrownBy(() -> applicationService.applyProject(
                expiredProject.getId(),
                "applicant@example.com",
                TestRequestFactory.applicationRequest("I want to join.")))
                .isInstanceOf(BusinessException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.PROJECT_CLOSED);
    }

    @Test
    void getApplicationsAllowsOnlyProjectLeader() {
        applicationService.applyProject(
                project.getId(),
                "applicant@example.com",
                TestRequestFactory.applicationRequest("I want to join."));

        assertThatThrownBy(() -> applicationService.getApplications(project.getId(), "other@example.com"))
                .isInstanceOf(BusinessException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.FORBIDDEN_APPLICATION_ACCESS);

        List<ApplicationResponse> applications = applicationService.getApplications(project.getId(), "leader@example.com");

        assertThat(applications).hasSize(1);
        assertThat(applications.get(0).getApplicantEmail()).isEqualTo("applicant@example.com");
    }

    @Test
    void updateApplicationStatusAllowsOnlyProjectLeader() {
        ApplicationResponse application = applicationService.applyProject(
                project.getId(),
                "applicant@example.com",
                TestRequestFactory.applicationRequest("I want to join."));

        assertThatThrownBy(() -> applicationService.updateApplicationStatus(
                application.getApplicationId(),
                "other@example.com",
                TestRequestFactory.applicationStatusUpdateRequest(ApplicationStatus.ACCEPTED)))
                .isInstanceOf(BusinessException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.FORBIDDEN_APPLICATION_ACCESS);

        ApplicationResponse updated = applicationService.updateApplicationStatus(
                application.getApplicationId(),
                "leader@example.com",
                TestRequestFactory.applicationStatusUpdateRequest(ApplicationStatus.ACCEPTED));

        assertThat(updated.getStatus()).isEqualTo(ApplicationStatus.ACCEPTED);
    }

    @Test
    void updateApplicationStatusRejectsPendingOrAlreadyFinalStatus() {
        ApplicationResponse application = applicationService.applyProject(
                project.getId(),
                "applicant@example.com",
                TestRequestFactory.applicationRequest("I want to join."));

        assertThatThrownBy(() -> applicationService.updateApplicationStatus(
                application.getApplicationId(),
                "leader@example.com",
                TestRequestFactory.applicationStatusUpdateRequest(ApplicationStatus.PENDING)))
                .isInstanceOf(BusinessException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.INVALID_APPLICATION_STATUS_TRANSITION);

        applicationService.updateApplicationStatus(
                application.getApplicationId(),
                "leader@example.com",
                TestRequestFactory.applicationStatusUpdateRequest(ApplicationStatus.REJECTED));

        assertThatThrownBy(() -> applicationService.updateApplicationStatus(
                application.getApplicationId(),
                "leader@example.com",
                TestRequestFactory.applicationStatusUpdateRequest(ApplicationStatus.ACCEPTED)))
                .isInstanceOf(BusinessException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.INVALID_APPLICATION_STATUS_TRANSITION);
    }

    @Test
    void acceptingEnoughApplicantsCompletesProject() {
        ProjectResponse onePersonProject = projectService.createProject(
                "leader@example.com",
                TestRequestFactory.projectCreateRequest(
                        "One Person Project",
                        "Only one member needed",
                        "Spring",
                        1,
                        LocalDateTime.now().plusDays(7)));
        ApplicationResponse application = applicationService.applyProject(
                onePersonProject.getId(),
                "applicant@example.com",
                TestRequestFactory.applicationRequest("I want to join."));

        applicationService.updateApplicationStatus(
                application.getApplicationId(),
                "leader@example.com",
                TestRequestFactory.applicationStatusUpdateRequest(ApplicationStatus.ACCEPTED));

        assertThat(projectService.getProject(onePersonProject.getId()).getStatus())
                .isEqualTo(ProjectStatus.COMPLETED);
    }
}
