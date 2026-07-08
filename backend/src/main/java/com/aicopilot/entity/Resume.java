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
@Table(name = "resumes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Resume {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String name;

    @Column(name = "original_file_url")
    private String originalFileUrl;

    @Column(name = "parsed_content", columnDefinition = "TEXT")
    private String parsedContent;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "structured_data", columnDefinition = "JSONB")
    private String structuredData;

    @Column(name = "ats_score")
    private Integer atsScore;

    @Column(name = "parsed_at")
    private LocalDateTime parsedAt;

    @Column(name = "parse_attempts")
    @Builder.Default
    private Integer parseAttempts = 0;

    @Column(name = "version_num")
    @Builder.Default
    private Integer versionNum = 1;

    @Enumerated(EnumType.STRING)
    @Column(name = "parsing_status", nullable = false)
    @Builder.Default
    private ParsingStatus parsingStatus = ParsingStatus.PENDING;

    @Column(name = "error_message")
    private String errorMessage;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "file_size")
    private Long fileSize;

    @Column(name = "mime_type")
    private String mimeType;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum ParsingStatus {
        PENDING,
        PROCESSING,
        PARSED,
        FAILED
    }
}
