package com.aicopilot.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.core.io.ClassPathResource;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.host:}")
    private String smtpHost;

    @Value("${app.base-url:http://localhost:3000}")
    private String baseUrl;

    private String loadTemplate(String templateName) throws IOException {
        ClassPathResource resource = new ClassPathResource("templates/" + templateName);
        return new String(resource.getContentAsByteArray(), StandardCharsets.UTF_8);
    }

    @Async
    public void sendPasswordResetEmail(String to, String token) {
        if (smtpHost == null || smtpHost.isBlank()) {
            log.warn("SMTP not configured. Password reset email not sent to {}.", to);
            return;
        }

        String resetUrl = baseUrl + "/auth/reset-password?token=" + token;

        try {
            String html = loadTemplate("password-reset.html");
            html = String.format(html, resetUrl, resetUrl, resetUrl);

            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(to);
            helper.setSubject("Reset Your Password — AI Job Copilot");
            helper.setText(html, true);

            mailSender.send(message);
            log.info("Password reset email sent to {}", to);
        } catch (MailException e) {
            log.error("Failed to send password reset email to {}: {}", to, e.getMessage());
        } catch (MessagingException | IOException e) {
            log.error("Failed to build password reset email for {}: {}", to, e.getMessage());
        }
    }
}
