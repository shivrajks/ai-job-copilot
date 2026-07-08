package com.aicopilot.service;

import com.aicopilot.dto.UserDtos.*;
import com.aicopilot.entity.*;
import com.aicopilot.exception.AppException;
import com.aicopilot.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private UserSettingsRepository userSettingsRepository;
    @Mock private ResumeRepository resumeRepository;
    @Mock private RefreshTokenRepository refreshTokenRepository;
    @Mock private PasswordEncoder passwordEncoder;

    @InjectMocks
    private UserService userService;

    private UUID userId;
    private User testUser;
    private UserSettings defaultSettings;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        testUser = User.builder()
                .id(userId)
                .email("test@example.com")
                .password("encoded_password")
                .fullName("Test User")
                .avatarUrl("http://avatar.com/1")
                .planTier(User.PlanTier.FREE)
                .build();

        defaultSettings = UserSettings.builder()
                .user(testUser)
                .theme("system")
                .defaultDashboardPage("dashboard")
                .defaultSortField("createdAt")
                .defaultSortDirection("desc")
                .notifyPasswordReset(true)
                .notifyResumeParsed(true)
                .notifyAtsComplete(true)
                .notifyInterviewReady(true)
                .build();
    }

    @Nested
    @DisplayName("getProfile")
    class GetProfile {

        @Test
        @DisplayName("Should return profile when user exists")
        void shouldReturnProfile() {
            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(userSettingsRepository.findByUserId(userId)).thenReturn(Optional.of(defaultSettings));

            ProfileResponse response = userService.getProfile(userId);

            assertThat(response.getId()).isEqualTo(userId);
            assertThat(response.getEmail()).isEqualTo("test@example.com");
            assertThat(response.getFullName()).isEqualTo("Test User");
            assertThat(response.getAvatarUrl()).isEqualTo("http://avatar.com/1");
            assertThat(response.getPlanTier()).isEqualTo("FREE");
            assertThat(response.getCreatedAt()).isNull(); // not set on the test builder; Hibernate @CreationTimestamp not triggered
            assertThat(response.getSettings()).isNotNull();
            assertThat(response.getSettings().getTheme()).isEqualTo("system");
        }

        @Test
        @DisplayName("Should create default settings when none exist")
        void shouldCreateDefaultSettingsWhenMissing() {
            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(userSettingsRepository.findByUserId(userId)).thenReturn(Optional.empty());
            when(userSettingsRepository.save(any(UserSettings.class))).thenReturn(defaultSettings);

            ProfileResponse response = userService.getProfile(userId);

            assertThat(response.getSettings()).isNotNull();
            verify(userSettingsRepository).save(any(UserSettings.class));
        }

        @Test
        @DisplayName("Should throw AppException when user not found")
        void shouldThrowWhenUserNotFound() {
            when(userRepository.findById(userId)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> userService.getProfile(userId))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("User not found");
        }

        @Test
        @DisplayName("Should resolve default resume name when defaultResumeId is set")
        void shouldResolveDefaultResumeName() {
            UUID resumeId = UUID.randomUUID();
            defaultSettings.setDefaultResumeId(resumeId);

            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(userSettingsRepository.findByUserId(userId)).thenReturn(Optional.of(defaultSettings));
            when(resumeRepository.findById(resumeId)).thenReturn(Optional.of(
                    Resume.builder().id(resumeId).name("My Resume").build()
            ));

            ProfileResponse response = userService.getProfile(userId);

            assertThat(response.getSettings().getDefaultResumeName()).isEqualTo("My Resume");
        }

        @Test
        @DisplayName("Should return null defaultResumeName when resume not found")
        void shouldHandleMissingDefaultResume() {
            UUID resumeId = UUID.randomUUID();
            defaultSettings.setDefaultResumeId(resumeId);

            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(userSettingsRepository.findByUserId(userId)).thenReturn(Optional.of(defaultSettings));
            when(resumeRepository.findById(resumeId)).thenReturn(Optional.empty());

            ProfileResponse response = userService.getProfile(userId);

            assertThat(response.getSettings().getDefaultResumeName()).isNull();
        }
    }

    @Nested
    @DisplayName("updateProfile")
    class UpdateProfile {

        @Test
        @DisplayName("Should update user profile successfully")
        void shouldUpdateProfile() {
            UpdateProfileRequest request = new UpdateProfileRequest();
            request.setFullName("  Updated Name  ");
            request.setAvatarUrl("http://avatar.com/new");

            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(userRepository.save(any(User.class))).thenReturn(testUser);
            when(userSettingsRepository.findByUserId(userId)).thenReturn(Optional.of(defaultSettings));

            ProfileResponse response = userService.updateProfile(userId, request);

            assertThat(response.getFullName()).isEqualTo("Updated Name");
            verify(userRepository).save(argThat(u ->
                    "Updated Name".equals(u.getFullName()) &&
                    "http://avatar.com/new".equals(u.getAvatarUrl())
            ));
        }

        @Test
        @DisplayName("Should throw AppException when user not found")
        void shouldThrowWhenUserNotFound() {
            UpdateProfileRequest request = new UpdateProfileRequest();
            request.setFullName("New Name");

            when(userRepository.findById(userId)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> userService.updateProfile(userId, request))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("User not found");
        }
    }

    @Nested
    @DisplayName("changePassword")
    class ChangePassword {

        @Test
        @DisplayName("Should change password successfully")
        void shouldChangePassword() {
            ChangePasswordRequest request = new ChangePasswordRequest();
            request.setCurrentPassword("OldPass1!");
            request.setNewPassword("NewPass1!");
            request.setConfirmPassword("NewPass1!");

            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(passwordEncoder.matches("OldPass1!", "encoded_password")).thenReturn(true);
            when(passwordEncoder.encode("NewPass1!")).thenReturn("new_encoded");
            when(userRepository.save(any(User.class))).thenReturn(testUser);

            MessageResponse response = userService.changePassword(userId, request);

            assertThat(response.getMessage()).contains("Password changed successfully");
            verify(refreshTokenRepository).revokeAllByUser(testUser);
        }

        @Test
        @DisplayName("Should throw when current password is incorrect")
        void shouldThrowWhenCurrentPasswordWrong() {
            ChangePasswordRequest request = new ChangePasswordRequest();
            request.setCurrentPassword("WrongPass1!");
            request.setNewPassword("NewPass1!");
            request.setConfirmPassword("NewPass1!");

            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(passwordEncoder.matches("WrongPass1!", "encoded_password")).thenReturn(false);

            assertThatThrownBy(() -> userService.changePassword(userId, request))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("Current password is incorrect");

            verify(refreshTokenRepository, never()).revokeAllByUser(any());
        }

        @Test
        @DisplayName("Should throw when new passwords do not match")
        void shouldThrowWhenPasswordsMismatch() {
            ChangePasswordRequest request = new ChangePasswordRequest();
            request.setCurrentPassword("OldPass1!");
            request.setNewPassword("NewPass1!");
            request.setConfirmPassword("DifferentPass1!");

            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(passwordEncoder.matches("OldPass1!", "encoded_password")).thenReturn(true);

            assertThatThrownBy(() -> userService.changePassword(userId, request))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("passwords do not match");
        }

        @Test
        @DisplayName("Should throw when new password is same as current")
        void shouldThrowWhenSamePassword() {
            ChangePasswordRequest request = new ChangePasswordRequest();
            request.setCurrentPassword("OldPass1!");
            request.setNewPassword("OldPass1!");
            request.setConfirmPassword("OldPass1!");

            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(passwordEncoder.matches("OldPass1!", "encoded_password")).thenReturn(true);

            assertThatThrownBy(() -> userService.changePassword(userId, request))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("must be different");
        }

        @Test
        @DisplayName("Should throw when user not found")
        void shouldThrowWhenUserNotFound() {
            ChangePasswordRequest request = new ChangePasswordRequest();
            request.setCurrentPassword("OldPass1!");

            when(userRepository.findById(userId)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> userService.changePassword(userId, request))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("User not found");
        }
    }

    @Nested
    @DisplayName("getSettings")
    class GetSettings {

        @Test
        @DisplayName("Should return existing settings")
        void shouldReturnSettings() {
            when(userSettingsRepository.findByUserId(userId)).thenReturn(Optional.of(defaultSettings));

            UserSettingsResponse response = userService.getSettings(userId);

            assertThat(response.getTheme()).isEqualTo("system");
            assertThat(response.getDefaultDashboardPage()).isEqualTo("dashboard");
            assertThat(response.isNotifyPasswordReset()).isTrue();
        }

        @Test
        @DisplayName("Should create default settings when none exist")
        void shouldCreateDefaultSettings() {
            when(userSettingsRepository.findByUserId(userId)).thenReturn(Optional.empty());
            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(userSettingsRepository.save(any(UserSettings.class))).thenReturn(defaultSettings);

            UserSettingsResponse response = userService.getSettings(userId);

            assertThat(response).isNotNull();
            verify(userSettingsRepository).save(any(UserSettings.class));
        }

        @Test
        @DisplayName("Should throw when user not found during settings creation")
        void shouldThrowWhenUserNotFound() {
            when(userSettingsRepository.findByUserId(userId)).thenReturn(Optional.empty());
            when(userRepository.findById(userId)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> userService.getSettings(userId))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("User not found");
        }

        @Test
        @DisplayName("Should resolve default resume name in settings")
        void shouldResolveDefaultResumeName() {
            UUID resumeId = UUID.randomUUID();
            defaultSettings.setDefaultResumeId(resumeId);

            when(userSettingsRepository.findByUserId(userId)).thenReturn(Optional.of(defaultSettings));
            when(resumeRepository.findById(resumeId)).thenReturn(Optional.of(
                    Resume.builder().id(resumeId).name("My Resume").build()
            ));

            UserSettingsResponse response = userService.getSettings(userId);

            assertThat(response.getDefaultResumeName()).isEqualTo("My Resume");
        }
    }

    @Nested
    @DisplayName("updateSettings")
    class UpdateSettings {

        @Test
        @DisplayName("Should update all provided settings")
        void shouldUpdateSettings() {
            UpdateSettingsRequest request = new UpdateSettingsRequest();
            request.setTheme("dark");
            request.setDefaultDashboardPage("analytics");
            request.setNotifyPasswordReset(false);

            when(userSettingsRepository.findByUserId(userId)).thenReturn(Optional.of(defaultSettings));
            when(userSettingsRepository.save(any(UserSettings.class))).thenReturn(defaultSettings);

            UserSettingsResponse response = userService.updateSettings(userId, request);

            assertThat(response).isNotNull();
            verify(userSettingsRepository).save(argThat(s ->
                    "dark".equals(s.getTheme()) &&
                    "analytics".equals(s.getDefaultDashboardPage()) &&
                    !s.isNotifyPasswordReset()
            ));
        }

        @Test
        @DisplayName("Should handle null fields by not updating them")
        void shouldIgnoreNullFields() {
            UpdateSettingsRequest request = new UpdateSettingsRequest();
            request.setTheme("dark");

            when(userSettingsRepository.findByUserId(userId)).thenReturn(Optional.of(defaultSettings));
            when(userSettingsRepository.save(any(UserSettings.class))).thenReturn(defaultSettings);

            UserSettingsResponse response = userService.updateSettings(userId, request);

            assertThat(response).isNotNull();
            verify(userSettingsRepository).save(argThat(s ->
                    "dark".equals(s.getTheme()) &&
                    "dashboard".equals(s.getDefaultDashboardPage())
            ));
        }

        @Test
        @DisplayName("Should create default settings when none exist")
        void shouldCreateDefaultSettings() {
            UpdateSettingsRequest request = new UpdateSettingsRequest();
            request.setTheme("dark");

            when(userSettingsRepository.findByUserId(userId)).thenReturn(Optional.empty());
            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(userSettingsRepository.save(any(UserSettings.class))).thenReturn(defaultSettings);

            UserSettingsResponse response = userService.updateSettings(userId, request);

            assertThat(response).isNotNull();
        }
    }

    @Nested
    @DisplayName("getSessionInfo")
    class GetSessionInfo {

        @Test
        @DisplayName("Should return active session count")
        void shouldReturnSessionCount() {
            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(refreshTokenRepository.countActiveByUser(testUser)).thenReturn(3);

            SessionInfo info = userService.getSessionInfo(userId);

            assertThat(info.getActiveSessions()).isEqualTo(3);
        }

        @Test
        @DisplayName("Should throw when user not found")
        void shouldThrowWhenUserNotFound() {
            when(userRepository.findById(userId)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> userService.getSessionInfo(userId))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("User not found");
        }
    }
}
