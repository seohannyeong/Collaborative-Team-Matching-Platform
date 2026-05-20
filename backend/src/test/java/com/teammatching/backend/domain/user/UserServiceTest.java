package com.teammatching.backend.domain.user;

import com.teammatching.backend.TestRequestFactory;
import com.teammatching.backend.domain.profile.ProfileRepository;
import com.teammatching.backend.domain.user.dto.LoginResponse;
import com.teammatching.backend.domain.user.dto.MeResponse;
import com.teammatching.backend.global.exception.BusinessException;
import com.teammatching.backend.global.exception.ErrorCode;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
class UserServiceTest {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProfileRepository profileRepository;

    @BeforeEach
    void setUp() {
        profileRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    void signUpCreatesUserAndEmptyProfile() {
        Long userId = userService.signUp(TestRequestFactory.signUpRequest("leader@example.com", "password123", "leader"));

        User user = userRepository.findById(userId).orElseThrow();
        assertThat(user.getEmail()).isEqualTo("leader@example.com");
        assertThat(user.getPassword()).isNotEqualTo("password123");
        assertThat(profileRepository.findByUserEmail("leader@example.com")).isPresent();
    }

    @Test
    void signUpRejectsDuplicatedEmail() {
        userService.signUp(TestRequestFactory.signUpRequest("dup@example.com", "password123", "first"));

        assertThatThrownBy(() ->
                userService.signUp(TestRequestFactory.signUpRequest("dup@example.com", "password123", "second")))
                .isInstanceOf(BusinessException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.EMAIL_DUPLICATION);
    }

    @Test
    void loginReturnsAccessTokenForValidCredentials() {
        userService.signUp(TestRequestFactory.signUpRequest("login@example.com", "password123", "login"));

        LoginResponse response = userService.login(TestRequestFactory.loginRequest("login@example.com", "password123"));

        assertThat(response.getAccessToken()).isNotBlank();
    }

    @Test
    void loginRejectsWrongPassword() {
        userService.signUp(TestRequestFactory.signUpRequest("login@example.com", "password123", "login"));

        assertThatThrownBy(() -> userService.login(TestRequestFactory.loginRequest("login@example.com", "wrong-password")))
                .isInstanceOf(BusinessException.class)
                .extracting("errorCode")
                .isEqualTo(ErrorCode.LOGIN_FAILED);
    }

    @Test
    void meReturnsCurrentUserInfo() {
        Long userId = userService.signUp(TestRequestFactory.signUpRequest("me@example.com", "password123", "me"));

        MeResponse response = userService.me("me@example.com");

        assertThat(response.getId()).isEqualTo(userId);
        assertThat(response.getEmail()).isEqualTo("me@example.com");
        assertThat(response.getName()).isEqualTo("me");
    }
}
