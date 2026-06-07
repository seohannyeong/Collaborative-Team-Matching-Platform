package com.teammatching.backend.domain.application;

import com.teammatching.backend.domain.project.Project;
import com.teammatching.backend.domain.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ApplicationRepository extends JpaRepository<Application, Long> {
    List<Application> findByProject(Project project);
    
    boolean existsByApplicantAndProject(User applicant, Project project);

    long countByProjectAndStatus(Project project, ApplicationStatus status);
    List<Application> findByApplicant(User applicant);
}
