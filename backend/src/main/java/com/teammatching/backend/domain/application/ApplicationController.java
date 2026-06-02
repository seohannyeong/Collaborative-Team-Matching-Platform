package com.teammatching.backend.domain.application;

import com.teammatching.backend.domain.application.dto.ApplicationRequest;
import com.teammatching.backend.domain.application.dto.ApplicationResponse;
import com.teammatching.backend.domain.application.dto.ApplicationStatusUpdateRequest;
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
    public ResponseEntity<ApplicationResponse> applyProject(@PathVariable Long projectId,
                                                            Authentication authentication,
                                                            @Valid @RequestBody ApplicationRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(applicationService.applyProject(projectId, authentication.getName(), request));
    }

    @GetMapping("/projects/{projectId}/applications")
    public ResponseEntity<List<ApplicationResponse>> getApplications(@PathVariable Long projectId,
                                                                     Authentication authentication) {
        return ResponseEntity.ok(applicationService.getApplications(projectId, authentication.getName()));
    }

    @PatchMapping("/applications/{applicationId}")
    public ResponseEntity<ApplicationResponse> updateApplicationStatus(@PathVariable Long applicationId,
                                                                       Authentication authentication,
                                                                       @Valid @RequestBody ApplicationStatusUpdateRequest request) {
        return ResponseEntity.ok(applicationService.updateApplicationStatus(applicationId, authentication.getName(), request));
    }
}
