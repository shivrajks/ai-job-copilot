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
@Table(name = "job_descriptions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JobDescription {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String title;

    @Column
    private String company;

    @Column(columnDefinition = "TEXT")
    private String rawText;

    @Column(name = "source_url")
    private String sourceUrl;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "extracted_skills", columnDefinition = "JSONB")
    private String extractedSkills;

    @Column(name = "match_score")
    private Integer matchScore;

    @Enumerated(EnumType.STRING)
    @Column(name = "analysis_status", nullable = false)
    @Builder.Default
    private AnalysisStatus analysisStatus = AnalysisStatus.PENDING;

    @Column(name = "analyzed_at")
    private LocalDateTime analyzedAt;

    @Column(name = "analysis_attempts")
    @Builder.Default
    private Integer analysisAttempts = 0;

    @Column(name = "error_message")
    private String errorMessage;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "structured_data", columnDefinition = "JSONB")
    private String structuredData;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum AnalysisStatus {
        PENDING,
        PROCESSING,
        ANALYZED,
        FAILED
    }
}
