package com.aicopilot.security;

import com.aicopilot.config.RateLimitProperties;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Deque;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentLinkedDeque;

@Slf4j
@Component
@Order(1)
public class RateLimitingFilter extends OncePerRequestFilter {

    private static final Map<String, Deque<Long>> REQUEST_LOG = new ConcurrentHashMap<>();

    private final RateLimitProperties properties;

    public RateLimitingFilter(RateLimitProperties properties) {
        this.properties = properties;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        String path = request.getRequestURI();

        if (!isRateLimited(path)) {
            filterChain.doFilter(request, response);
            return;
        }

        String clientIp = resolveClientIp(request);
        int maxRequests = properties.getAuth().getMaxRequests();
        long windowMs = properties.getAuth().getWindowMinutes() * 60_000L;

        if (isAllowed(clientIp, maxRequests, windowMs)) {
            filterChain.doFilter(request, response);
        } else {
            log.warn("Rate limit exceeded for IP: {} on path: {}", clientIp, path);
            response.setStatus(429);
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write("{\"status\":429,\"error\":\"Too Many Requests\",\"message\":\"Too many requests. Please try again later.\"}");
        }
    }

    private boolean isRateLimited(String path) {
        return path.startsWith("/api/auth/");
    }

    private boolean isAllowed(String clientIp, int maxRequests, long windowMs) {
        long now = System.currentTimeMillis();
        Deque<Long> timestamps = REQUEST_LOG.computeIfAbsent(clientIp, k -> new ConcurrentLinkedDeque<>());

        synchronized (timestamps) {
            while (!timestamps.isEmpty() && timestamps.peekFirst() < now - windowMs) {
                timestamps.pollFirst();
            }

            if (timestamps.size() >= maxRequests) {
                return false;
            }

            timestamps.addLast(now);
            return true;
        }
    }

    private String resolveClientIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) {
            return xff.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    @Override
    public void destroy() {
        REQUEST_LOG.clear();
    }
}
