package com.aicopilot.service;

import com.aicopilot.dto.ResumeDtos;
import com.aicopilot.dto.ResumeDtos.*;
import com.aicopilot.entity.Resume;
import com.aicopilot.entity.User;
import com.aicopilot.exception.AppException;
import com.aicopilot.repository.ResumeRepository;
import com.aicopilot.repository.UserRepository;
import com.aicopilot.service.file.FileStorageService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ResumeService {

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
    private static final int MAX_PAGE_SIZE = 100;
    private static final String PDF_MIME_TYPE = "application/pdf";
    private static final byte[] PDF_MAGIC_BYTES = {0x25, 0x50, 0x44, 0x46, 0x2D}; // %PDF-

    private final ResumeRepository resumeRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;

    @Transactional
    public UploadResponse uploadResume(MultipartFile file, UUID userId) {
        // Validate file
        validateFile(file);

        // Load user
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

        // Store file
        String fileUrl;
        try {
            fileUrl = fileStorageService.store(file, user.getId().toString());
        } catch (IOException e) {
            log.error("Failed to upload resume for user: {}", userId, e);
            throw new AppException("Failed to upload resume: " + e.getMessage(),
                    HttpStatus.INTERNAL_SERVER_ERROR);
        }

        // Calculate version number for this user's resumes
        List<Resume> existingResumes = resumeRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        int nextVersion = existingResumes.isEmpty() ? 1 :
                existingResumes.get(0).getVersionNum() + 1;

        for (Resume existingResume : existingResumes) {
            if (Boolean.TRUE.equals(existingResume.getIsActive())) {
                existingResume.setIsActive(false);
            }
        }
        resumeRepository.saveAll(existingResumes);

        // Create resume entity
        Resume resume = Resume.builder()
                .user(user)
                .name(generateResumeName(file.getOriginalFilename(), nextVersion))
                .originalFileUrl(fileUrl)
                .parsingStatus(Resume.ParsingStatus.PENDING)
                .isActive(true)
                .fileSize(file.getSize())
                .mimeType(file.getContentType())
                .versionNum(nextVersion)
                .build();

        resume = resumeRepository.save(resume);

        log.info("Uploaded resume: {} for user: {} (version {})",
                resume.getId(), userId, nextVersion);

        return UploadResponse.builder()
                .id(resume.getId())
                .name(resume.getName())
                .status("PENDING")
                .message("Resume uploaded successfully. Parsing will begin shortly.")
                .build();
    }

    @Transactional(readOnly = true)
    public Page<ResumeListItem> listUserResumes(UUID userId, int page, int size) {
        validatePagination(page, size);

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

        List<Resume> allResumes = resumeRepository.findByUserIdOrderByCreatedAtDesc(user.getId());

        // Manual pagination
        int total = allResumes.size();
        long requestedOffset = (long) page * size;
        int fromIndex = requestedOffset > total ? total : (int) requestedOffset;
        int toIndex = Math.min(fromIndex + size, total);
        List<Resume> pageContent = allResumes.subList(fromIndex, toIndex);

        List<ResumeListItem> items = pageContent.stream()
                .map(ResumeDtos::toListItem)
                .toList();

        return new PageImpl<>(items, org.springframework.data.domain.PageRequest.of(page, size), total);
    }

    @Transactional(readOnly = true)
    public ResumeDetail getResume(UUID userId, UUID resumeId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new AppException("Resume not found", HttpStatus.NOT_FOUND));

        // Ownership check
        if (!resume.getUser().getId().equals(user.getId())) {
            throw new AppException("Access denied", HttpStatus.FORBIDDEN);
        }

        return ResumeDtos.toDetail(resume);
    }

    @Transactional
    public ResumeDetail renameResume(UUID userId, UUID resumeId, String newName) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new AppException("Resume not found", HttpStatus.NOT_FOUND));

        // Ownership check
        if (!resume.getUser().getId().equals(user.getId())) {
            throw new AppException("Access denied", HttpStatus.FORBIDDEN);
        }

        resume.setName(newName);
        resume = resumeRepository.save(resume);

        log.info("Renamed resume: {} to '{}' for user: {}", resumeId, newName, userId);

        return ResumeDtos.toDetail(resume);
    }

    @Transactional
    public void deleteResume(UUID userId, UUID resumeId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new AppException("Resume not found", HttpStatus.NOT_FOUND));

        // Ownership check
        if (!resume.getUser().getId().equals(user.getId())) {
            throw new AppException("Access denied", HttpStatus.FORBIDDEN);
        }

        // Delete file from storage
        try {
            fileStorageService.delete(resume.getOriginalFileUrl());
        } catch (Exception e) {
            log.warn("Failed to delete file for resume {}: {}", resumeId, e.getMessage());
            // Continue with DB deletion even if file deletion fails
        }

        resumeRepository.delete(resume);
        log.info("Deleted resume: {} for user: {}", resumeId, userId);
    }

    @Transactional
    public ResumeDetail setActiveResume(UUID userId, UUID resumeId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new AppException("User not found", HttpStatus.NOT_FOUND));

        Resume resume = resumeRepository.findById(resumeId)
                .orElseThrow(() -> new AppException("Resume not found", HttpStatus.NOT_FOUND));

        // Ownership check
        if (!resume.getUser().getId().equals(user.getId())) {
            throw new AppException("Access denied", HttpStatus.FORBIDDEN);
        }

        // Deactivate all other resumes for this user
        List<Resume> activeResumes = resumeRepository.findByUserIdOrderByCreatedAtDesc(user.getId());
        for (Resume r : activeResumes) {
            if (!r.getId().equals(resumeId) && Boolean.TRUE.equals(r.getIsActive())) {
                r.setIsActive(false);
            }
        }
        resumeRepository.saveAll(activeResumes);

        // Activate selected resume
        resume.setIsActive(true);
        resume = resumeRepository.save(resume);

        log.info("Set active resume: {} for user: {}", resumeId, userId);

        return ResumeDtos.toDetail(resume);
    }

    private void validatePagination(int page, int size) {
        if (page < 0) {
            throw new AppException("Page index must be zero or greater", HttpStatus.BAD_REQUEST);
        }
        if (size < 1 || size > MAX_PAGE_SIZE) {
            throw new AppException("Page size must be between 1 and " + MAX_PAGE_SIZE, HttpStatus.BAD_REQUEST);
        }
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new AppException("File is required", HttpStatus.BAD_REQUEST);
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new AppException("File size exceeds maximum limit of 5MB", HttpStatus.BAD_REQUEST);
        }

        // Validate MIME type
        String contentType = file.getContentType();
        if (contentType == null || !contentType.equals(PDF_MIME_TYPE)) {
            throw new AppException("Only PDF files are accepted", HttpStatus.BAD_REQUEST);
        }

        // Validate magic bytes (check if actual PDF content)
        try {
            byte[] header = new byte[5];
            int read = file.getInputStream().read(header);
            if (read < 5) {
                throw new AppException("Invalid file: unable to read file header", HttpStatus.BAD_REQUEST);
            }
            for (int i = 0; i < 5; i++) {
                if (header[i] != PDF_MAGIC_BYTES[i]) {
                    throw new AppException("Invalid file: not a valid PDF document", HttpStatus.BAD_REQUEST);
                }
            }
        } catch (IOException e) {
            throw new AppException("Failed to validate file: " + e.getMessage(), HttpStatus.BAD_REQUEST);
        }
    }

    private String generateResumeName(String originalFilename, int version) {
        if (originalFilename != null && !originalFilename.isEmpty()) {
            // Sanitize: remove path components and special characters
            String sanitized = originalFilename.replaceAll("[^a-zA-Z0-9._ -]", "");

            // Remove extension
            int lastDot = sanitized.lastIndexOf('.');
            if (lastDot > 0) {
                sanitized = sanitized.substring(0, lastDot);
            }
            // Truncate if too long
            if (sanitized.length() > 50) {
                sanitized = sanitized.substring(0, 50);
            }
            return sanitized + " (v" + version + ")";
        }
        return "Resume v" + version;
    }
}
