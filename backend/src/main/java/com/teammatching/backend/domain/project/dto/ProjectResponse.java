package com.teammatching.backend.domain.project.dto;

import com.teammatching.backend.domain.project.Project;
import com.teammatching.backend.domain.project.ProjectStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ProjectResponse {
    private Long id;
    private String title;
    private String description;
    private String techStack;
    private Integer recruitCount;
    private LocalDateTime deadline;
    private ProjectStatus status;
    private Long leaderId;
    private String leaderName;
    private LocalDateTime createdAt;

    public static ProjectResponse from(Project project) {
        return ProjectResponse.builder()
                .id(project.getId())
                .title(project.getTitle())
                .description(project.getDescription())
                .techStack(project.getTechStack())
                .recruitCount(project.getRecruitCount())
                .deadline(project.getDeadline())
                .status(project.getStatus())
                .leaderId(project.getLeader().getId())
                .leaderName(project.getLeader().getName())
                .createdAt(project.getCreatedAt())
                .build();
    }
}
