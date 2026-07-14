package com.aicopilot.security;

import org.junit.jupiter.api.Test;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class JwtTokenProviderTest {

    @Test
    void refreshTokensForSameUserAreUnique() {
        JwtTokenProvider provider = new JwtTokenProvider(
                "test-jwt-secret-key-ai-copilot-at-least-256-bits-long!!",
                900000,
                604800000);
        UUID userId = UUID.randomUUID();

        String first = provider.generateRefreshToken(userId);
        String second = provider.generateRefreshToken(userId);

        assertThat(second).isNotEqualTo(first);
        assertThat(provider.validateRefreshToken(first)).isTrue();
        assertThat(provider.validateRefreshToken(second)).isTrue();
    }
}
