package com.teammatching.backend.domain.profile;

import com.teammatching.backend.domain.user.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "profiles")
@Getter
@NoArgsConstructor
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

}
