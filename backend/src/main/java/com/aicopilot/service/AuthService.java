package com.aicopilot.service;

import com.aicopilot.dto.AuthDtos.*;
import com.aicopilot.entity.*;
import com.aicopilot.exception.AppException;
import com.aicopilot.repository.*;
import com.aicopilot.security.JwtTokenProvider;
import com.aicopilot.security.TokenHashUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final EmailService emailService;

    @Value("${auth.lockout.max-attempts:5}")
    private int maxFailedAttempts;

    @Value("${auth.lockout.duration-minutes:15}")
    private int lockoutDurationMinutes;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = normalizeEmail(request.getEmail());

        if (userRepository.existsByEmail(email)) {
            log.warn("Registration failed: email already registered: {}", email);
            throw new AppException("Email already registered", HttpStatus.CONFLICT);
        }

        User user = User.builder()
                .email(email)
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName().trim())
                .build();

        user = userRepository.save(user);
        log.info("User registered: {} (id={})", email, user.getId());

        return buildAuthResponse(user);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail().toLowerCase().trim();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    log.warn("Login failed: unknown email: {}", email);
                    return new AppException("Invalid email or password", HttpStatus.UNAUTHORIZED);
                });

        if (user.getLockedUntil() != null && user.getLockedUntil().isAfter(LocalDateTime.now())) {
            log.warn("Login failed: account locked for user: {}", email);
            throw new AppException("Account temporarily locked. Please try again later.", HttpStatus.TOO_MANY_REQUESTS);
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            user.setFailedLoginAttempts(user.getFailedLoginAttempts() + 1);
            if (user.getFailedLoginAttempts() >= maxFailedAttempts) {
                user.setLockedUntil(LocalDateTime.now().plusMinutes(lockoutDurationMinutes));
                log.warn("Account locked for user: {} after {} failed attempts", email, user.getFailedLoginAttempts());
            }
            userRepository.save(user);
            log.warn("Login failed: wrong password for: {} (attempt {}/{})", email, user.getFailedLoginAttempts(), maxFailedAttempts);
            throw new AppException("Invalid email or password", HttpStatus.UNAUTHORIZED);
        }

        user.setFailedLoginAttempts(0);
        user.setLockedUntil(null);
        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);
        log.info("User logged in: {} (id={})", email, user.getId());

        return buildAuthResponse(user);
    }

    @Transactional
    public AuthResponse refreshToken(RefreshTokenRequest request) {
        if (!tokenProvider.validateRefreshToken(request.getRefreshToken())) {
            log.warn("Token refresh failed: invalid JWT format");
            throw new AppException("Invalid refresh token", HttpStatus.UNAUTHORIZED);
        }

        String tokenHash = TokenHashUtils.hash(request.getRefreshToken());
        RefreshToken storedToken = refreshTokenRepository.findByToken(tokenHash)
                .orElseThrow(() -> {
                    log.warn("Token refresh failed: token not found in database");
                    return new AppException("Refresh token not found", HttpStatus.UNAUTHORIZED);
                });

        if (storedToken.isRevoked() || storedToken.isExpired()) {
            refreshTokenRepository.delete(storedToken);
            log.warn("Token refresh failed: token expired or revoked for user: {}",
                    storedToken.getUser().getId());
            throw new AppException("Refresh token expired or revoked. Please login again.", HttpStatus.UNAUTHORIZED);
        }

        // Rotate: revoke old, issue new
        storedToken.setRevoked(true);
        refreshTokenRepository.save(storedToken);

        User user = storedToken.getUser();
        log.info("Token refreshed for user: {}", user.getId());

        return buildAuthResponse(user);
    }

    @Transactional
    public MessageResponse logout(LogoutRequest request) {
        String tokenHash = TokenHashUtils.hash(request.getRefreshToken());
        RefreshToken storedToken = refreshTokenRepository.findByToken(tokenHash)
                .orElse(null);

        if (storedToken != null) {
            storedToken.setRevoked(true);
            refreshTokenRepository.save(storedToken);
            UUID userId = storedToken.getUser() != null ? storedToken.getUser().getId() : null;
            log.info("User logged out: {}", userId);
        }

        return MessageResponse.builder().message("Logged out successfully").build();
    }

    @Transactional
    public MessageResponse logoutAll(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

        refreshTokenRepository.revokeAllByUser(user);
        log.info("User logged out from all devices: {}", userId);
        return MessageResponse.builder().message("Logged out from all devices").build();
    }

    @Transactional
    public MessageResponse forgotPassword(ForgotPasswordRequest request) {
        log.info("Processing forgot password request for email: {}", normalizeEmail(request.getEmail()));
        User user = userRepository.findByEmail(request.getEmail().toLowerCase().trim())
                .orElse(null);

        // Always return success to prevent email enumeration
        if (user == null) {
            return MessageResponse.builder()
                    .message("If an account with that email exists, a password reset link has been sent")
                    .build();
        }

        // Delete any existing reset tokens for this user
        passwordResetTokenRepository.deleteByUser(user);

        // Create new reset token
        String token = UUID.randomUUID().toString();
        PasswordResetToken resetToken = PasswordResetToken.builder()
                .user(user)
                .token(token)
                .expiryDate(LocalDateTime.now().plusHours(1))
                .build();
        passwordResetTokenRepository.save(resetToken);

        emailService.sendPasswordResetEmail(user.getEmail(), token);
        log.info("Password reset token created for user: {} (id={})",
                user.getEmail(), user.getId());

        return MessageResponse.builder()
                .message("If an account with that email exists, a password reset link has been sent")
                .build();
    }

    @Transactional
    public MessageResponse resetPassword(ResetPasswordRequest request) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(request.getToken())
                .orElseThrow(() -> {
                    log.warn("Password reset failed: token not found");
                    return new AppException("Invalid or expired reset token", HttpStatus.BAD_REQUEST);
                });

        if (resetToken.isUsed()) {
            log.warn("Password reset failed: token already used for user: {}", resetToken.getUser().getId());
            throw new AppException("Reset token already used", HttpStatus.BAD_REQUEST);
        }

        if (resetToken.isExpired()) {
            log.warn("Password reset failed: token expired for user: {}", resetToken.getUser().getId());
            throw new AppException("Reset token expired", HttpStatus.BAD_REQUEST);
        }

        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        resetToken.setUsed(true);
        passwordResetTokenRepository.save(resetToken);

        // Revoke all refresh tokens for security (force re-login)
        refreshTokenRepository.revokeAllByUser(user);
        log.info("Password reset completed for user: {}", user.getId());

        return MessageResponse.builder().message("Password reset successfully").build();
    }

    private AuthResponse buildAuthResponse(User user) {
        String accessToken = tokenProvider.generateAccessToken(user.getId(), user.getEmail());
        String refreshTokenValue = tokenProvider.generateRefreshToken(user.getId());

        // Persist hashed refresh token
        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .token(TokenHashUtils.hash(refreshTokenValue))
                .expiryDate(LocalDateTime.now().plusDays(7))
                .build();
        refreshTokenRepository.save(refreshToken);

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshTokenValue)
                .tokenType("Bearer")
                .user(UserProfile.builder()
                        .id(user.getId().toString())
                        .email(user.getEmail())
                        .fullName(user.getFullName())
                        .avatarUrl(user.getAvatarUrl())
                        .planTier(user.getPlanTier().name())
                        .build())
                .build();
    }

    private String normalizeEmail(String email) {
        return email.toLowerCase().trim();
    }
}
