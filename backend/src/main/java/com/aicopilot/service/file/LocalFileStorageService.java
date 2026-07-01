package com.aicopilot.service.file;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

/**
 * Local filesystem implementation of FileStorageService.
 * Suitable for development and single-instance deployments.
 * For production, implement with S3 or MinIO.
 */
@Slf4j
@Service
public class LocalFileStorageService implements FileStorageService {

    private final Path storageBasePath;

    public LocalFileStorageService(
            @Value("${resume.storage.path:./uploads/resumes}") String storagePath) {
        this.storageBasePath = Paths.get(storagePath).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.storageBasePath);
            log.info("Resume storage initialized at: {}", this.storageBasePath);
        } catch (IOException e) {
            throw new RuntimeException("Failed to initialize resume storage directory: " + storagePath, e);
        }
    }

    @Override
    public String store(MultipartFile file, String userId) {
        try {
            // Generate UUID-based filename (never use original filename)
            String storedFilename = UUID.randomUUID().toString() + ".pdf";

            // Create user-specific subdirectory
            Path userDir = storageBasePath.resolve(userId);
            Files.createDirectories(userDir);

            Path targetPath = userDir.resolve(storedFilename);
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            log.info("Stored resume file: {} for user: {}", storedFilename, userId);
            return targetPath.toString();
        } catch (IOException e) {
            log.error("Failed to store resume file for user: {}", userId, e);
            throw new RuntimeException("Failed to store file", e);
        }
    }

    @Override
    public InputStream retrieve(String fileUrl) {
        try {
            Path filePath = Paths.get(fileUrl);
            if (!Files.exists(filePath)) {
                throw new RuntimeException("File not found: " + fileUrl);
            }
            return Files.newInputStream(filePath);
        } catch (IOException e) {
            log.error("Failed to retrieve file: {}", fileUrl, e);
            throw new RuntimeException("Failed to retrieve file: " + fileUrl, e);
        }
    }

    @Override
    public boolean delete(String fileUrl) {
        try {
            Path filePath = Paths.get(fileUrl);
            boolean deleted = Files.deleteIfExists(filePath);
            if (deleted) {
                log.info("Deleted resume file: {}", fileUrl);
            }
            return deleted;
        } catch (IOException e) {
            log.error("Failed to delete file: {}", fileUrl, e);
            return false;
        }
    }

}
