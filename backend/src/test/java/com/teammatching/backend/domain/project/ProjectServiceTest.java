package com.teammatching.backend.domain.project;

import com.teammatching.backend.TestRequestFactory;
import com.teammatching.backend.domain.application.ApplicationRepository;
import com.teammatching.backend.domain.profile.ProfileRepository;
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

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
class ProjectServiceTest {

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

    @BeforeEach
    void setUp() {
        applicationRepository.deleteAll();
        projectRepository.deleteAll();
        profileRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void createProjectCreatesRecruitingProjectForCurrentUser() {
        userService.signUp(TestRequestFactory.signUpRequest("leader@example.com", "password123", "leader"));

        ProjectResponse response = projectService.createProject(
                "leader@example.com",
                TestRequestFactory.projectCreateRequest("Team Matching", "Build MVP", "Spring,React"));

        assertThat(response.getId()).isNotNull();
        assertThat(response.getTitle()).isEqualTo("Team Matching");
        assertThat(response.getStatus()).isEqualTo(ProjectStatus.RECRUITING);
        assertThat(response.getLeaderName()).isEqualTo("leader");
    }

    @Test
    void updateProjectAllowsOnlyLeader() {
        userService.signUp(TestRequestFactory.signUpRequest("leader@example.com", "password123", "leader"));
        userService.signUp(TestRequestFactory.signUpRequest("other@example.com", "password123", "other"));
        ProjectResponse project = projectService.createProject(
                "leader@example.com",
                TestRequestFactory.projectCreateRequest("Original", "Original description", "Spring"));

        assertThatThrownBy(() -> projectService.updateProject(
                project.getId(),
                "other@example.com",
                TestRequestFactory.projectUpdateRequest("Updated", "Updated description", "Spring,React", ProjectStatus.RECRUITING)))
                .isInstanceOf(BusinessException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.FORBIDDEN_PROJECT_ACCESS);

        ProjectResponse updated = projectService.updateProject(
                project.getId(),
                "leader@example.com",
                TestRequestFactory.projectUpdateRequest("Updated", "Updated description", "Spring,React", ProjectStatus.COMPLETED));

        assertThat(updated.getTitle()).isEqualTo("Updated");
        assertThat(updated.getStatus()).isEqualTo(ProjectStatus.COMPLETED);
    }

    @Test
    void deleteProjectAllowsOnlyLeader() {
        userService.signUp(TestRequestFactory.signUpRequest("leader@example.com", "password123", "leader"));
        userService.signUp(TestRequestFactory.signUpRequest("other@example.com", "password123", "other"));
        ProjectResponse project = projectService.createProject(
                "leader@example.com",
                TestRequestFactory.projectCreateRequest("Delete me", "Description", "Spring"));

        assertThatThrownBy(() -> projectService.deleteProject(project.getId(), "other@example.com"))
                .isInstanceOf(BusinessException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.FORBIDDEN_PROJECT_ACCESS);

        projectService.deleteProject(project.getId(), "leader@example.com");

        assertThat(projectRepository.findById(project.getId())).isEmpty();
    }

    @Test
    void searchProjectsFiltersByTechStackKeywordAndStatus() {
        userService.signUp(TestRequestFactory.signUpRequest("leader@example.com", "password123", "leader"));
        projectService.createProject(
                "leader@example.com",
                TestRequestFactory.projectCreateRequest("Backend Study", "Spring boot team", "Spring,PostgreSQL"));
        ProjectResponse frontend = projectService.createProject(
                "leader@example.com",
                TestRequestFactory.projectCreateRequest("Frontend App", "React dashboard", "React,TypeScript"));
        projectService.updateProject(
                frontend.getId(),
                "leader@example.com",
                TestRequestFactory.projectUpdateRequest("Frontend App", "React dashboard", "React,TypeScript", ProjectStatus.COMPLETED));

        List<ProjectResponse> springResults = projectService.searchProjects("spring", null, ProjectStatus.RECRUITING);
        List<ProjectResponse> dashboardResults = projectService.searchProjects(null, "dashboard", ProjectStatus.COMPLETED);

        assertThat(springResults).extracting(ProjectResponse::getTitle).containsExactly("Backend Study");
        assertThat(dashboardResults).extracting(ProjectResponse::getTitle).containsExactly("Frontend App");
    }

    @Test
    void searchProjectsTreatsBlankConditionsAsNoFilter() {
        userService.signUp(TestRequestFactory.signUpRequest("leader@example.com", "password123", "leader"));
        projectService.createProject(
                "leader@example.com",
                TestRequestFactory.projectCreateRequest("Backend Study", "Spring boot team", "Spring"));
        projectService.createProject(
                "leader@example.com",
                TestRequestFactory.projectCreateRequest("Frontend App", "React dashboard", "React"));

        List<ProjectResponse> results = projectService.searchProjects("  ", "", null);

        assertThat(results).extracting(ProjectResponse::getTitle)
                .containsExactlyInAnyOrder("Backend Study", "Frontend App");
    }
}
