package com.aicopilot.service;

import com.aicopilot.ai.parser.RuleBasedResumeParser;
import com.aicopilot.ai.parser.TikaResumeParser;
import com.aicopilot.ai.service.AiService;
import com.aicopilot.dto.ResumeDtos.*;
import com.aicopilot.entity.Resume;
import com.aicopilot.entity.Resume.ParsingStatus;
import com.aicopilot.entity.User;
import com.aicopilot.exception.AppException;
import com.aicopilot.repository.ApplicationRepository;
import com.aicopilot.repository.ResumeRepository;
import com.aicopilot.repository.UserRepository;
import com.aicopilot.service.file.FileStorageService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ResumeServiceTest {

    @Mock private ResumeRepository resumeRepository;
    @Mock private UserRepository userRepository;
    @Mock private FileStorageService fileStorageService;
    @Mock private ApplicationRepository applicationRepository;
    @Mock private AiService aiService;
    @Mock private TikaResumeParser tikaResumeParser;
    @Mock private RuleBasedResumeParser ruleBasedResumeParser;

    @InjectMocks
    private ResumeService resumeService;

    private UUID userId;
    private UUID resumeId;
    private User testUser;
    private Resume testResume;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        resumeId = UUID.randomUUID();

        testUser = User.builder()
                .id(userId)
                .email("test@example.com")
                .fullName("Test User")
                .build();

        testResume = Resume.builder()
                .id(resumeId)
                .user(testUser)
                .name("Test Resume (v1)")
                .originalFileUrl("/uploads/test.pdf")
                .parsingStatus(ParsingStatus.PENDING)
                .isActive(true)
                .fileSize(1024L)
                .mimeType("application/pdf")
                .versionNum(1)
                .build();
    }

    @Nested
    @DisplayName("Upload Resume")
    class UploadResume {

        @Test
        @DisplayName("should upload a valid PDF resume successfully")
        void shouldUploadValidPdf() throws IOException {
            byte[] pdfContent = createPdfBytes();
            MultipartFile file = new MockMultipartFile(
                    "file", "resume.pdf", MediaType.APPLICATION_PDF_VALUE, pdfContent);

            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(resumeRepository.findByUserIdOrderByCreatedAtDesc(userId)).thenReturn(List.of());
            when(fileStorageService.store(any(MultipartFile.class), anyString())).thenReturn("/uploads/test.pdf");
            when(resumeRepository.save(any(Resume.class))).thenReturn(testResume);

            UploadResponse response = resumeService.uploadResume(file, userId);

            assertThat(response).isNotNull();
            assertThat(response.getStatus()).isEqualTo("PENDING");
            assertThat(response.getMessage()).contains("successfully");

            ArgumentCaptor<Resume> captor = ArgumentCaptor.forClass(Resume.class);
            verify(resumeRepository).save(captor.capture());
            Resume saved = captor.getValue();
            assertThat(saved.getUser().getId()).isEqualTo(userId);
            assertThat(saved.getMimeType()).isEqualTo("application/pdf");
            assertThat(saved.getIsActive()).isTrue();
        }

        @Test
        @DisplayName("should throw when file is null")
        void shouldThrowWhenFileIsNull() {
            assertThatThrownBy(() -> resumeService.uploadResume(null, userId))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("File is required");
        }

        @Test
        @DisplayName("should throw when file is empty")
        void shouldThrowWhenFileIsEmpty() {
            MultipartFile empty = new MockMultipartFile("file", "empty.pdf", MediaType.APPLICATION_PDF_VALUE, new byte[0]);

            assertThatThrownBy(() -> resumeService.uploadResume(empty, userId))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("File is required");
        }

        @Test
        @DisplayName("should throw when file exceeds size limit")
        void shouldThrowWhenFileTooLarge() {
            byte[] oversized = new byte[6 * 1024 * 1024];
            MultipartFile large = new MockMultipartFile("file", "large.pdf", MediaType.APPLICATION_PDF_VALUE, oversized);

            assertThatThrownBy(() -> resumeService.uploadResume(large, userId))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("5MB");
        }

        @Test
        @DisplayName("should throw when file type is not PDF or DOCX")
        void shouldThrowForUnsupportedType() {
            MultipartFile txt = new MockMultipartFile("file", "resume.txt", MediaType.TEXT_PLAIN_VALUE, "text".getBytes());

            assertThatThrownBy(() -> resumeService.uploadResume(txt, userId))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("Only PDF and DOCX");
        }

        @Test
        @DisplayName("should throw when user not found")
        void shouldThrowWhenUserNotFound() {
            byte[] pdfContent = createPdfBytes();
            MultipartFile file = new MockMultipartFile("file", "resume.pdf", MediaType.APPLICATION_PDF_VALUE, pdfContent);

            when(userRepository.findById(userId)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> resumeService.uploadResume(file, userId))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("User not found");
        }

        @Test
        @DisplayName("should throw when file header does not match magic bytes")
        void shouldThrowForInvalidMagicBytes() {
            byte[] invalidContent = "Not a valid PDF content".getBytes();
            MultipartFile file = new MockMultipartFile(
                    "file", "fake.pdf", MediaType.APPLICATION_PDF_VALUE, invalidContent);

            assertThatThrownBy(() -> resumeService.uploadResume(file, userId))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("not a valid PDF");
        }

        @Test
        @DisplayName("should assign version number based on existing resumes")
        void shouldAssignVersionNumber() throws IOException {
            byte[] pdfContent = createPdfBytes();
            MultipartFile file = new MockMultipartFile(
                    "file", "resume.pdf", MediaType.APPLICATION_PDF_VALUE, pdfContent);

            Resume existingV1 = Resume.builder()
                    .id(UUID.randomUUID())
                    .user(testUser)
                    .name("Old Resume (v1)")
                    .versionNum(1)
                    .isActive(true)
                    .build();

            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(resumeRepository.findByUserIdOrderByCreatedAtDesc(userId)).thenReturn(List.of(existingV1));
            when(fileStorageService.store(any(MultipartFile.class), anyString())).thenReturn("/uploads/test.pdf");

            Resume newResume = Resume.builder()
                    .id(UUID.randomUUID())
                    .user(testUser)
                    .name("resume (v2)")
                    .versionNum(2)
                    .build();
            when(resumeRepository.save(any(Resume.class))).thenReturn(newResume);

            UploadResponse response = resumeService.uploadResume(file, userId);

            assertThat(response).isNotNull();

            ArgumentCaptor<Resume> captor = ArgumentCaptor.forClass(Resume.class);
            verify(resumeRepository, atLeastOnce()).save(captor.capture());
            Resume saved = captor.getAllValues().stream()
                    .filter(r -> r.getVersionNum() == 2)
                    .findFirst().orElse(null);
            assertThat(saved).isNotNull();
            assertThat(saved.getVersionNum()).isEqualTo(2);
        }

        @Test
        @DisplayName("should deactivate previous active resume on upload")
        void shouldDeactivatePreviousActive() throws IOException {
            byte[] pdfContent = createPdfBytes();
            MultipartFile file = new MockMultipartFile(
                    "file", "resume.pdf", MediaType.APPLICATION_PDF_VALUE, pdfContent);

            Resume activeResume = Resume.builder()
                    .id(UUID.randomUUID())
                    .user(testUser)
                    .name("Active Resume (v1)")
                    .versionNum(1)
                    .isActive(true)
                    .build();

            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(resumeRepository.findByUserIdOrderByCreatedAtDesc(userId)).thenReturn(List.of(activeResume));
            when(fileStorageService.store(any(MultipartFile.class), anyString())).thenReturn("/uploads/test.pdf");
            when(resumeRepository.save(any(Resume.class))).thenAnswer(invocation -> invocation.getArgument(0));

            resumeService.uploadResume(file, userId);

            assertThat(activeResume.getIsActive()).isFalse();
        }
    }

    @Nested
    @DisplayName("List Resumes")
    class ListResumes {

        @Test
        @DisplayName("should return paginated list of resumes")
        void shouldListResumes() {
            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(resumeRepository.findByUserIdOrderByCreatedAtDesc(userId)).thenReturn(List.of(testResume));

            Page<ResumeListItem> result = resumeService.listUserResumes(userId, 0, 10);

            assertThat(result).isNotNull();
            assertThat(result.getContent()).hasSize(1);
            assertThat(result.getContent().get(0).getName()).isEqualTo("Test Resume (v1)");
        }

        @Test
        @DisplayName("should throw for invalid page index")
        void shouldThrowForInvalidPage() {
            assertThatThrownBy(() -> resumeService.listUserResumes(userId, -1, 10))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("Page index");
        }

        @Test
        @DisplayName("should throw for invalid page size")
        void shouldThrowForInvalidSize() {
            assertThatThrownBy(() -> resumeService.listUserResumes(userId, 0, 0))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("Page size");
            assertThatThrownBy(() -> resumeService.listUserResumes(userId, 0, 200))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("Page size");
        }

        @Test
        @DisplayName("should throw when user not found")
        void shouldThrowWhenUserNotFound() {
            when(userRepository.findById(userId)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> resumeService.listUserResumes(userId, 0, 10))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("User not found");
        }

        @Test
        @DisplayName("should return empty page when user has no resumes")
        void shouldReturnEmptyForNoResumes() {
            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(resumeRepository.findByUserIdOrderByCreatedAtDesc(userId)).thenReturn(List.of());

            Page<ResumeListItem> result = resumeService.listUserResumes(userId, 0, 10);

            assertThat(result.getContent()).isEmpty();
            assertThat(result.getTotalElements()).isZero();
        }
    }

    @Nested
    @DisplayName("Get Resume")
    class GetResume {

        @Test
        @DisplayName("should return resume detail when owner requests")
        void shouldReturnResumeForOwner() {
            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(resumeRepository.findById(resumeId)).thenReturn(Optional.of(testResume));

            ResumeDetail detail = resumeService.getResume(userId, resumeId);

            assertThat(detail).isNotNull();
            assertThat(detail.getId()).isEqualTo(resumeId);
            assertThat(detail.getName()).isEqualTo("Test Resume (v1)");
        }

        @Test
        @DisplayName("should throw when resume not found")
        void shouldThrowWhenResumeNotFound() {
            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(resumeRepository.findById(resumeId)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> resumeService.getResume(userId, resumeId))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("Resume not found");
        }

        @Test
        @DisplayName("should throw when user not found")
        void shouldThrowWhenUserNotFound() {
            when(userRepository.findById(userId)).thenReturn(Optional.empty());

            assertThatThrownBy(() -> resumeService.getResume(userId, resumeId))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("User not found");
        }

        @Test
        @DisplayName("should throw when another user requests access")
        void shouldThrowForOtherUserAccess() {
            UUID otherUserId = UUID.randomUUID();
            when(userRepository.findById(otherUserId)).thenReturn(Optional.of(
                    User.builder().id(otherUserId).email("other@example.com").build()));
            when(resumeRepository.findById(resumeId)).thenReturn(Optional.of(testResume));

            assertThatThrownBy(() -> resumeService.getResume(otherUserId, resumeId))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("Access denied");
        }
    }

    @Nested
    @DisplayName("Rename Resume")
    class RenameResume {

        @Test
        @DisplayName("should rename resume successfully")
        void shouldRenameResume() {
            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(resumeRepository.findById(resumeId)).thenReturn(Optional.of(testResume));
            when(resumeRepository.save(any(Resume.class))).thenReturn(testResume);

            ResumeDetail detail = resumeService.renameResume(userId, resumeId, "New Name");

            assertThat(detail).isNotNull();
            assertThat(testResume.getName()).isEqualTo("New Name");
        }

        @Test
        @DisplayName("should throw when another user tries to rename")
        void shouldThrowForOtherUser() {
            UUID otherUserId = UUID.randomUUID();
            when(userRepository.findById(otherUserId)).thenReturn(Optional.of(
                    User.builder().id(otherUserId).email("other@example.com").build()));
            when(resumeRepository.findById(resumeId)).thenReturn(Optional.of(testResume));

            assertThatThrownBy(() -> resumeService.renameResume(otherUserId, resumeId, "Hacked Name"))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("Access denied");
        }
    }

    @Nested
    @DisplayName("Delete Resume")
    class DeleteResume {

        @Test
        @DisplayName("should delete resume when no applications reference it")
        void shouldDeleteWhenNoReferences() {
            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(resumeRepository.findById(resumeId)).thenReturn(Optional.of(testResume));
            when(applicationRepository.findByUserIdOrderByCreatedAtDesc(userId)).thenReturn(List.of());

            resumeService.deleteResume(userId, resumeId);

            verify(fileStorageService).delete(anyString());
            verify(resumeRepository).delete(testResume);
        }

        @Test
        @DisplayName("should throw when resume is linked to applications")
        void shouldThrowWhenLinkedToApplications() {
            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(resumeRepository.findById(resumeId)).thenReturn(Optional.of(testResume));

            com.aicopilot.entity.Application linkedApp = com.aicopilot.entity.Application.builder()
                    .id(UUID.randomUUID())
                    .user(testUser)
                    .resume(testResume)
                    .company("Acme")
                    .role("Engineer")
                    .build();

            when(applicationRepository.findByUserIdOrderByCreatedAtDesc(userId))
                    .thenReturn(List.of(linkedApp));

            assertThatThrownBy(() -> resumeService.deleteResume(userId, resumeId))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("linked to")
                    .hasMessageContaining("application");
        }

        @Test
        @DisplayName("should throw when another user tries to delete")
        void shouldThrowForOtherUser() {
            UUID otherUserId = UUID.randomUUID();
            when(userRepository.findById(otherUserId)).thenReturn(Optional.of(
                    User.builder().id(otherUserId).email("other@example.com").build()));
            when(resumeRepository.findById(resumeId)).thenReturn(Optional.of(testResume));

            assertThatThrownBy(() -> resumeService.deleteResume(otherUserId, resumeId))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("Access denied");
        }
    }

    @Nested
    @DisplayName("Set Active Resume")
    class SetActiveResume {

        @Test
        @DisplayName("should set resume as active and deactivate others")
        void shouldSetActiveResume() {
            Resume otherResume = Resume.builder()
                    .id(UUID.randomUUID())
                    .user(testUser)
                    .name("Other Resume")
                    .isActive(true)
                    .build();

            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(resumeRepository.findById(resumeId)).thenReturn(Optional.of(testResume));
            when(resumeRepository.findByUserIdOrderByCreatedAtDesc(userId))
                    .thenReturn(List.of(otherResume, testResume));
            when(resumeRepository.save(any(Resume.class))).thenAnswer(invocation -> invocation.getArgument(0));

            ResumeDetail detail = resumeService.setActiveResume(userId, resumeId);

            assertThat(detail).isNotNull();
            assertThat(testResume.getIsActive()).isTrue();
            assertThat(otherResume.getIsActive()).isFalse();
        }

        @Test
        @DisplayName("should throw when another user tries to set active")
        void shouldThrowForOtherUser() {
            UUID otherUserId = UUID.randomUUID();
            when(userRepository.findById(otherUserId)).thenReturn(Optional.of(
                    User.builder().id(otherUserId).email("other@example.com").build()));
            when(resumeRepository.findById(resumeId)).thenReturn(Optional.of(testResume));

            assertThatThrownBy(() -> resumeService.setActiveResume(otherUserId, resumeId))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("Access denied");
        }
    }

    @Nested
    @DisplayName("Parse Resume")
    class ParseResume {

        @Test
        @DisplayName("should parse resume successfully with AI service")
        void shouldParseWithAi() throws Exception {
            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(resumeRepository.findById(resumeId)).thenReturn(Optional.of(testResume));
            when(resumeRepository.save(any(Resume.class))).thenAnswer(invocation -> invocation.getArgument(0));
            when(fileStorageService.retrieve(anyString())).thenReturn(new ByteArrayInputStream("test content".getBytes()));
            when(tikaResumeParser.extractText(any(InputStream.class))).thenReturn("extracted text");
            when(aiService.parseResume(any(UUID.class), anyString()))
                    .thenReturn(com.aicopilot.ai.dto.AiDtos.ParseResponse.builder()
                            .success(true)
                            .parsedContent("parsed content")
                            .structuredData("{\"name\":\"Test\"}")
                            .build());

            ResumeDetail detail = resumeService.parseResume(userId, resumeId);

            assertThat(detail).isNotNull();
            assertThat(testResume.getParsingStatus()).isEqualTo(ParsingStatus.PARSED);
            assertThat(testResume.getParsedContent()).isEqualTo("parsed content");
        }

        @Test
        @DisplayName("should fall back to rule-based parser when AI fails")
        void shouldFallbackToRuleBasedParser() throws Exception {
            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(resumeRepository.findById(resumeId)).thenReturn(Optional.of(testResume));
            when(resumeRepository.save(any(Resume.class))).thenAnswer(invocation -> invocation.getArgument(0));
            when(fileStorageService.retrieve(anyString())).thenReturn(new ByteArrayInputStream("test content".getBytes()));
            when(tikaResumeParser.extractText(any(InputStream.class))).thenReturn("extracted text");
            when(aiService.parseResume(any(UUID.class), anyString()))
                    .thenReturn(com.aicopilot.ai.dto.AiDtos.ParseResponse.builder()
                            .success(false)
                            .errorMessage("AI failed")
                            .build());
            when(ruleBasedResumeParser.parse(anyString()))
                    .thenReturn(RuleBasedResumeParser.ParseResult.success("{\"rule\":true}", "rule parsed"));

            ResumeDetail detail = resumeService.parseResume(userId, resumeId);

            assertThat(detail).isNotNull();
            assertThat(testResume.getParsingStatus()).isEqualTo(ParsingStatus.PARSED);
        }

        @Test
        @DisplayName("should mark as FAILED when both AI and rule-based fail")
        void shouldMarkFailedWhenBothFail() throws Exception {
            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(resumeRepository.findById(resumeId)).thenReturn(Optional.of(testResume));
            when(resumeRepository.save(any(Resume.class))).thenAnswer(invocation -> invocation.getArgument(0));
            when(fileStorageService.retrieve(anyString())).thenReturn(new ByteArrayInputStream("test".getBytes()));
            when(tikaResumeParser.extractText(any(InputStream.class))).thenReturn("extracted");
            when(aiService.parseResume(any(UUID.class), anyString()))
                    .thenReturn(com.aicopilot.ai.dto.AiDtos.ParseResponse.builder()
                            .success(false)
                            .errorMessage("AI failed")
                            .build());
            when(ruleBasedResumeParser.parse(anyString()))
                    .thenReturn(RuleBasedResumeParser.ParseResult.failure("Rule parser error"));

            ResumeDetail detail = resumeService.parseResume(userId, resumeId);

            assertThat(detail).isNotNull();
            assertThat(testResume.getParsingStatus()).isEqualTo(ParsingStatus.FAILED);
        }

        @Test
        @DisplayName("should throw when already processing")
        void shouldThrowWhenAlreadyProcessing() {
            testResume.setParsingStatus(ParsingStatus.PROCESSING);

            when(userRepository.findById(userId)).thenReturn(Optional.of(testUser));
            when(resumeRepository.findById(resumeId)).thenReturn(Optional.of(testResume));

            assertThatThrownBy(() -> resumeService.parseResume(userId, resumeId))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("already being parsed");
        }

        @Test
        @DisplayName("should enforce ownership check")
        void shouldEnforceOwnership() {
            UUID otherUserId = UUID.randomUUID();
            when(userRepository.findById(otherUserId)).thenReturn(Optional.of(
                    User.builder().id(otherUserId).email("other@example.com").build()));
            when(resumeRepository.findById(resumeId)).thenReturn(Optional.of(testResume));

            assertThatThrownBy(() -> resumeService.parseResume(otherUserId, resumeId))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("Access denied");
        }
    }

    private byte[] createPdfBytes() {
        byte[] header = new byte[5];
        header[0] = 0x25;
        header[1] = 0x50;
        header[2] = 0x44;
        header[3] = 0x46;
        header[4] = 0x2D;
        byte[] rest = "%PDF-1.4 test content".getBytes();
        byte[] result = new byte[header.length + rest.length];
        System.arraycopy(header, 0, result, 0, header.length);
        System.arraycopy(rest, 0, result, header.length, rest.length);
        return result;
    }
}
