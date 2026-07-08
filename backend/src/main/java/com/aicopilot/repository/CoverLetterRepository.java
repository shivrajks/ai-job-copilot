package com.aicopilot.repository;

import com.aicopilot.entity.CoverLetter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CoverLetterRepository extends JpaRepository<CoverLetter, UUID> {
    List<CoverLetter> findByUserIdOrderByCreatedAtDesc(UUID userId);
    Optional<CoverLetter> findByIdAndUserId(UUID id, UUID userId);
    long countByUserId(UUID userId);
}
