package com.teammatching.backend.domain.project;

import com.teammatching.backend.domain.project.dto.ProjectCreateRequest;
import com.teammatching.backend.domain.project.dto.ProjectResponse;
import com.teammatching.backend.domain.project.dto.ProjectUpdateRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectService projectService;

    @PostMapping
    public ResponseEntity<ProjectResponse> createProject(Authentication authentication,
                                                         @Valid @RequestBody ProjectCreateRequest request) {
        ProjectResponse response = projectService.createProject(authentication.getName(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<ProjectResponse>> getProjects() {
        return ResponseEntity.ok(projectService.getProjects());
    }

    @GetMapping("/{projectId}")
    public ResponseEntity<ProjectResponse> getProject(@PathVariable Long projectId) {
        return ResponseEntity.ok(projectService.getProject(projectId));
    }

    @PutMapping("/{projectId}")
    public ResponseEntity<ProjectResponse> updateProject(@PathVariable Long projectId,
                                                         Authentication authentication,
                                                         @Valid @RequestBody ProjectUpdateRequest request) {
        return ResponseEntity.ok(projectService.updateProject(projectId, authentication.getName(), request));
    }

    @DeleteMapping("/{projectId}")
    public ResponseEntity<Void> deleteProject(@PathVariable Long projectId,
                                              Authentication authentication) {
        projectService.deleteProject(projectId, authentication.getName());
        return ResponseEntity.noContent().build();
    }
}