package com.aicopilot.repository;

import com.aicopilot.entity.Job;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface JobRepository extends JpaRepository<Job, UUID>, JpaSpecificationExecutor<Job> {
    List<Job> findByUserIdOrderByCreatedAtDesc(UUID userId);
    long countByUserId(UUID userId);
    long countByUserIdAndStatus(UUID userId, Job.JobStatus status);
    long countByUserIdAndIsArchivedTrue(UUID userId);
    long countByUserIdAndIsFavoriteTrue(UUID userId);
    boolean existsByUserIdAndTitleAndCompanyAndSourceUrl(UUID userId, String title, String company, String sourceUrl);

    @Query("SELECT j.status, COUNT(j) FROM Job j WHERE j.user.id = :userId GROUP BY j.status")
    List<Object[]> countByStatus(UUID userId);
}
