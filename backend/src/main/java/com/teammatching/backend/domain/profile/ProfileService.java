package com.teammatching.backend.domain.profile;

import com.teammatching.backend.domain.profile.dto.ProfileResponse;
import com.teammatching.backend.domain.profile.dto.ProfileUpdateRequest;
import com.teammatching.backend.domain.user.User;
import com.teammatching.backend.domain.user.UserRepository;
import com.teammatching.backend.global.exception.BusinessException;
import com.teammatching.backend.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProfileService {

    private final ProfileRepository profileRepository;
    private final UserRepository userRepository;

    public ProfileResponse getMyProfile(String email) {
        Profile profile = profileRepository.findByUserEmail(email)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND)); // 필요시 PROFILE_NOT_FOUND로 교체
        return ProfileResponse.from(profile);
    }

    public ProfileResponse getProfileByUserId(Long userId) {
        Profile profile = profileRepository.findByUserId(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));
        return ProfileResponse.from(profile);
    }

    @Transactional
    public ProfileResponse updateProfile(String email, ProfileUpdateRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        // 기존 프로필이 있으면 가져오고, 없으면 새로 생성 (Upsert 패턴)
        Profile profile = profileRepository.findByUserEmail(email)
                .orElseGet(() -> Profile.builder().user(user).build());

        profile.update(
                request.getInterest(),
                request.getTechStack(),
                request.getIntroduction(),
                request.getGithubUrl(),
                request.getCollaborationStyle()
        );

        return ProfileResponse.from(profileRepository.save(profile));
    }
}
