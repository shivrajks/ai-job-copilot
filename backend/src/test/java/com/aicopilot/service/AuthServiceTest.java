package com.aicopilot.service;

import com.aicopilot.dto.AuthDtos.*;
import com.aicopilot.entity.*;
import com.aicopilot.exception.AppException;
import com.aicopilot.repository.*;
import com.aicopilot.security.JwtTokenProvider;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private RefreshTokenRepository refreshTokenRepository;
    @Mock private PasswordResetTokenRepository passwordResetTokenRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JwtTokenProvider tokenProvider;
    @Mock private EmailService emailService;

    @InjectMocks
    private AuthService authService;

    private RegisterRequest registerRequest;
    private LoginRequest loginRequest;
    private User testUser;

    @BeforeEach
    void setUp() {
        registerRequest = new RegisterRequest();
        registerRequest.setEmail("test@example.com");
        registerRequest.setPassword("Test@1234");
        registerRequest.setFullName("Test User");

        loginRequest = new LoginRequest();
        loginRequest.setEmail("test@example.com");
        loginRequest.setPassword("Test@1234");

        testUser = User.builder()
                .id(UUID.randomUUID())
                .email("test@example.com")
                .password("encoded_password")
                .fullName("Test User")
                .failedLoginAttempts(0)
                .build();

        ReflectionTestUtils.setField(authService, "maxFailedAttempts", 5);
        ReflectionTestUtils.setField(authService, "lockoutDurationMinutes", 15);
    }

    @Nested
    @DisplayName("Register")
    class Register {

        @Test
        @DisplayName("should register a new user successfully")
        void shouldRegisterNewUser() {
            when(userRepository.existsByEmail(anyString())).thenReturn(false);
            when(passwordEncoder.encode(anyString())).thenReturn("encoded_password");
            when(userRepository.save(any(User.class))).thenReturn(testUser);
            when(tokenProvider.generateAccessToken(any(), anyString())).thenReturn("access_token");
            when(tokenProvider.generateRefreshToken(any())).thenReturn("refresh_token");

            AuthResponse response = authService.register(registerRequest);

            assertThat(response).isNotNull();
            assertThat(response.getAccessToken()).isEqualTo("access_token");
            assertThat(response.getRefreshToken()).isEqualTo("refresh_token");
            assertThat(response.getTokenType()).isEqualTo("Bearer");
            assertThat(response.getUser().getEmail()).isEqualTo("test@example.com");

            verify(userRepository).save(any(User.class));
            verify(refreshTokenRepository).save(any(RefreshToken.class));
        }

        @Test
        @DisplayName("should throw exception when email already registered")
        void shouldThrowWhenEmailExists() {
            when(userRepository.existsByEmail(anyString())).thenReturn(true);

            assertThatThrownBy(() -> authService.register(registerRequest))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("Email already registered");

            verify(userRepository, never()).save(any());
        }
    }

    @Nested
    @DisplayName("Login")
    class Login {

        @Test
        @DisplayName("should login with valid credentials")
        void shouldLoginSuccessfully() {
            when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(testUser));
            when(passwordEncoder.matches(anyString(), anyString())).thenReturn(true);
            when(tokenProvider.generateAccessToken(any(), anyString())).thenReturn("access_token");
            when(tokenProvider.generateRefreshToken(any())).thenReturn("refresh_token");
            when(userRepository.save(any(User.class))).thenReturn(testUser);

            AuthResponse response = authService.login(loginRequest);

            assertThat(response).isNotNull();
            assertThat(response.getAccessToken()).isEqualTo("access_token");
            assertThat(response.getUser().getFullName()).isEqualTo("Test User");
        }

        @Test
        @DisplayName("should throw exception for invalid email")
        void shouldThrowForInvalidEmail() {
            when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());

            assertThatThrownBy(() -> authService.login(loginRequest))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("Invalid email or password");
        }

        @Test
        @DisplayName("should throw exception for wrong password")
        void shouldThrowForWrongPassword() {
            when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(testUser));
            when(passwordEncoder.matches(anyString(), anyString())).thenReturn(false);

            assertThatThrownBy(() -> authService.login(loginRequest))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("Invalid email or password");
        }

        @Test
        @DisplayName("should update last login timestamp")
        void shouldUpdateLastLogin() {
            when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(testUser));
            when(passwordEncoder.matches(anyString(), anyString())).thenReturn(true);
            when(tokenProvider.generateAccessToken(any(), anyString())).thenReturn("access_token");
            when(tokenProvider.generateRefreshToken(any())).thenReturn("refresh_token");
            when(userRepository.save(any(User.class))).thenReturn(testUser);

            authService.login(loginRequest);

            ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
            verify(userRepository).save(captor.capture());
            assertThat(captor.getValue().getLastLoginAt()).isNotNull();
        }
    }

    @Nested
    @DisplayName("Login Lockout")
    class LoginLockout {

        @Test
        @DisplayName("should lock account after max failed attempts")
        void shouldLockAccountAfterMaxFailures() {
            when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(testUser));
            when(passwordEncoder.matches(anyString(), anyString())).thenReturn(false);

            for (int i = 0; i < 5; i++) {
                assertThatThrownBy(() -> authService.login(loginRequest))
                        .isInstanceOf(AppException.class)
                        .hasMessageContaining("Invalid email or password");
            }

            assertThat(testUser.getFailedLoginAttempts()).isEqualTo(5);
            assertThat(testUser.getLockedUntil()).isNotNull();
            verify(userRepository, times(5)).save(testUser);
        }

        @Test
        @DisplayName("should throw lockout error when account is locked")
        void shouldThrowLockoutWhenAccountLocked() {
            testUser.setFailedLoginAttempts(5);
            testUser.setLockedUntil(LocalDateTime.now().plusMinutes(15));

            when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(testUser));

            assertThatThrownBy(() -> authService.login(loginRequest))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("Account temporarily locked");
        }

        @Test
        @DisplayName("should reset failed attempts on successful login")
        void shouldResetFailedAttemptsOnSuccess() {
            testUser.setFailedLoginAttempts(3);
            testUser.setLockedUntil(null);

            when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(testUser));
            when(passwordEncoder.matches(anyString(), anyString())).thenReturn(true);
            when(tokenProvider.generateAccessToken(any(), anyString())).thenReturn("access_token");
            when(tokenProvider.generateRefreshToken(any())).thenReturn("refresh_token");
            when(userRepository.save(any(User.class))).thenReturn(testUser);

            authService.login(loginRequest);

            assertThat(testUser.getFailedLoginAttempts()).isZero();
            assertThat(testUser.getLockedUntil()).isNull();
        }
    }

    @Nested
    @DisplayName("Refresh Token")
    class RefreshTokenTests {

        @Test
        @DisplayName("should refresh token successfully")
        void shouldRefreshToken() {
            RefreshTokenRequest request = new RefreshTokenRequest();
            request.setRefreshToken("valid_refresh_token");

            RefreshToken storedToken = RefreshToken.builder()
                    .id(UUID.randomUUID())
                    .user(testUser)
                    .token("valid_refresh_token")
                    .expiryDate(LocalDateTime.now().plusDays(7))
                    .build();

            when(tokenProvider.validateRefreshToken("valid_refresh_token")).thenReturn(true);
            when(refreshTokenRepository.findByToken(anyString())).thenReturn(Optional.of(storedToken));
            when(tokenProvider.generateAccessToken(any(), anyString())).thenReturn("new_access_token");
            when(tokenProvider.generateRefreshToken(any())).thenReturn("new_refresh_token");

            AuthResponse response = authService.refreshToken(request);

            assertThat(response).isNotNull();
            assertThat(response.getAccessToken()).isEqualTo("new_access_token");
            assertThat(response.getRefreshToken()).isEqualTo("new_refresh_token");

            verify(refreshTokenRepository).save(storedToken);
            assertThat(storedToken.isRevoked()).isTrue();
        }

        @Test
        @DisplayName("should throw for invalid refresh token")
        void shouldThrowForInvalidRefreshToken() {
            RefreshTokenRequest request = new RefreshTokenRequest();
            request.setRefreshToken("invalid_token");

            when(tokenProvider.validateRefreshToken("invalid_token")).thenReturn(false);

            assertThatThrownBy(() -> authService.refreshToken(request))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("Invalid refresh token");
        }

        @Test
        @DisplayName("should throw for expired stored token")
        void shouldThrowForExpiredStoredToken() {
            RefreshTokenRequest request = new RefreshTokenRequest();
            request.setRefreshToken("expired_token");

            RefreshToken expiredToken = RefreshToken.builder()
                    .id(UUID.randomUUID())
                    .user(testUser)
                    .token("expired_token")
                    .expiryDate(LocalDateTime.now().minusHours(1))
                    .build();

            when(tokenProvider.validateRefreshToken("expired_token")).thenReturn(true);
            when(refreshTokenRepository.findByToken(anyString())).thenReturn(Optional.of(expiredToken));

            assertThatThrownBy(() -> authService.refreshToken(request))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("expired or revoked");
        }
    }

    @Nested
    @DisplayName("Logout")
    class Logout {

        @Test
        @DisplayName("should logout successfully")
        void shouldLogoutSuccessfully() {
            LogoutRequest request = new LogoutRequest();
            request.setRefreshToken("some_refresh_token");

            RefreshToken storedToken = RefreshToken.builder()
                    .id(UUID.randomUUID())
                    .token("some_refresh_token")
                    .build();

            when(refreshTokenRepository.findByToken(anyString())).thenReturn(Optional.of(storedToken));

            MessageResponse response = authService.logout(request);

            assertThat(response.getMessage()).isEqualTo("Logged out successfully");
            assertThat(storedToken.isRevoked()).isTrue();
        }

        @Test
        @DisplayName("should handle logout with unknown token gracefully")
        void shouldHandleUnknownToken() {
            LogoutRequest request = new LogoutRequest();
            request.setRefreshToken("unknown_token");

            when(refreshTokenRepository.findByToken(anyString())).thenReturn(Optional.empty());

            MessageResponse response = authService.logout(request);

            assertThat(response.getMessage()).isEqualTo("Logged out successfully");
        }
    }

    @Nested
    @DisplayName("Forgot Password")
    class ForgotPassword {

        @Test
        @DisplayName("should return generic message for existing email")
        void shouldReturnGenericMessageForExistingEmail() {
            ForgotPasswordRequest request = new ForgotPasswordRequest();
            request.setEmail("test@example.com");

            when(userRepository.findByEmail("test@example.com")).thenReturn(Optional.of(testUser));

            MessageResponse response = authService.forgotPassword(request);

            assertThat(response.getMessage()).contains("If an account with that email exists");
            verify(passwordResetTokenRepository).save(any(PasswordResetToken.class));
        }

        @Test
        @DisplayName("should return generic message for non-existing email (no enumeration)")
        void shouldReturnGenericMessageForNonExistingEmail() {
            ForgotPasswordRequest request = new ForgotPasswordRequest();
            request.setEmail("nobody@example.com");

            when(userRepository.findByEmail("nobody@example.com")).thenReturn(Optional.empty());

            MessageResponse response = authService.forgotPassword(request);

            assertThat(response.getMessage()).contains("If an account with that email exists");
            verify(passwordResetTokenRepository, never()).save(any());
        }
    }

    @Nested
    @DisplayName("Reset Password")
    class ResetPassword {

        @Test
        @DisplayName("should reset password successfully")
        void shouldResetPasswordSuccessfully() {
            ResetPasswordRequest request = new ResetPasswordRequest();
            request.setToken("valid_reset_token");
            request.setNewPassword("NewPass@123");

            PasswordResetToken resetToken = PasswordResetToken.builder()
                    .id(UUID.randomUUID())
                    .user(testUser)
                    .token("valid_reset_token")
                    .expiryDate(LocalDateTime.now().plusHours(1))
                    .build();

            when(passwordResetTokenRepository.findByToken("valid_reset_token")).thenReturn(Optional.of(resetToken));
            when(passwordEncoder.encode("NewPass@123")).thenReturn("encoded_new_password");

            MessageResponse response = authService.resetPassword(request);

            assertThat(response.getMessage()).isEqualTo("Password reset successfully");
            assertThat(resetToken.isUsed()).isTrue();
            verify(refreshTokenRepository).revokeAllByUser(testUser);
        }

        @Test
        @DisplayName("should throw for invalid token")
        void shouldThrowForInvalidToken() {
            ResetPasswordRequest request = new ResetPasswordRequest();
            request.setToken("invalid_token");
            request.setNewPassword("NewPass@123");

            when(passwordResetTokenRepository.findByToken("invalid_token")).thenReturn(Optional.empty());

            assertThatThrownBy(() -> authService.resetPassword(request))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("Invalid or expired reset token");
        }

        @Test
        @DisplayName("should throw for already used token")
        void shouldThrowForUsedToken() {
            ResetPasswordRequest request = new ResetPasswordRequest();
            request.setToken("used_token");
            request.setNewPassword("NewPass@123");

            PasswordResetToken usedToken = PasswordResetToken.builder()
                    .id(UUID.randomUUID())
                    .user(testUser)
                    .token("used_token")
                    .expiryDate(LocalDateTime.now().plusHours(1))
                    .used(true)
                    .build();

            when(passwordResetTokenRepository.findByToken("used_token")).thenReturn(Optional.of(usedToken));

            assertThatThrownBy(() -> authService.resetPassword(request))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("already used");
        }

        @Test
        @DisplayName("should throw for expired token")
        void shouldThrowForExpiredToken() {
            ResetPasswordRequest request = new ResetPasswordRequest();
            request.setToken("expired_token");
            request.setNewPassword("NewPass@123");

            PasswordResetToken expiredToken = PasswordResetToken.builder()
                    .id(UUID.randomUUID())
                    .user(testUser)
                    .token("expired_token")
                    .expiryDate(LocalDateTime.now().minusHours(1))
                    .build();

            when(passwordResetTokenRepository.findByToken("expired_token")).thenReturn(Optional.of(expiredToken));

            assertThatThrownBy(() -> authService.resetPassword(request))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("expired");
        }
    }
}
