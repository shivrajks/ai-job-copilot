package com.aicopilot.repository;

import com.aicopilot.entity.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ApplicationRepository extends JpaRepository<Application, UUID> {
    List<Application> findByUserIdOrderByCreatedAtDesc(UUID userId);
    long countByUserIdAndStageIn(UUID userId, List<Application.Stage> stages);
}
