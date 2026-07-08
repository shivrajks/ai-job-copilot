package com.aicopilot.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "jobs", indexes = {
    @Index(name = "idx_jobs_user_id", columnList = "user_id"),
    @Index(name = "idx_jobs_status", columnList = "status"),
    @Index(name = "idx_jobs_is_favorite", columnList = "is_favorite"),
    @Index(name = "idx_jobs_is_archived", columnList = "is_archived"),
    @Index(name = "idx_jobs_priority", columnList = "priority"),
    @Index(name = "idx_jobs_work_mode", columnList = "work_mode"),
    @Index(name = "idx_jobs_company", columnList = "company"),
    @Index(name = "idx_jobs_created_at", columnList = "created_at")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Job {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resume_id")
    private Resume resume;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String company;

    private String location;

    @Enumerated(EnumType.STRING)
    @Column(name = "employment_type", length = 20)
    private EmploymentType employmentType;

    @Enumerated(EnumType.STRING)
    @Column(name = "work_mode", length = 10)
    private WorkMode workMode;

    @Column(name = "salary_min")
    private Integer salaryMin;

    @Column(name = "salary_max")
    private Integer salaryMax;

    @Column(columnDefinition = "TEXT")
    private String description;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "skills_required", columnDefinition = "JSONB")
    private String skillsRequired;

    @Column(name = "experience_required", length = 100)
    private String experienceRequired;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private JobSource source;

    @Column(name = "source_url", length = 2048)
    private String sourceUrl;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "date_saved")
    private LocalDate dateSaved;

    @Column(name = "deadline")
    private LocalDate deadline;

    @Enumerated(EnumType.STRING)
    @Column(length = 10)
    @Builder.Default
    private Priority priority = Priority.MEDIUM;

    @Column(name = "is_favorite")
    @Builder.Default
    private boolean isFavorite = false;

    @Column(name = "is_archived")
    @Builder.Default
    private boolean isArchived = false;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private JobStatus status = JobStatus.SAVED;

    @Column(name = "applied_date")
    private LocalDate appliedDate;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "interview_dates", columnDefinition = "JSONB")
    private String interviewDates;

    @Enumerated(EnumType.STRING)
    @Column(name = "offer_status", length = 20)
    private OfferStatus offerStatus;

    @Column(name = "rejection_reason", columnDefinition = "TEXT")
    private String rejectionReason;

    @Column(name = "follow_up_date")
    private LocalDate followUpDate;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum JobStatus {
        SAVED, APPLIED, PHONE_SCREEN, TECHNICAL_INTERVIEW,
        ONSITE_INTERVIEW, OFFER, ACCEPTED, REJECTED, WITHDRAWN
    }

    public enum EmploymentType {
        FULL_TIME, PART_TIME, CONTRACT, INTERNSHIP, FREELANCE, TEMPORARY
    }

    public enum WorkMode {
        REMOTE, HYBRID, ONSITE
    }

    public enum JobSource {
        LINKEDIN, INDEED, COMPANY, MANUAL, REFERRAL, OTHER
    }

    public enum Priority {
        LOW, MEDIUM, HIGH
    }

    public enum OfferStatus {
        PENDING, NEGOTIATING, ACCEPTED, DECLINED
    }
}
