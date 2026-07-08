package com.aicopilot.repository;

import com.aicopilot.entity.JobDescription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface JobDescriptionRepository extends JpaRepository<JobDescription, UUID> {
    List<JobDescription> findByUserIdOrderByCreatedAtDesc(UUID userId);
    long countByUserId(UUID userId);

    @Query("SELECT AVG(j.matchScore) FROM JobDescription j WHERE j.user.id = :userId AND j.matchScore IS NOT NULL")
    Double averageMatchScoreByUserId(UUID userId);
}
