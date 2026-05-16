package com.teammatching.backend.domain.user;

import com.teammatching.backend.domain.user.dto.LoginRequest;
import com.teammatching.backend.domain.user.dto.LoginResponse;
import com.teammatching.backend.domain.user.dto.SignUpRequest;
import com.teammatching.backend.global.jwt.JwtTokenProvider;
import com.teammatching.backend.global.exception.BusinessException;
import com.teammatching.backend.global.exception.ErrorCode;
import com.teammatching.backend.domain.user.dto.MeResponse;
import com.teammatching.backend.domain.profile.Profile;
import com.teammatching.backend.domain.profile.ProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final ProfileRepository profileRepository;

    @Transactional
    public Long signUp(SignUpRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BusinessException(ErrorCode.EMAIL_DUPLICATION);
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .name(request.getName())
                .build();

        User savedUser = userRepository.save(user);

        Profile profile = Profile.builder()
                .user(savedUser)
                .interest("")
                .techStack("")
                .build();
        profileRepository.save(profile);

        return savedUser.getId();
    }

    @Transactional
    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BusinessException(ErrorCode.LOGIN_FAILED));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new BusinessException(ErrorCode.LOGIN_FAILED);
        }

        Authentication authentication = new UsernamePasswordAuthenticationToken(user.getEmail(), null, Collections.emptyList());
        String token = jwtTokenProvider.createToken(authentication);

        return new LoginResponse(token);
    }
    public MeResponse me(String email) {

        User user = userRepository.findByEmail(email)
                .orElseThrow(() ->
                        new BusinessException(ErrorCode.USER_NOT_FOUND));

        return new MeResponse(
                user.getId(),
                user.getEmail(),
                user.getName()
        );
    }
}