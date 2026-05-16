package com.teammatching.backend.domain.profile;

import com.teammatching.backend.domain.user.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Entity
@Table(name = "profiles")
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Profile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false)
    private String interest;

    @Column(nullable = false)
    private String techStack;


    @Column(columnDefinition = "TEXT")
    private String introduction;
    
    private String githubUrl;

    @Column(columnDefinition = "TEXT")
    private String collaborationStyle;

    public void update(String interest, String techStack, String introduction, String githubUrl, String collaborationStyle) {
        this.interest = interest;
        this.techStack = techStack;
        this.introduction = introduction;
        this.githubUrl = githubUrl;
        this.collaborationStyle = collaborationStyle;
    }
}
