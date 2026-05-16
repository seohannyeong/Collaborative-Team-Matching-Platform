package com.teammatching.backend.domain.project;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ProjectRepository extends JpaRepository<Project, Long> {
    // 추가적인 검색 메서드(예: title 검색 등)는 추후 확장 가능
}