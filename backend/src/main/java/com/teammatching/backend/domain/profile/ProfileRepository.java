package com.teammatching.backend.domain.profile;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ProfileRepository extends JpaRepository<Profile, Long> {
    
    Optional<Profile> findByUserEmail(String email);
    
    Optional<Profile> findByUserId(Long userId);
}
