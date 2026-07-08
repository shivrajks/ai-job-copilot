package com.aicopilot.service;

import com.aicopilot.dto.UserDtos.*;
import com.aicopilot.entity.*;
import com.aicopilot.exception.AppException;
import com.aicopilot.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserSettingsRepository userSettingsRepository;
    private final ResumeRepository resumeRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public ProfileResponse getProfile(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> {
                    log.warn("Profile fetch failed: user not found: {}", userId);
                    return new AppException("User not found", HttpStatus.NOT_FOUND);
                });

        UserSettings settings = userSettingsRepository.findByUserId(userId)
                .orElseGet(() -> createDefaultSettings(user));

        String defaultResumeName = null;
        if (settings.getDefaultResumeId() != null) {
            defaultResumeName = resumeRepository.findById(settings.getDefaultResumeId())
                    .map(Resume::getName)
                    .orElse(null);
        }

        log.debug("Profile fetched for user: {}", userId);
        return ProfileResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .avatarUrl(user.getAvatarUrl())
                .planTier(user.getPlanTier().name())
                .createdAt(user.getCreatedAt())
                .settings(UserSettingsResponse.builder()
                        .theme(settings.getTheme())
                        .defaultDashboardPage(settings.getDefaultDashboardPage())
                        .defaultResumeId(settings.getDefaultResumeId())
                        .defaultResumeName(defaultResumeName)
                        .defaultSortField(settings.getDefaultSortField())
                        .defaultSortDirection(settings.getDefaultSortDirection())
                        .notifyPasswordReset(settings.isNotifyPasswordReset())
                        .notifyResumeParsed(settings.isNotifyResumeParsed())
                        .notifyAtsComplete(settings.isNotifyAtsComplete())
                        .notifyInterviewReady(settings.isNotifyInterviewReady())
                        .build())
                .build();
    }

    @Transactional
    public ProfileResponse updateProfile(UUID userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> {
                    log.warn("Profile update failed: user not found: {}", userId);
                    return new AppException("User not found", HttpStatus.NOT_FOUND);
                });

        String oldName = user.getFullName();
        user.setFullName(request.getFullName().trim());
        user.setAvatarUrl(request.getAvatarUrl());
        user = userRepository.save(user);
        log.info("Profile updated for user: {} (name: {} -> {})", userId, oldName, user.getFullName());

        return getProfile(userId);
    }

    @Transactional
    public MessageResponse changePassword(UUID userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> {
                    log.warn("Password change failed: user not found: {}", userId);
                    return new AppException("User not found", HttpStatus.NOT_FOUND);
                });

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            log.warn("Password change failed: wrong current password for user: {}", userId);
            throw new AppException("Current password is incorrect", HttpStatus.BAD_REQUEST);
        }

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            log.warn("Password change failed: passwords do not match for user: {}", userId);
            throw new AppException("New passwords do not match", HttpStatus.BAD_REQUEST);
        }

        if (request.getCurrentPassword().equals(request.getNewPassword())) {
            log.warn("Password change failed: new password same as current for user: {}", userId);
            throw new AppException("New password must be different from current password", HttpStatus.BAD_REQUEST);
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        refreshTokenRepository.revokeAllByUser(user);
        log.info("Password changed for user: {} (all other sessions invalidated)", userId);

        return MessageResponse.builder()
                .message("Password changed successfully. All other sessions have been logged out.")
                .build();
    }

    @Transactional(readOnly = true)
    public UserSettingsResponse getSettings(UUID userId) {
        UserSettings settings = userSettingsRepository.findByUserId(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));
                    return createDefaultSettings(user);
                });

        String defaultResumeName = null;
        if (settings.getDefaultResumeId() != null) {
            defaultResumeName = resumeRepository.findById(settings.getDefaultResumeId())
                    .map(Resume::getName)
                    .orElse(null);
        }

        log.debug("Settings fetched for user: {}", userId);
        return UserSettingsResponse.builder()
                .theme(settings.getTheme())
                .defaultDashboardPage(settings.getDefaultDashboardPage())
                .defaultResumeId(settings.getDefaultResumeId())
                .defaultResumeName(defaultResumeName)
                .defaultSortField(settings.getDefaultSortField())
                .defaultSortDirection(settings.getDefaultSortDirection())
                .notifyPasswordReset(settings.isNotifyPasswordReset())
                .notifyResumeParsed(settings.isNotifyResumeParsed())
                .notifyAtsComplete(settings.isNotifyAtsComplete())
                .notifyInterviewReady(settings.isNotifyInterviewReady())
                .build();
    }

    @Transactional
    public UserSettingsResponse updateSettings(UUID userId, UpdateSettingsRequest request) {
        UserSettings settings = userSettingsRepository.findByUserId(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));
                    return createDefaultSettings(user);
                });

        if (request.getTheme() != null) {
            settings.setTheme(request.getTheme());
        }
        if (request.getDefaultDashboardPage() != null) {
            settings.setDefaultDashboardPage(request.getDefaultDashboardPage());
        }
        if (request.getDefaultResumeId() != null) {
            settings.setDefaultResumeId(request.getDefaultResumeId());
        }
        if (request.getDefaultSortField() != null) {
            settings.setDefaultSortField(request.getDefaultSortField());
        }
        if (request.getDefaultSortDirection() != null) {
            settings.setDefaultSortDirection(request.getDefaultSortDirection());
        }
        if (request.getNotifyPasswordReset() != null) {
            settings.setNotifyPasswordReset(request.getNotifyPasswordReset());
        }
        if (request.getNotifyResumeParsed() != null) {
            settings.setNotifyResumeParsed(request.getNotifyResumeParsed());
        }
        if (request.getNotifyAtsComplete() != null) {
            settings.setNotifyAtsComplete(request.getNotifyAtsComplete());
        }
        if (request.getNotifyInterviewReady() != null) {
            settings.setNotifyInterviewReady(request.getNotifyInterviewReady());
        }

        userSettingsRepository.save(settings);
        log.info("Settings updated for user: {}", userId);

        return getSettings(userId);
    }

    @Transactional(readOnly = true)
    public SessionInfo getSessionInfo(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));
        int count = refreshTokenRepository.countActiveByUser(user);
        return SessionInfo.builder().activeSessions(count).build();
    }

    private UserSettings createDefaultSettings(User user) {
        UserSettings settings = UserSettings.builder()
                .user(user)
                .build();
        return userSettingsRepository.save(settings);
    }
}
