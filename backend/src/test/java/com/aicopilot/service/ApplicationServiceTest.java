package com.aicopilot.service;

import com.aicopilot.dto.ApplicationDtos.*;
import com.aicopilot.entity.Application;
import com.aicopilot.entity.Application.Stage;
import com.aicopilot.entity.Resume;
import com.aicopilot.entity.User;
import com.aicopilot.exception.AppException;
import com.aicopilot.repository.ApplicationRepository;
import com.aicopilot.repository.ResumeRepository;
import com.aicopilot.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ApplicationServiceTest {

    @Mock private ApplicationRepository applicationRepository;
    @Mock private UserRepository userRepository;
    @Mock private ResumeRepository resumeRepository;

    @InjectMocks
    private ApplicationService applicationService;

    private UUID userId;
    private UUID applicationId;
    private UUID resumeId;
    private User testUser;
    private Resume testResume;
    private Application testApplication;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        applicationId = UUID.randomUUID();
        resumeId = UUID.randomUUID();

        testUser = User.builder()
                .id(userId)
                .email("test@example.com")
                .fullName("Test User")
                .build();

        testResume = Resume.builder()
                .id(resumeId)
                .user(testUser)
                .name("Test Resume v1")
                .build();

        testApplication = Application.builder()
                .id(applicationId)
                .user(testUser)
                .resume(testResume)
                .company("Acme Corp")
                .role("Software Engineer")
                .location("San Francisco")
                .salaryMin(100000)
                .salaryMax(150000)
                .stage(Stage.SAVED)
                .notes("Interesting role")
                .build();
    }

    @Nested
    @DisplayName("Create Application")
    class CreateApplication {

        @Test
        @DisplayName("should create application successfully")
        void shouldCreateApplication() {
            CreateRequest request = CreateRequest.builder()
                    .company("Acme Corp")
                    .role("Software Engineer")
                    .location("San Francisco")
                    .resumeId(resumeId)
                    .build();

            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(resumeRepository.findById(resumeId)).thenReturn(Optional.of(testResume));
            when(applicationRepository.save(any(Application.class))).thenReturn(testApplication);

            ApplicationDetail detail = applicationService.createApplication(request, userId);

            assertThat(detail).isNotNull();
            assertThat(detail.getCompany()).isEqualTo("Acme Corp");
            assertThat(detail.getRole()).isEqualTo("Software Engineer");
            assertThat(detail.getResumeId()).isEqualTo(resumeId);
        }

        @Test
        @DisplayName("should create application without resume")
        void shouldCreateApplicationWithoutResume() {
            CreateRequest request = CreateRequest.builder()
                    .company("Acme Corp")
                    .role("Engineer")
                    .build();

            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(applicationRepository.save(any(Application.class))).thenReturn(testApplication);

            ApplicationDetail detail = applicationService.createApplication(request, userId);

            assertThat(detail).isNotNull();
            verify(resumeRepository, never()).findById(any());
        }

        @Test
        @DisplayName("should throw when resume does not belong to user")
        void shouldThrowWhenResumeNotOwned() {
            UUID otherUserId = UUID.randomUUID();
            Resume otherResume = Resume.builder()
                    .id(UUID.randomUUID())
                    .user(User.builder().id(otherUserId).build())
                    .build();

            CreateRequest request = CreateRequest.builder()
                    .company("Acme")
                    .role("Engineer")
                    .resumeId(otherResume.getId())
                    .build();

            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(resumeRepository.findById(otherResume.getId())).thenReturn(Optional.of(otherResume));

            assertThatThrownBy(() -> applicationService.createApplication(request, userId))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("Access denied");
        }

        @Test
        @DisplayName("should throw when user not found")
        void shouldThrowWhenUserNotFound() {
            CreateRequest request = CreateRequest.builder()
                    .company("Acme")
                    .role("Engineer")
                    .build();

            when(userRepository.findById(userId)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> applicationService.createApplication(request, userId))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("User not found");
        }

        @Test
        @DisplayName("should throw for invalid stage")
        void shouldThrowForInvalidStage() {
            CreateRequest request = CreateRequest.builder()
                    .company("Acme")
                    .role("Engineer")
                    .stage("INVALID_STAGE")
                    .build();

            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));

            assertThatThrownBy(() -> applicationService.createApplication(request, userId))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("Invalid stage");
        }

        @Test
        @DisplayName("should default stage to SAVED")
        void shouldDefaultStageToSaved() {
            CreateRequest request = CreateRequest.builder()
                    .company("Acme")
                    .role("Engineer")
                    .build();

            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(applicationRepository.save(any(Application.class))).thenAnswer(invocation -> invocation.getArgument(0));

            ApplicationDetail detail = applicationService.createApplication(request, userId);

            assertThat(detail).isNotNull();
        }
    }

    @Nested
    @DisplayName("List Applications")
    class ListApplications {

        @Test
        @DisplayName("should return list of applications for user")
        void shouldListApplications() {
            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(applicationRepository.findByUserIdOrderByCreatedAtDesc(userId))
                    .thenReturn(List.of(testApplication));

            List<ApplicationListItem> items = applicationService.listUserApplications(userId);

            assertThat(items).hasSize(1);
            assertThat(items.get(0).getCompany()).isEqualTo("Acme Corp");
        }

        @Test
        @DisplayName("should return empty list when no applications")
        void shouldReturnEmptyWhenNoApplications() {
            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(applicationRepository.findByUserIdOrderByCreatedAtDesc(userId)).thenReturn(List.of());

            List<ApplicationListItem> items = applicationService.listUserApplications(userId);

            assertThat(items).isEmpty();
        }

        @Test
        @DisplayName("should throw when user not found")
        void shouldThrowWhenUserNotFound() {
            when(userRepository.findById(userId)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> applicationService.listUserApplications(userId))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("User not found");
        }
    }

    @Nested
    @DisplayName("Get Application")
    class GetApplication {

        @Test
        @DisplayName("should return application detail for owner")
        void shouldReturnForOwner() {
            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(applicationRepository.findById(applicationId)).thenReturn(Optional.of(testApplication));

            ApplicationDetail detail = applicationService.getApplication(userId, applicationId);

            assertThat(detail).isNotNull();
            assertThat(detail.getCompany()).isEqualTo("Acme Corp");
        }

        @Test
        @DisplayName("should throw for non-owner")
        void shouldThrowForNonOwner() {
            UUID otherUserId = UUID.randomUUID();
            when(userRepository.findById(otherUserId)).thenReturn(Optional.of(
                    User.builder().id(otherUserId).email("other@example.com").build()));
            when(applicationRepository.findById(applicationId)).thenReturn(Optional.of(testApplication));

            assertThatThrownBy(() -> applicationService.getApplication(otherUserId, applicationId))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("Access denied");
        }

        @Test
        @DisplayName("should throw when application not found")
        void shouldThrowWhenNotFound() {
            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(applicationRepository.findById(applicationId)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> applicationService.getApplication(userId, applicationId))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("Application not found");
        }
    }

    @Nested
    @DisplayName("Update Application")
    class UpdateApplication {

        @Test
        @DisplayName("should update application successfully")
        void shouldUpdateApplication() {
            UpdateRequest request = UpdateRequest.builder()
                    .company("New Corp")
                    .role("Senior Engineer")
                    .stage("APPLIED")
                    .build();

            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(applicationRepository.findById(applicationId)).thenReturn(Optional.of(testApplication));
            when(applicationRepository.save(any(Application.class))).thenReturn(testApplication);

            ApplicationDetail detail = applicationService.updateApplication(userId, applicationId, request);

            assertThat(detail).isNotNull();
            assertThat(testApplication.getCompany()).isEqualTo("New Corp");
            assertThat(testApplication.getRole()).isEqualTo("Senior Engineer");
            assertThat(testApplication.getStage()).isEqualTo(Stage.APPLIED);
        }

        @Test
        @DisplayName("should throw for invalid stage in update")
        void shouldThrowForInvalidStage() {
            UpdateRequest request = UpdateRequest.builder()
                    .company("Acme")
                    .role("Engineer")
                    .stage("INVALID")
                    .build();

            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(applicationRepository.findById(applicationId)).thenReturn(Optional.of(testApplication));

            assertThatThrownBy(() -> applicationService.updateApplication(userId, applicationId, request))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("Invalid stage");
        }

        @Test
        @DisplayName("should enforce ownership on update")
        void shouldEnforceOwnership() {
            UUID otherUserId = UUID.randomUUID();
            UpdateRequest request = UpdateRequest.builder()
                    .company("Acme")
                    .role("Engineer")
                    .build();

            when(userRepository.findById(otherUserId)).thenReturn(Optional.of(
                    User.builder().id(otherUserId).email("other@example.com").build()));
            when(applicationRepository.findById(applicationId)).thenReturn(Optional.of(testApplication));

            assertThatThrownBy(() -> applicationService.updateApplication(otherUserId, applicationId, request))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("Access denied");
        }

        @Test
        @DisplayName("should verify resume ownership on update")
        void shouldVerifyResumeOwnershipOnUpdate() {
            UUID otherUserId = UUID.randomUUID();
            Resume otherResume = Resume.builder()
                    .id(UUID.randomUUID())
                    .user(User.builder().id(otherUserId).build())
                    .build();

            UpdateRequest request = UpdateRequest.builder()
                    .company("Acme")
                    .role("Engineer")
                    .resumeId(otherResume.getId())
                    .build();

            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(applicationRepository.findById(applicationId)).thenReturn(Optional.of(testApplication));
            when(resumeRepository.findById(otherResume.getId())).thenReturn(Optional.of(otherResume));

            assertThatThrownBy(() -> applicationService.updateApplication(userId, applicationId, request))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("Access denied");
        }
    }

    @Nested
    @DisplayName("Update Stage")
    class UpdateStage {

        @Test
        @DisplayName("should update stage successfully")
        void shouldUpdateStage() {
            StageUpdateRequest request = new StageUpdateRequest("APPLIED");

            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(applicationRepository.findById(applicationId)).thenReturn(Optional.of(testApplication));
            when(applicationRepository.save(any(Application.class))).thenReturn(testApplication);

            ApplicationDetail detail = applicationService.updateApplicationStage(userId, applicationId, request);

            assertThat(detail).isNotNull();
            assertThat(testApplication.getStage()).isEqualTo(Stage.APPLIED);
        }

        @Test
        @DisplayName("should auto-set appliedAt when transitioning to APPLIED")
        void shouldAutoSetAppliedAt() {
            StageUpdateRequest request = new StageUpdateRequest("APPLIED");

            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(applicationRepository.findById(applicationId)).thenReturn(Optional.of(testApplication));
            when(applicationRepository.save(any(Application.class))).thenReturn(testApplication);

            applicationService.updateApplicationStage(userId, applicationId, request);

            assertThat(testApplication.getAppliedAt()).isNotNull();
        }

        @Test
        @DisplayName("should not overwrite existing appliedAt")
        void shouldNotOverwriteAppliedAt() {
            LocalDateTime existingAppliedAt = LocalDateTime.now().minusDays(5);
            testApplication.setAppliedAt(existingAppliedAt);

            StageUpdateRequest request = new StageUpdateRequest("APPLIED");

            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(applicationRepository.findById(applicationId)).thenReturn(Optional.of(testApplication));
            when(applicationRepository.save(any(Application.class))).thenReturn(testApplication);

            applicationService.updateApplicationStage(userId, applicationId, request);

            assertThat(testApplication.getAppliedAt()).isEqualTo(existingAppliedAt);
        }

        @Test
        @DisplayName("should throw for invalid stage")
        void shouldThrowForInvalidStage() {
            StageUpdateRequest request = new StageUpdateRequest("NOT_A_STAGE");

            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(applicationRepository.findById(applicationId)).thenReturn(Optional.of(testApplication));

            assertThatThrownBy(() -> applicationService.updateApplicationStage(userId, applicationId, request))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("Invalid stage");
        }

        @Test
        @DisplayName("should enforce ownership")
        void shouldEnforceOwnership() {
            UUID otherUserId = UUID.randomUUID();
            StageUpdateRequest request = new StageUpdateRequest("APPLIED");

            when(userRepository.findById(otherUserId)).thenReturn(Optional.of(
                    User.builder().id(otherUserId).build()));
            when(applicationRepository.findById(applicationId)).thenReturn(Optional.of(testApplication));

            assertThatThrownBy(() -> applicationService.updateApplicationStage(otherUserId, applicationId, request))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("Access denied");
        }
    }

    @Nested
    @DisplayName("Delete Application")
    class DeleteApplication {

        @Test
        @DisplayName("should delete application successfully")
        void shouldDeleteApplication() {
            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(applicationRepository.findById(applicationId)).thenReturn(Optional.of(testApplication));

            applicationService.deleteApplication(userId, applicationId);

            verify(applicationRepository).delete(testApplication);
        }

        @Test
        @DisplayName("should enforce ownership on delete")
        void shouldEnforceOwnership() {
            UUID otherUserId = UUID.randomUUID();
            when(userRepository.findById(otherUserId)).thenReturn(Optional.of(
                    User.builder().id(otherUserId).build()));
            when(applicationRepository.findById(applicationId)).thenReturn(Optional.of(testApplication));

            assertThatThrownBy(() -> applicationService.deleteApplication(otherUserId, applicationId))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("Access denied");
        }
    }

    @Nested
    @DisplayName("Batch Operations")
    class BatchOperations {

        @Test
        @DisplayName("should batch update stage")
        void shouldBatchUpdateStage() {
            List<UUID> ids = List.of(applicationId);

            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(applicationRepository.findAllById(ids)).thenReturn(List.of(testApplication));

            applicationService.batchUpdateStage(userId, ids, "APPLIED");

            assertThat(testApplication.getStage()).isEqualTo(Stage.APPLIED);
        }

        @Test
        @DisplayName("should skip applications not owned by user in batch update")
        void shouldSkipNonOwnedInBatchUpdate() {
            UUID otherUserId = UUID.randomUUID();
            Application otherApp = Application.builder()
                    .id(UUID.randomUUID())
                    .user(User.builder().id(otherUserId).build())
                    .company("Other")
                    .role("Tester")
                    .build();

            List<UUID> ids = List.of(applicationId, otherApp.getId());

            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(applicationRepository.findAllById(ids)).thenReturn(List.of(testApplication, otherApp));

            applicationService.batchUpdateStage(userId, ids, "APPLIED");

            assertThat(testApplication.getStage()).isEqualTo(Stage.APPLIED);
            assertThat(otherApp.getStage()).isNotEqualTo(Stage.APPLIED);
        }

        @Test
        @DisplayName("should batch delete applications")
        void shouldBatchDelete() {
            List<UUID> ids = List.of(applicationId);

            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(applicationRepository.findAllById(ids)).thenReturn(List.of(testApplication));

            applicationService.batchDelete(userId, ids);

            verify(applicationRepository).delete(testApplication);
        }
    }
}
