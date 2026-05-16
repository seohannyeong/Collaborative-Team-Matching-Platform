package com.teammatching.backend.domain.profile.dto;

import com.teammatching.backend.domain.profile.Profile;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ProfileResponse {
    private Long id;
    private Long userId;
    private String email;
    private String name;
    private String interest;
    private String techStack;
    private String introduction;
    private String githubUrl;
    private String collaborationStyle;

    public static ProfileResponse from(Profile profile) {
        return ProfileResponse.builder()
                .id(profile.getId())
                .userId(profile.getUser().getId())
                .email(profile.getUser().getEmail())
                .name(profile.getUser().getName())
                .interest(profile.getInterest())
                .techStack(profile.getTechStack())
                .introduction(profile.getIntroduction())
                .githubUrl(profile.getGithubUrl())
                .collaborationStyle(profile.getCollaborationStyle())
                .build();
    }
}
