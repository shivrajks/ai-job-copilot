package com.aicopilot.service.file;

import com.aicopilot.exception.AppException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
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
            throw new AppException("Failed to initialize resume storage directory: " + storagePath, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public String store(MultipartFile file, String userId) {
        try {
            String extension = resolveExtension(file.getOriginalFilename());
            String storedFilename = UUID.randomUUID().toString() + extension;

            Path userDir = storageBasePath.resolve(userId);
            Files.createDirectories(userDir);

            Path targetPath = userDir.resolve(storedFilename);
            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            log.info("Stored resume file: {} for user: {}", storedFilename, userId);
            return targetPath.toString();
        } catch (IOException e) {
            log.error("Failed to store resume file for user: {}", userId, e);
            throw new AppException("Failed to store file", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    private String resolveExtension(String originalFilename) {
        if (originalFilename != null) {
            int lastDot = originalFilename.lastIndexOf('.');
            if (lastDot > 0 && lastDot < originalFilename.length() - 1) {
                String ext = originalFilename.substring(lastDot).toLowerCase();
                if (ext.equals(".pdf") || ext.equals(".docx")) {
                    return ext;
                }
            }
        }
        return ".pdf";
    }

    @Override
    public InputStream retrieve(String fileUrl) {
        try {
            Path filePath = resolveSafePath(fileUrl);
            if (!Files.exists(filePath)) {
                throw new AppException("File not found", HttpStatus.NOT_FOUND);
            }
            return Files.newInputStream(filePath);
        } catch (IOException e) {
            log.error("Failed to retrieve file: {}", fileUrl, e);
            throw new AppException("Failed to retrieve file", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Override
    public boolean delete(String fileUrl) {
        try {
            Path filePath = resolveSafePath(fileUrl);
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

    private Path resolveSafePath(String fileUrl) {
        if (fileUrl == null || fileUrl.isBlank()) {
            throw new AppException("File path must not be empty", HttpStatus.BAD_REQUEST);
        }
        String decoded = URLDecoder.decode(fileUrl, StandardCharsets.UTF_8);
        Path resolved = storageBasePath.resolve(decoded).normalize();
        if (!resolved.startsWith(storageBasePath)) {
            log.warn("Path traversal attempt blocked: {}", fileUrl);
            throw new AppException("Access denied", HttpStatus.FORBIDDEN);
        }
        return resolved;
    }

}
