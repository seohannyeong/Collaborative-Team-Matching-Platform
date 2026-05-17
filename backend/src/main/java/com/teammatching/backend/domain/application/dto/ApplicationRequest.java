package com.teammatching.backend.domain.application.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class ApplicationRequest {
    @NotBlank(message = "지원 메시지를 작성해주세요.")
    private String message;
}
