package com.imagehub.thumbnails.thumbnail;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.imagehub.thumbnails.event.ImageEvent;
import com.imagehub.thumbnails.event.ThumbnailEvent;
import com.imagehub.thumbnails.event.ThumbnailEventPublisher;

// Decides what each image event means for the files on disk.
@Service
public class ThumbnailService {

    private static final Logger log = LoggerFactory.getLogger(ThumbnailService.class);

    // Only plain files allowed inside /uploads/
    private static final Pattern ORIGINAL = Pattern.compile("^/uploads/([A-Za-z0-9][A-Za-z0-9._-]*)$");

    private final Path uploadDir;
    private final Path thumbsDir;
    private final ThumbnailGenerator generator;
    private final ThumbnailEventPublisher publisher;

    public ThumbnailService(@Value("${imagehub.upload-dir}") String uploadDir,
                            ThumbnailGenerator generator,
                            ThumbnailEventPublisher publisher) {
        this.uploadDir = Path.of(uploadDir).toAbsolutePath().normalize();
        this.thumbsDir = this.uploadDir.resolve("thumbs");
        this.generator = generator;
        this.publisher = publisher;
        log.info("Reading originals from {} and writing thumbnails to {}", this.uploadDir, thumbsDir);
    }

    public void handle(ImageEvent event) throws IOException {
        if (event.type() == null || event.imageId() == null) {
            log.warn("Ignoring incomplete event {}", event);
            return;
        }
        String fileName = originalFileName(event.path());
        if (fileName == null) {
            log.warn("Ignoring {}: the path isn't a plain upload", event);
            return;
        }

        switch (event.type()) {
            case UPLOADED -> onUploaded(event.imageId(), fileName);
            case DELETED -> onDeleted(fileName);
        }
    }

    private void onUploaded(int imageId, String fileName) throws IOException {
        Path source = uploadDir.resolve(fileName);
        Path thumb = thumbsDir.resolve(fileName + ".webp");

        if (!Files.exists(source)) {
            log.warn("Original {} is gone; nothing to thumbnail", source.getFileName());
            return;
        }

        if (isUpToDate(source, thumb)) {
            log.info("Thumbnail for {} already exists", fileName);
        } else {
            generator.generate(source, thumb);
            log.info("Generated thumbnail {} ({} bytes)", thumb.getFileName(), Files.size(thumb));
        }

        publisher.publishReady(new ThumbnailEvent(imageId, "/uploads/thumbs/" + fileName + ".webp"));
    }

    private void onDeleted(String fileName) throws IOException {
        if (Files.deleteIfExists(thumbsDir.resolve(fileName + ".webp"))) {
            log.info("Removed thumbnail of {}", fileName);
        }
    }

    // A thumbnail is only reusable if it is newer than the original
    private static boolean isUpToDate(Path source, Path thumb) throws IOException {
        return Files.exists(thumb)
                && Files.getLastModifiedTime(thumb).compareTo(Files.getLastModifiedTime(source)) >= 0;
    }

    static String originalFileName(String path) {
        if (path == null) {
            return null;
        }
        Matcher m = ORIGINAL.matcher(path);
        if (!m.matches() || m.group(1).contains("..")) {
            return null;
        }
        return m.group(1);
    }
}
