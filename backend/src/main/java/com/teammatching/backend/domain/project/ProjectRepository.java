package com.teammatching.backend.domain.project;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProjectRepository extends JpaRepository<Project, Long> {

    @Query("SELECT p FROM Project p " +
           "WHERE (:techStack IS NULL OR LOWER(p.techStack) LIKE :techStack) " +
           "AND (:status IS NULL OR CAST(p.status AS String) = :status) " +
           "AND (:keyword IS NULL OR (LOWER(p.title) LIKE :keyword " +
           "OR LOWER(p.description) LIKE :keyword))")
    List<Project> searchProjects(@Param("techStack") String techStack,
                                 @Param("status") String status,
                                 @Param("keyword") String keyword);
}
