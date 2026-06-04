package com.teammatching.backend.domain.application;

import com.teammatching.backend.domain.application.dto.ApplicationRequest;
import com.teammatching.backend.domain.application.dto.ApplicationResponse;
import com.teammatching.backend.domain.application.dto.ApplicationStatusUpdateRequest;
import com.teammatching.backend.global.response.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class ApplicationController {

    private final ApplicationService applicationService;

    @PostMapping("/projects/{projectId}/apply")
    public ResponseEntity<ApiResponse<ApplicationResponse>> applyProject(@PathVariable Long projectId,
                                                                         Authentication authentication,
                                                                         @Valid @RequestBody ApplicationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(HttpStatus.CREATED.value(),
                        applicationService.applyProject(projectId, authentication.getName(), request),
                        "success"));
    }

    @GetMapping("/projects/{projectId}/applications")
    public ResponseEntity<ApiResponse<List<ApplicationResponse>>> getApplications(@PathVariable Long projectId,
                                                                                 Authentication authentication) {
        return ResponseEntity.ok(ApiResponse.success(applicationService.getApplications(projectId, authentication.getName())));
    }

    @PatchMapping("/applications/{applicationId}")
    public ResponseEntity<ApiResponse<ApplicationResponse>> updateApplicationStatus(@PathVariable Long applicationId,
                                                                                   Authentication authentication,
                                                                                   @Valid @RequestBody ApplicationStatusUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.success(applicationService.updateApplicationStatus(applicationId, authentication.getName(), request)));
    }
}
