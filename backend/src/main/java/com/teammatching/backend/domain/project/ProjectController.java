package com.teammatching.backend.domain.project;

import com.teammatching.backend.domain.project.dto.ProjectCreateRequest;
import com.teammatching.backend.domain.project.dto.ProjectResponse;
import com.teammatching.backend.domain.project.dto.ProjectUpdateRequest;
import com.teammatching.backend.global.response.ApiResponse;
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
@CrossOrigin(origins = "http://localhost:3000")
public class ProjectController {

    private final ProjectService projectService;

    @PostMapping
    public ResponseEntity<ApiResponse<ProjectResponse>> createProject(Authentication authentication,
                                                                      @Valid @RequestBody ProjectCreateRequest request) {
        ProjectResponse response = projectService.createProject(authentication.getName(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(HttpStatus.CREATED.value(), response, "success"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProjectResponse>>> getProjects() {
        return ResponseEntity.ok(ApiResponse.success(projectService.getProjects()));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<ProjectResponse>>> searchProjects(
            @RequestParam(required = false) String techStack,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) ProjectStatus status) {
        return ResponseEntity.ok(ApiResponse.success(projectService.searchProjects(techStack, keyword, status)));
    }

    @GetMapping("/{projectId}")
    public ResponseEntity<ApiResponse<ProjectResponse>> getProject(@PathVariable Long projectId) {
        return ResponseEntity.ok(ApiResponse.success(projectService.getProject(projectId)));
    }

    @PutMapping("/{projectId}")
    public ResponseEntity<ApiResponse<ProjectResponse>> updateProject(@PathVariable Long projectId,
                                                                      Authentication authentication,
                                                                      @Valid @RequestBody ProjectUpdateRequest request) {
        return ResponseEntity.ok(ApiResponse.success(projectService.updateProject(projectId, authentication.getName(), request)));
    }

    @DeleteMapping("/{projectId}")
    public ResponseEntity<ApiResponse<Void>> deleteProject(@PathVariable Long projectId,
                                                           Authentication authentication) {
        projectService.deleteProject(projectId, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success(null, "Project deleted successfully"));
    }
}
