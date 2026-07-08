package com.aicopilot.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.util.Map;

@Getter
@Setter
@Configuration
@ConfigurationProperties(prefix = "rate-limit")
public class RateLimitProperties {

    private Auth auth = new Auth();

    @Getter
    @Setter
    public static class Auth {
        private int maxRequests = 10;
        private int windowMinutes = 1;
    }
}
