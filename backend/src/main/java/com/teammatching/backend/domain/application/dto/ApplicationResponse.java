package com.teammatching.backend.domain.application.dto;

import com.teammatching.backend.domain.application.Application;
import com.teammatching.backend.domain.application.ApplicationStatus;
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class ApplicationResponse {
    private Long applicationId;
    private Long applicantId;
    private String applicantName;
    private String applicantEmail;
    private String message;
    private ApplicationStatus status;
    private LocalDateTime createdAt;

    public static ApplicationResponse from(Application application) {
        return ApplicationResponse.builder()
                .applicationId(application.getId())
                .applicantId(application.getApplicant().getId())
                .applicantName(application.getApplicant().getName())
                .applicantEmail(application.getApplicant().getEmail())
                .message(application.getMessage())
                .status(application.getStatus())
                .createdAt(application.getCreatedAt())
                .build();
    }
}
