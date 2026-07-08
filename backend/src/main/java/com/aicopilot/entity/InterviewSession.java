package com.aicopilot.entity;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "interview_sessions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InterviewSession {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resume_id")
    private Resume resume;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_description_id")
    private JobDescription jobDescription;

    @Column(nullable = false)
    @Builder.Default
    private String title = "Interview Preparation";

    @Column(name = "session_type", nullable = false)
    private String sessionType;

    @Column(length = 10)
    @Builder.Default
    private String difficulty = "medium";

    @Column
    @Builder.Default
    private String status = "IN_PROGRESS";

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "JSONB")
    private String questions;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "JSONB")
    private String responses;

    @Column(name = "overall_score")
    private Integer overallScore;

    @Column(columnDefinition = "TEXT")
    private String feedback;

    @Column(name = "question_count")
    @Builder.Default
    private Integer questionCount = 0;

    @Column(name = "answered_count")
    @Builder.Default
    private Integer answeredCount = 0;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
