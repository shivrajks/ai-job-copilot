package com.aicopilot.security;

import com.aicopilot.config.RateLimitProperties;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.io.PrintWriter;
import java.io.StringWriter;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RateLimitingFilterTest {

    @Mock
    private HttpServletRequest request;

    @Mock
    private HttpServletResponse response;

    @Mock
    private FilterChain chain;

    private RateLimitProperties properties;

    private RateLimitingFilter filter;

    @BeforeEach
    void setUp() {
        properties = new RateLimitProperties();
        RateLimitProperties.Auth auth = new RateLimitProperties.Auth();
        auth.setMaxRequests(2);
        auth.setWindowMinutes(1);
        properties.setAuth(auth);
        filter = new RateLimitingFilter(properties);
    }

    @Nested
    @DisplayName("Rate limiting enforcement")
    class RateLimiting {

        @Test
        @DisplayName("should allow requests under limit")
        void shouldAllowUnderLimit() throws Exception {
            when(request.getRequestURI()).thenReturn("/api/auth/login");
            when(request.getHeader("X-Forwarded-For")).thenReturn(null);
            when(request.getRemoteAddr()).thenReturn("192.168.1.1");

            filter.doFilterInternal(request, response, chain);
            filter.doFilterInternal(request, response, chain);

            verify(chain, times(2)).doFilter(request, response);
        }

        @Test
        @DisplayName("should block requests over limit")
        void shouldBlockOverLimit() throws Exception {
            when(request.getRequestURI()).thenReturn("/api/auth/login");
            when(request.getHeader("X-Forwarded-For")).thenReturn(null);
            when(request.getRemoteAddr()).thenReturn("192.168.1.2");

            StringWriter stringWriter = new StringWriter();
            PrintWriter printWriter = new PrintWriter(stringWriter);
            when(response.getWriter()).thenReturn(printWriter);

            filter.doFilterInternal(request, response, chain);
            filter.doFilterInternal(request, response, chain);
            filter.doFilterInternal(request, response, chain);

            verify(chain, times(2)).doFilter(request, response);
            verify(response).setStatus(429);
            assertThat(stringWriter.toString()).contains("Too Many Requests");
        }

        @Test
        @DisplayName("should use X-Forwarded-For header when present")
        void shouldUseForwardedFor() throws Exception {
            when(request.getRequestURI()).thenReturn("/api/auth/login");
            when(request.getHeader("X-Forwarded-For")).thenReturn("10.0.0.1");

            filter.doFilterInternal(request, response, chain);
            filter.doFilterInternal(request, response, chain);

            verify(chain, times(2)).doFilter(request, response);
            verify(request, never()).getRemoteAddr();
        }

        @Test
        @DisplayName("should not rate-limit non-auth paths")
        void shouldNotRateLimitNonAuth() throws Exception {
            when(request.getRequestURI()).thenReturn("/api/jobs");

            for (int i = 0; i < 10; i++) {
                filter.doFilterInternal(request, response, chain);
            }

            verify(chain, times(10)).doFilter(request, response);
        }
    }
}
