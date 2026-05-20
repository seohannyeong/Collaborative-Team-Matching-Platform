package com.teammatching.backend.domain.project;

import com.teammatching.backend.domain.user.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "projects")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Project {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String description;

    @Column(nullable = false)
    private String techStack;

    @Column(nullable = false)
    private Integer recruitCount;

    @Column(nullable = false)
    private LocalDateTime deadline;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProjectStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "leader_id", nullable = false)
    private User leader;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    public void update(String title, String description, String techStack, Integer recruitCount, LocalDateTime deadline, ProjectStatus status) {
        this.title = title;
        this.description = description;
        this.techStack = techStack;
        this.recruitCount = recruitCount;
        this.deadline = deadline;
        this.status = status;
    }

    // 작성자 검증을 위한 편의 메서드
    public boolean isLeader(String email) {
        return this.leader.getEmail().equals(email);
    }

    public boolean isRecruiting(LocalDateTime now) {
        return this.status == ProjectStatus.RECRUITING && this.deadline.isAfter(now);
    }

    public void complete() {
        this.status = ProjectStatus.COMPLETED;
    }
}
