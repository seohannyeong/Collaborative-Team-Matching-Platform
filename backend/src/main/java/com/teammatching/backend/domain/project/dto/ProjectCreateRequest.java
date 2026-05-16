package com.teammatching.backend.domain.project.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@NoArgsConstructor
public class ProjectCreateRequest {

    @NotBlank(message = "제목은 필수입니다.")
    private String title;

    @NotBlank(message = "설명은 필수입니다.")
    private String description;

    @NotBlank(message = "기술 스택은 필수입니다.")
    private String techStack;

    @NotNull(message = "모집 인원은 필수입니다.")
    @Min(value = 1, message = "모집 인원은 1명 이상이어야 합니다.")
    private Integer recruitCount;

    @NotNull(message = "마감 기한은 필수입니다.")
    @Future(message = "마감 기한은 과거일 수 없습니다.")
    private LocalDateTime deadline;
}
