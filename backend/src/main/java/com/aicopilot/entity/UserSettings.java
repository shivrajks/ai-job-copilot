package com.aicopilot.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "user_settings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserSettings {

    @Id
    private UUID userId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "user_id")
    private User user;

    @Column(nullable = false)
    @Builder.Default
    private String theme = "system";

    @Column(name = "default_dashboard_page", nullable = false)
    @Builder.Default
    private String defaultDashboardPage = "dashboard";

    @Column(name = "default_resume_id")
    private UUID defaultResumeId;

    @Column(name = "default_sort_field", nullable = false)
    @Builder.Default
    private String defaultSortField = "createdAt";

    @Column(name = "default_sort_direction", nullable = false)
    @Builder.Default
    private String defaultSortDirection = "desc";

    @Column(name = "notify_password_reset", nullable = false)
    @Builder.Default
    private boolean notifyPasswordReset = true;

    @Column(name = "notify_resume_parsed", nullable = false)
    @Builder.Default
    private boolean notifyResumeParsed = true;

    @Column(name = "notify_ats_complete", nullable = false)
    @Builder.Default
    private boolean notifyAtsComplete = true;

    @Column(name = "notify_interview_ready", nullable = false)
    @Builder.Default
    private boolean notifyInterviewReady = true;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
