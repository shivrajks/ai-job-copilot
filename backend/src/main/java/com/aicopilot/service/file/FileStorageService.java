package com.aicopilot.service.file;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;

/**
 * Abstraction for file storage. Implementations can be local filesystem,
 * S3, MinIO, or any other object storage provider.
 */
public interface FileStorageService {

    /**
     * Store a file for a given user. Returns a URL/path that can be used
     * to retrieve the file later.
     *
     * @param file   the uploaded file
     * @param userId the user who owns the file
     * @return the stored file URL/path
     * @throws IOException if the file cannot be stored
     */
    String store(MultipartFile file, String userId) throws IOException;

    /**
     * Retrieve the file content as an InputStream.
     *
     * @param fileUrl the stored file URL/path
     * @return the file content stream
     * @throws IOException if the file cannot be read
     */
    InputStream retrieve(String fileUrl) throws IOException;

    /**
     * Delete a file from storage.
     *
     * @param fileUrl the stored file URL/path
     * @return true if deleted successfully
     */
    boolean delete(String fileUrl);
}
