package com.teammatching.backend.domain.project;

import com.teammatching.backend.domain.project.dto.ProjectCreateRequest;
import com.teammatching.backend.domain.project.dto.ProjectResponse;
import com.teammatching.backend.domain.project.dto.ProjectUpdateRequest;
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
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;

    @Transactional
    public ProjectResponse createProject(String email, ProjectCreateRequest request) {
        User leader = userRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        Project project = Project.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .techStack(request.getTechStack())
                .recruitCount(request.getRecruitCount())
                .deadline(request.getDeadline())
                .status(ProjectStatus.RECRUITING)
                .leader(leader)
                .build();

        Project savedProject = projectRepository.save(project);
        return ProjectResponse.from(savedProject);
    }

    public List<ProjectResponse> getProjects() {
        return projectRepository.findAll().stream()
                .map(ProjectResponse::from)
                .collect(Collectors.toList());
    }

    public List<ProjectResponse> searchProjects(String techStack, String keyword, ProjectStatus status) {
        techStack = normalizeSearchCondition(techStack);
        keyword = normalizeSearchCondition(keyword);
        String statusStr = (status != null) ? status.name() : null;
        return projectRepository.searchProjects(techStack, statusStr, keyword).stream()
                .map(ProjectResponse::from)
                .collect(Collectors.toList());
    }

    public ProjectResponse getProject(Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new BusinessException(ErrorCode.PROJECT_NOT_FOUND));
        return ProjectResponse.from(project);
    }

    @Transactional
    public ProjectResponse updateProject(Long projectId, String email, ProjectUpdateRequest request) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new BusinessException(ErrorCode.PROJECT_NOT_FOUND));

        if (!project.isLeader(email)) {
            throw new BusinessException(ErrorCode.FORBIDDEN_PROJECT_ACCESS);
        }

        project.update(request.getTitle(), request.getDescription(), request.getTechStack(),
                request.getRecruitCount(), request.getDeadline(), request.getStatus());

        return ProjectResponse.from(project);
    }

    @Transactional
    public void deleteProject(Long projectId, String email) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new BusinessException(ErrorCode.PROJECT_NOT_FOUND));

        if (!project.isLeader(email)) {
            throw new BusinessException(ErrorCode.FORBIDDEN_PROJECT_ACCESS);
        }

        projectRepository.delete(project);
    }

    private String normalizeSearchCondition(String condition) {
        if (condition == null || condition.trim().isEmpty()) {
            return null;
        }
        return condition.trim();
    }
}
