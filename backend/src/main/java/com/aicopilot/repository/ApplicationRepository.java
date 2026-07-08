package com.aicopilot.repository;

import com.aicopilot.entity.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, UUID> {
    List<Application> findByUserIdOrderByCreatedAtDesc(UUID userId);
    long countByUserIdAndStageIn(UUID userId, List<Application.Stage> stages);
    long countByUserId(UUID userId);
    long countByUserIdAndCreatedAtBetween(UUID userId, LocalDateTime start, LocalDateTime end);
    long countByUserIdAndStage(UUID userId, Application.Stage stage);

    @Query("SELECT a.stage, COUNT(a) FROM Application a WHERE a.user.id = :userId GROUP BY a.stage")
    List<Object[]> countByStage(UUID userId);

    @Query("SELECT a.company, COUNT(a) FROM Application a WHERE a.user.id = :userId GROUP BY a.company ORDER BY COUNT(a) DESC")
    List<Object[]> countByCompany(UUID userId);

    @Query("SELECT a FROM Application a WHERE a.user.id = :userId ORDER BY a.createdAt DESC")
    List<Application> findRecentByUserId(UUID userId);
}
