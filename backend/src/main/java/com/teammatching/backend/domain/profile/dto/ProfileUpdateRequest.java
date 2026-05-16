package com.teammatching.backend.domain.profile.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class ProfileUpdateRequest {
    
    private String interest;
    private String techStack;
    private String introduction;
    private String githubUrl;
    private String collaborationStyle;
}
