package com.teammatching.backend;

import com.teammatching.backend.domain.application.ApplicationStatus;
import com.teammatching.backend.domain.application.dto.ApplicationRequest;
import com.teammatching.backend.domain.application.dto.ApplicationStatusUpdateRequest;
import com.teammatching.backend.domain.project.ProjectStatus;
import com.teammatching.backend.domain.project.dto.ProjectCreateRequest;
import com.teammatching.backend.domain.project.dto.ProjectUpdateRequest;
import com.teammatching.backend.domain.user.dto.LoginRequest;
import com.teammatching.backend.domain.user.dto.SignUpRequest;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;

public final class TestRequestFactory {

    private TestRequestFactory() {
    }

    public static SignUpRequest signUpRequest(String email, String password, String name) {
        return new SignUpRequest(email, password, name);
    }

    public static LoginRequest loginRequest(String email, String password) {
        LoginRequest request = new LoginRequest();
        ReflectionTestUtils.setField(request, "email", email);
        ReflectionTestUtils.setField(request, "password", password);
        return request;
    }

    public static ProjectCreateRequest projectCreateRequest(String title, String description, String techStack) {
        ProjectCreateRequest request = new ProjectCreateRequest();
        ReflectionTestUtils.setField(request, "title", title);
        ReflectionTestUtils.setField(request, "description", description);
        ReflectionTestUtils.setField(request, "techStack", techStack);
        ReflectionTestUtils.setField(request, "recruitCount", 3);
        ReflectionTestUtils.setField(request, "deadline", LocalDateTime.now().plusDays(7));
        return request;
    }

    public static ProjectUpdateRequest projectUpdateRequest(String title, String description, String techStack,
                                                            ProjectStatus status) {
        ProjectUpdateRequest request = new ProjectUpdateRequest();
        ReflectionTestUtils.setField(request, "title", title);
        ReflectionTestUtils.setField(request, "description", description);
        ReflectionTestUtils.setField(request, "techStack", techStack);
        ReflectionTestUtils.setField(request, "recruitCount", 4);
        ReflectionTestUtils.setField(request, "deadline", LocalDateTime.now().plusDays(14));
        ReflectionTestUtils.setField(request, "status", status);
        return request;
    }

    public static ApplicationRequest applicationRequest(String message) {
        ApplicationRequest request = new ApplicationRequest();
        ReflectionTestUtils.setField(request, "message", message);
        return request;
    }

    public static ApplicationStatusUpdateRequest applicationStatusUpdateRequest(ApplicationStatus status) {
        ApplicationStatusUpdateRequest request = new ApplicationStatusUpdateRequest();
        ReflectionTestUtils.setField(request, "status", status);
        return request;
    }
}
