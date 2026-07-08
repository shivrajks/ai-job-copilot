package com.aicopilot.service.file;

import com.aicopilot.exception.AppException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

class LocalFileStorageServiceTest {

    @TempDir
    Path tempDir;

    private LocalFileStorageService service;

    @BeforeEach
    void setUp() {
        service = new LocalFileStorageService(tempDir.toString());
    }

    @Nested
    @DisplayName("Path Traversal Protection")
    class PathTraversal {

        @Test
        @DisplayName("should block path traversal with ..")
        void shouldBlockPathTraversal() {
            assertThatThrownBy(() -> service.retrieve("../../../etc/passwd"))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("Access denied");
        }

        @Test
        @DisplayName("should block path traversal with encoded segments")
        void shouldBlockEncodedPathTraversal() {
            assertThatThrownBy(() -> service.retrieve("..%2F..%2Fetc%2Fpasswd"))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("Access denied");
        }

        @Test
        @DisplayName("should block absolute path outside storage")
        void shouldBlockAbsolutePathOutside() {
            assertThatThrownBy(() -> service.retrieve("/etc/passwd"))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("Access denied");
        }

        @Test
        @DisplayName("should block null fileUrl")
        void shouldBlockNullFileUrl() {
            assertThatThrownBy(() -> service.retrieve(null))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("must not be empty");
        }

        @Test
        @DisplayName("should block empty fileUrl")
        void shouldBlockEmptyFileUrl() {
            assertThatThrownBy(() -> service.retrieve(""))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("must not be empty");
        }

        @Test
        @DisplayName("should allow valid path within storage")
        void shouldAllowValidPath() throws Exception {
            Path validFile = tempDir.resolve("test-file.txt");
            Files.writeString(validFile, "hello");

            InputStream result = service.retrieve("test-file.txt");
            assertThat(result).isNotNull();
            result.close();
        }
    }

    @Nested
    @DisplayName("Delete Path Traversal")
    class DeletePathTraversal {

        @Test
        @DisplayName("should block path traversal on delete")
        void shouldBlockDeleteTraversal() {
            assertThatThrownBy(() -> service.delete("../../../etc/passwd"))
                    .isInstanceOf(AppException.class)
                    .hasMessageContaining("Access denied");
        }

        @Test
        @DisplayName("should allow delete within storage")
        void shouldAllowDeleteWithinStorage() throws Exception {
            Path validFile = tempDir.resolve("delete-me.txt");
            Files.writeString(validFile, "to be deleted");

            boolean deleted = service.delete("delete-me.txt");
            assertThat(deleted).isTrue();
            assertThat(validFile).doesNotExist();
        }
    }
}
