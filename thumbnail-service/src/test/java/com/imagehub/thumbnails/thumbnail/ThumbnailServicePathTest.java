package com.imagehub.thumbnails.thumbnail;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;

// Only plain files directly inside /uploads/ are acceptable.
class ThumbnailServicePathTest {

    @Test
    void acceptsAPlainUpload() {
        assertEquals("9b5e6494-a424-4e51-85b2-7f61cebb2a82.png",
                ThumbnailService.originalFileName("/uploads/9b5e6494-a424-4e51-85b2-7f61cebb2a82.png"));
        assertEquals("5.jpg", ThumbnailService.originalFileName("/uploads/5.jpg")); // legacy id-style name
    }

    @ParameterizedTest
    @ValueSource(strings = {
            "/uploads/thumbs/x.png.webp",   // a thumbnail is not an original
            "/uploads/a/b.png",             // sub-folder
            "/uploads/../secret.png",       // traversal
            "/uploads/..%2Fsecret.png",
            "/uploads/.hidden",
            "/uploads/a..b.png",
            "/etc/passwd",
            "uploads/x.png",
            "/uploads/",
            "/uploads/x\\y.png",
            ""})
    void rejectsAnythingElse(String path) {
        assertNull(ThumbnailService.originalFileName(path));
    }

    @Test
    void rejectsNull() {
        assertNull(ThumbnailService.originalFileName(null));
    }
}
