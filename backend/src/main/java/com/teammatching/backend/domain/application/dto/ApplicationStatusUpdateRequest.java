package com.teammatching.backend.domain.application.dto;

import com.teammatching.backend.domain.application.ApplicationStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
public class ApplicationStatusUpdateRequest {
    @NotNull(message = "변경할 상태 값을 입력해주세요.")
    private ApplicationStatus status;
}
