package com.aicopilot.repository;

import com.aicopilot.entity.Resume;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ResumeRepository extends JpaRepository<Resume, UUID> {
    List<Resume> findByUserIdOrderByCreatedAtDesc(UUID userId);
    List<Resume> findByParsingStatusOrderByCreatedAtDesc(Resume.ParsingStatus parsingStatus);
    long countByUserId(UUID userId);
    long countByUserIdAndIsActiveTrue(UUID userId);

    @Query("SELECT AVG(r.atsScore) FROM Resume r WHERE r.user.id = :userId AND r.atsScore IS NOT NULL")
    Double averageAtsScoreByUserId(UUID userId);

    @Query("SELECT MAX(r.atsScore) FROM Resume r WHERE r.user.id = :userId")
    Integer maxAtsScoreByUserId(UUID userId);
}
