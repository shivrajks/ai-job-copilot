package com.aicopilot.repository;

import com.aicopilot.entity.InterviewSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface InterviewRepository extends JpaRepository<InterviewSession, UUID> {
    List<InterviewSession> findByUserIdOrderByCreatedAtDesc(UUID userId);
    Optional<InterviewSession> findByIdAndUserId(UUID id, UUID userId);
    long countByUserId(UUID userId);

    @Query("SELECT AVG(i.overallScore) FROM InterviewSession i WHERE i.user.id = :userId AND i.overallScore IS NOT NULL")
    Double averageScoreByUserId(UUID userId);

    @Query("SELECT i.overallScore, i.createdAt FROM InterviewSession i WHERE i.user.id = :userId AND i.overallScore IS NOT NULL ORDER BY i.createdAt ASC")
    List<Object[]> findScoresWithDatesByUserId(UUID userId);
}
