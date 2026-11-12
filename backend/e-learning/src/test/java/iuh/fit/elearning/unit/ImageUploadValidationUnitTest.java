package iuh.fit.elearning.unit;

import iuh.fit.elearning.common.exception.BusinessException;
import iuh.fit.elearning.common.exception.ErrorCode;
import iuh.fit.elearning.config.StorageProperties;
import iuh.fit.elearning.storage.service.FileType;
import iuh.fit.elearning.storage.service.LocalStorageService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;
import java.time.Duration;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

/** UT-11: kiểm tra tệp ảnh tải lên: dung lượng ≤ 15MB và định dạng được phép (LocalStorageService). */
class ImageUploadValidationUnitTest {

    @TempDir
    Path tempDir;

    private LocalStorageService storage;

    @BeforeEach
    void setUp() {
        storage = new LocalStorageService(
                new StorageProperties("local", tempDir.toString(), Duration.ofMinutes(10), "secret-secret-secret-1234567890"),
                "http://localhost:8080");
    }

    @Test
    @DisplayName("UT-11 Ảnh > 15MB -> FILE_TOO_LARGE")
    void UT11_oversizedImageRejected() {
        MultipartFile big = mock(MultipartFile.class);
        when(big.isEmpty()).thenReturn(false);
        when(big.getSize()).thenReturn(15L * 1024 * 1024 + 1);
        when(big.getOriginalFilename()).thenReturn("anh.png");
        BusinessException ex = assertThrows(BusinessException.class, () -> storage.upload(big, FileType.IMAGE));
        assertEquals(ErrorCode.FILE_TOO_LARGE, ex.getErrorCode());
    }

    @Test
    @DisplayName("UT-11 Tệp không phải định dạng ảnh -> UNSUPPORTED_FILE_TYPE")
    void UT11_wrongFormatRejected() {
        MockMultipartFile exe = new MockMultipartFile("file", "virus.exe", "application/octet-stream", new byte[]{1, 2, 3});
        BusinessException ex = assertThrows(BusinessException.class, () -> storage.upload(exe, FileType.IMAGE));
        assertEquals(ErrorCode.UNSUPPORTED_FILE_TYPE, ex.getErrorCode());
    }

    @Test
    @DisplayName("UT-11 Ảnh hợp lệ (png nhỏ) được lưu thành công")
    void UT11_validImageAccepted() {
        MockMultipartFile png = new MockMultipartFile("file", "avatar.png", "image/png", new byte[]{1, 2, 3});
        assertNotNull(storage.upload(png, FileType.IMAGE));
    }
}
