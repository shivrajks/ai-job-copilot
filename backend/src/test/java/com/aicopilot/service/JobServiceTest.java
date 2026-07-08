package com.aicopilot.service;

import com.aicopilot.dto.JobDtos.*;
import com.aicopilot.entity.Job;
import com.aicopilot.entity.Job.*;
import com.aicopilot.entity.User;
import com.aicopilot.exception.AppException;
import com.aicopilot.repository.JobRepository;
import com.aicopilot.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JobServiceTest {

    @Mock private JobRepository jobRepository;
    @Mock private UserRepository userRepository;

    @InjectMocks
    private JobService jobService;

    private UUID userId;
    private UUID jobId;
    private User testUser;
    private Job testJob;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        jobId = UUID.randomUUID();

        testUser = User.builder()
                .id(userId)
                .email("test@example.com")
                .fullName("Test User")
                .build();

        testJob = Job.builder()
                .id(jobId)
                .user(testUser)
                .title("Software Engineer")
                .company("Acme Corp")
                .location("San Francisco")
                .status(JobStatus.SAVED)
                .priority(Priority.MEDIUM)
                .build();
    }

    @Nested
    @DisplayName("Create Job")
    class CreateJob {

        @Test
        @DisplayName("should create job successfully")
        void shouldCreateJob() {
            CreateRequest request = CreateRequest.builder()
                    .title("Software Engineer")
                    .company("Acme Corp")
                    .location("San Francisco")
                    .build();

            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(jobRepository.save(any(Job.class))).thenReturn(testJob);

            JobDetail detail = jobService.createJob(request, userId);

            assertThat(detail).isNotNull();
            assertThat(detail.getTitle()).isEqualTo("Software Engineer");
            assertThat(detail.getCompany()).isEqualTo("Acme Corp");
        }

        @Test
        @DisplayName("should detect duplicate by userId, title, company, sourceUrl")
        void shouldDetectDuplicate() {
            CreateRequest request = CreateRequest.builder()
                    .title("Software Engineer")
                    .company("Acme Corp")
                    .sourceUrl("https://example.com/job")
                    .build();

            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(jobRepository.existsByUserIdAndTitleAndCompanyAndSourceUrl(
                    userId, "Software Engineer", "Acme Corp", "https://example.com/job"))
                    .thenReturn(true);

            assertThatThrownBy(() -> jobService.createJob(request, userId))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("already exists");
        }

        @Test
        @DisplayName("should create job with same title and company but different sourceUrl")
        void shouldCreateWithDifferentSourceUrl() {
            CreateRequest request = CreateRequest.builder()
                    .title("Software Engineer")
                    .company("Acme Corp")
                    .sourceUrl("https://example.com/different")
                    .build();

            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(jobRepository.existsByUserIdAndTitleAndCompanyAndSourceUrl(
                    userId, "Software Engineer", "Acme Corp", "https://example.com/different"))
                    .thenReturn(false);
            when(jobRepository.save(any(Job.class))).thenReturn(testJob);

            JobDetail detail = jobService.createJob(request, userId);

            assertThat(detail).isNotNull();
        }

        @Test
        @DisplayName("should skip duplicate check when sourceUrl is blank")
        void shouldSkipDuplicateCheckWhenNoSourceUrl() {
            CreateRequest request = CreateRequest.builder()
                    .title("Software Engineer")
                    .company("Acme Corp")
                    .build();

            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(jobRepository.save(any(Job.class))).thenReturn(testJob);

            JobDetail detail = jobService.createJob(request, userId);

            assertThat(detail).isNotNull();
            verify(jobRepository, never()).existsByUserIdAndTitleAndCompanyAndSourceUrl(any(), any(), any(), any());
        }

        @Test
        @DisplayName("should handle all job fields in creation")
        void shouldHandleAllFields() {
            CreateRequest request = CreateRequest.builder()
                    .title("Senior Engineer")
                    .company("Tech Co")
                    .location("Remote")
                    .employmentType("FULL_TIME")
                    .workMode("REMOTE")
                    .salaryMin(120000)
                    .salaryMax(180000)
                    .description("Great role")
                    .skillsRequired(List.of("Java", "Spring"))
                    .experienceRequired("5+ years")
                    .source("LINKEDIN")
                    .sourceUrl("https://linkedin.com/job/123")
                    .notes("Interesting")
                    .priority("HIGH")
                    .status("SAVED")
                    .deadline(LocalDate.now().plusDays(30))
                    .build();

            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(jobRepository.save(any(Job.class))).thenReturn(testJob);

            JobDetail detail = jobService.createJob(request, userId);

            assertThat(detail).isNotNull();
        }

        @Test
        @DisplayName("should throw when user not found")
        void shouldThrowWhenUserNotFound() {
            CreateRequest request = CreateRequest.builder()
                    .title("Engineer")
                    .company("Acme")
                    .build();

            when(userRepository.findById(userId)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> jobService.createJob(request, userId))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("User not found");
        }
    }

    @Nested
    @DisplayName("List Jobs")
    class ListJobs {

        @Test
        @DisplayName("should return paginated jobs")
        void shouldReturnPaginatedJobs() {
            Page<Job> jobPage = new PageImpl<>(List.of(testJob));

            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(jobRepository.findAll(any(Specification.class), any(Pageable.class)))
                    .thenReturn(jobPage);

            Page<JobListItem> result = jobService.listUserJobs(userId, null, null, null,
                    null, null, null, null, null,
                    null, null, 0, 20, null, null);

            assertThat(result).hasSize(1);
            assertThat(result.getContent().get(0).getTitle()).isEqualTo("Software Engineer");
        }

        @Test
        @DisplayName("should return empty page when no jobs")
        void shouldReturnEmptyWhenNoJobs() {
            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(jobRepository.findAll(any(Specification.class), any(Pageable.class)))
                    .thenReturn(Page.empty());

            Page<JobListItem> result = jobService.listUserJobs(userId, null, null, null,
                    null, null, null, null, null,
                    null, null, 0, 20, null, null);

            assertThat(result).isEmpty();
        }

        @Test
        @DisplayName("should throw when user not found")
        void shouldThrowWhenUserNotFound() {
            when(userRepository.findById(userId)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> jobService.listUserJobs(userId, null, null, null,
                    null, null, null, null, null,
                    null, null, 0, 20, null, null))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("User not found");
        }

        @Test
        @DisplayName("should validate page size")
        void shouldValidatePageSize() {
            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));

            assertThatThrownBy(() -> jobService.listUserJobs(userId, null, null, null,
                    null, null, null, null, null,
                    null, null, 0, 200, null, null))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("Page size");
        }
    }

    @Nested
    @DisplayName("Get Job")
    class GetJob {

        @Test
        @DisplayName("should return job detail for owner")
        void shouldReturnForOwner() {
            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(jobRepository.findById(jobId)).thenReturn(Optional.of(testJob));

            JobDetail detail = jobService.getJob(userId, jobId);

            assertThat(detail).isNotNull();
            assertThat(detail.getTitle()).isEqualTo("Software Engineer");
        }

        @Test
        @DisplayName("should throw for non-owner")
        void shouldThrowForNonOwner() {
            UUID otherUserId = UUID.randomUUID();
            when(userRepository.findById(otherUserId)).thenReturn(Optional.of(
                    User.builder().id(otherUserId).email("other@example.com").build()));
            when(jobRepository.findById(jobId)).thenReturn(Optional.of(testJob));

            assertThatThrownBy(() -> jobService.getJob(otherUserId, jobId))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("Access denied");
        }

        @Test
        @DisplayName("should throw when job not found")
        void shouldThrowWhenNotFound() {
            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(jobRepository.findById(jobId)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> jobService.getJob(userId, jobId))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("Job not found");
        }

        @Test
        @DisplayName("should throw when user not found")
        void shouldThrowWhenUserNotFound() {
            when(userRepository.findById(userId)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> jobService.getJob(userId, jobId))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("User not found");
        }
    }

    @Nested
    @DisplayName("Update Job")
    class UpdateJob {

        @Test
        @DisplayName("should update job successfully")
        void shouldUpdateJob() {
            UpdateRequest request = UpdateRequest.builder()
                    .title("Senior Engineer")
                    .company("New Corp")
                    .location("Remote")
                    .build();

            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(jobRepository.findById(jobId)).thenReturn(Optional.of(testJob));
            when(jobRepository.save(any(Job.class))).thenReturn(testJob);

            JobDetail detail = jobService.updateJob(userId, jobId, request);

            assertThat(detail).isNotNull();
            assertThat(testJob.getTitle()).isEqualTo("Senior Engineer");
            assertThat(testJob.getCompany()).isEqualTo("New Corp");
        }

        @Test
        @DisplayName("should set appliedDate when provided in update")
        void shouldSetAppliedDate() {
            UpdateRequest request = UpdateRequest.builder()
                    .title("Engineer")
                    .company("Acme")
                    .status("APPLIED")
                    .appliedDate(LocalDate.now())
                    .build();

            testJob.setAppliedDate(null);

            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(jobRepository.findById(jobId)).thenReturn(Optional.of(testJob));
            when(jobRepository.save(any(Job.class))).thenReturn(testJob);

            jobService.updateJob(userId, jobId, request);

            assertThat(testJob.getStatus()).isEqualTo(JobStatus.APPLIED);
            assertThat(testJob.getAppliedDate()).isEqualTo(LocalDate.now());
        }

        @Test
        @DisplayName("should enforce ownership")
        void shouldEnforceOwnership() {
            UUID otherUserId = UUID.randomUUID();
            UpdateRequest request = UpdateRequest.builder()
                    .title("Engineer")
                    .company("Acme")
                    .build();

            when(userRepository.findById(otherUserId)).thenReturn(Optional.of(
                    User.builder().id(otherUserId).build()));
            when(jobRepository.findById(jobId)).thenReturn(Optional.of(testJob));

            assertThatThrownBy(() -> jobService.updateJob(otherUserId, jobId, request))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("Access denied");
        }

        @Test
        @DisplayName("should throw when job not found")
        void shouldThrowWhenJobNotFound() {
            UpdateRequest request = UpdateRequest.builder()
                    .title("Engineer")
                    .company("Acme")
                    .build();

            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(jobRepository.findById(jobId)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> jobService.updateJob(userId, jobId, request))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("Job not found");
        }
    }

    @Nested
    @DisplayName("Update Job Status")
    class UpdateJobStatus {

        @Test
        @DisplayName("should update status successfully")
        void shouldUpdateStatus() {
            StatusUpdateRequest request = new StatusUpdateRequest("APPLIED", null);

            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(jobRepository.findById(jobId)).thenReturn(Optional.of(testJob));
            when(jobRepository.save(any(Job.class))).thenReturn(testJob);

            JobDetail detail = jobService.updateJobStatus(userId, jobId, request);

            assertThat(detail).isNotNull();
            assertThat(testJob.getStatus()).isEqualTo(JobStatus.APPLIED);
        }

        @Test
        @DisplayName("should auto-set appliedDate when transitioning to APPLIED")
        void shouldAutoSetAppliedDate() {
            StatusUpdateRequest request = new StatusUpdateRequest("APPLIED", null);
            testJob.setStatus(JobStatus.SAVED);
            testJob.setAppliedDate(null);

            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(jobRepository.findById(jobId)).thenReturn(Optional.of(testJob));
            when(jobRepository.save(any(Job.class))).thenReturn(testJob);

            jobService.updateJobStatus(userId, jobId, request);

            assertThat(testJob.getAppliedDate()).isEqualTo(LocalDate.now());
        }

        @Test
        @DisplayName("should set rejection reason when status is REJECTED")
        void shouldSetRejectionReason() {
            StatusUpdateRequest request = new StatusUpdateRequest("REJECTED", "Not a fit");

            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(jobRepository.findById(jobId)).thenReturn(Optional.of(testJob));
            when(jobRepository.save(any(Job.class))).thenReturn(testJob);

            jobService.updateJobStatus(userId, jobId, request);

            assertThat(testJob.getStatus()).isEqualTo(JobStatus.REJECTED);
            assertThat(testJob.getRejectionReason()).isEqualTo("Not a fit");
        }

        @Test
        @DisplayName("should throw for invalid status")
        void shouldThrowForInvalidStatus() {
            StatusUpdateRequest request = new StatusUpdateRequest("INVALID", null);

            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(jobRepository.findById(jobId)).thenReturn(Optional.of(testJob));

            assertThatThrownBy(() -> jobService.updateJobStatus(userId, jobId, request))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("Invalid status");
        }

        @Test
        @DisplayName("should enforce ownership")
        void shouldEnforceOwnership() {
            UUID otherUserId = UUID.randomUUID();
            StatusUpdateRequest request = new StatusUpdateRequest("APPLIED", null);

            when(userRepository.findById(otherUserId)).thenReturn(Optional.of(
                    User.builder().id(otherUserId).build()));
            when(jobRepository.findById(jobId)).thenReturn(Optional.of(testJob));

            assertThatThrownBy(() -> jobService.updateJobStatus(otherUserId, jobId, request))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("Access denied");
        }
    }

    @Nested
    @DisplayName("Toggle Favorite")
    class ToggleFavorite {

        @Test
        @DisplayName("should set favorite to true")
        void shouldSetFavoriteTrue() {
            FavoriteRequest request = new FavoriteRequest(true);

            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(jobRepository.findById(jobId)).thenReturn(Optional.of(testJob));
            when(jobRepository.save(any(Job.class))).thenReturn(testJob);

            JobDetail detail = jobService.toggleFavorite(userId, jobId, request);

            assertThat(detail).isNotNull();
            assertThat(testJob.isFavorite()).isTrue();
        }

        @Test
        @DisplayName("should set favorite to false")
        void shouldSetFavoriteFalse() {
            testJob.setFavorite(true);
            FavoriteRequest request = new FavoriteRequest(false);

            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(jobRepository.findById(jobId)).thenReturn(Optional.of(testJob));
            when(jobRepository.save(any(Job.class))).thenReturn(testJob);

            JobDetail detail = jobService.toggleFavorite(userId, jobId, request);

            assertThat(detail).isNotNull();
            assertThat(testJob.isFavorite()).isFalse();
        }

        @Test
        @DisplayName("should enforce ownership")
        void shouldEnforceOwnership() {
            UUID otherUserId = UUID.randomUUID();
            FavoriteRequest request = new FavoriteRequest(true);

            when(userRepository.findById(otherUserId)).thenReturn(Optional.of(
                    User.builder().id(otherUserId).build()));
            when(jobRepository.findById(jobId)).thenReturn(Optional.of(testJob));

            assertThatThrownBy(() -> jobService.toggleFavorite(otherUserId, jobId, request))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("Access denied");
        }
    }

    @Nested
    @DisplayName("Toggle Archive")
    class ToggleArchive {

        @Test
        @DisplayName("should set archived to true")
        void shouldSetArchivedTrue() {
            ArchiveRequest request = new ArchiveRequest(true);

            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(jobRepository.findById(jobId)).thenReturn(Optional.of(testJob));
            when(jobRepository.save(any(Job.class))).thenReturn(testJob);

            JobDetail detail = jobService.toggleArchive(userId, jobId, request);

            assertThat(detail).isNotNull();
            assertThat(testJob.isArchived()).isTrue();
        }

        @Test
        @DisplayName("should set archived to false")
        void shouldSetArchivedFalse() {
            testJob.setArchived(true);
            ArchiveRequest request = new ArchiveRequest(false);

            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(jobRepository.findById(jobId)).thenReturn(Optional.of(testJob));
            when(jobRepository.save(any(Job.class))).thenReturn(testJob);

            JobDetail detail = jobService.toggleArchive(userId, jobId, request);

            assertThat(detail).isNotNull();
            assertThat(testJob.isArchived()).isFalse();
        }

        @Test
        @DisplayName("should enforce ownership")
        void shouldEnforceOwnership() {
            UUID otherUserId = UUID.randomUUID();
            ArchiveRequest request = new ArchiveRequest(true);

            when(userRepository.findById(otherUserId)).thenReturn(Optional.of(
                    User.builder().id(otherUserId).build()));
            when(jobRepository.findById(jobId)).thenReturn(Optional.of(testJob));

            assertThatThrownBy(() -> jobService.toggleArchive(otherUserId, jobId, request))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("Access denied");
        }
    }

    @Nested
    @DisplayName("Delete Job")
    class DeleteJob {

        @Test
        @DisplayName("should delete job successfully")
        void shouldDeleteJob() {
            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(jobRepository.findById(jobId)).thenReturn(Optional.of(testJob));

            jobService.deleteJob(userId, jobId);

            verify(jobRepository).delete(testJob);
        }

        @Test
        @DisplayName("should enforce ownership on delete")
        void shouldEnforceOwnership() {
            UUID otherUserId = UUID.randomUUID();
            when(userRepository.findById(otherUserId)).thenReturn(Optional.of(
                    User.builder().id(otherUserId).build()));
            when(jobRepository.findById(jobId)).thenReturn(Optional.of(testJob));

            assertThatThrownBy(() -> jobService.deleteJob(otherUserId, jobId))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("Access denied");
        }

        @Test
        @DisplayName("should throw when job not found")
        void shouldThrowWhenNotFound() {
            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(jobRepository.findById(jobId)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> jobService.deleteJob(userId, jobId))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("Job not found");
        }
    }

    @Nested
    @DisplayName("Job Stats")
    class GetJobStats {

        @Test
        @DisplayName("should aggregate counts by status")
        void shouldAggregateCounts() {
            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(jobRepository.countByStatus(userId)).thenReturn(List.of(
                    new Object[]{JobStatus.SAVED, 5L},
                    new Object[]{JobStatus.APPLIED, 3L},
                    new Object[]{JobStatus.PHONE_SCREEN, 2L},
                    new Object[]{JobStatus.OFFER, 1L},
                    new Object[]{JobStatus.ACCEPTED, 1L},
                    new Object[]{JobStatus.REJECTED, 4L},
                    new Object[]{JobStatus.WITHDRAWN, 1L}
            ));
            when(jobRepository.countByUserIdAndIsArchivedTrue(userId)).thenReturn(3L);
            when(jobRepository.countByUserIdAndIsFavoriteTrue(userId)).thenReturn(7L);

            JobStats stats = jobService.getJobStats(userId);

            assertThat(stats.getTotal()).isEqualTo(17);
            assertThat(stats.getSaved()).isEqualTo(5);
            assertThat(stats.getApplied()).isEqualTo(3);
            assertThat(stats.getInterviewing()).isEqualTo(2);
            assertThat(stats.getOffers()).isEqualTo(1);
            assertThat(stats.getAccepted()).isEqualTo(1);
            assertThat(stats.getRejected()).isEqualTo(4);
            assertThat(stats.getWithdrawn()).isEqualTo(1);
            assertThat(stats.getArchived()).isEqualTo(3);
            assertThat(stats.getFavorites()).isEqualTo(7);
        }

        @Test
        @DisplayName("should return zeros when no jobs")
        void shouldReturnZerosWhenNoJobs() {
            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(jobRepository.countByStatus(userId)).thenReturn(List.of());
            when(jobRepository.countByUserIdAndIsArchivedTrue(userId)).thenReturn(0L);
            when(jobRepository.countByUserIdAndIsFavoriteTrue(userId)).thenReturn(0L);

            JobStats stats = jobService.getJobStats(userId);

            assertThat(stats.getTotal()).isEqualTo(0);
            assertThat(stats.getSaved()).isEqualTo(0);
            assertThat(stats.getApplied()).isEqualTo(0);
            assertThat(stats.getInterviewing()).isEqualTo(0);
            assertThat(stats.getOffers()).isEqualTo(0);
            assertThat(stats.getAccepted()).isEqualTo(0);
            assertThat(stats.getRejected()).isEqualTo(0);
            assertThat(stats.getWithdrawn()).isEqualTo(0);
        }
    }
}
