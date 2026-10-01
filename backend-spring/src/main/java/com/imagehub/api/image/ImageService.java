package com.imagehub.api.image;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.imagehub.api.event.ImageEvent;
import com.imagehub.api.event.ImageEventPublisher;

@Service
public class ImageService {

    private final ImageRepository repository;
    private final ImageEventPublisher events;
    private final Path uploadDir;

    public ImageService(ImageRepository repository,
                        ImageEventPublisher events,
                        @Value("${imagehub.upload-dir}") String uploadDir) {
        this.repository = repository;
        this.events = events;
        this.uploadDir = Path.of(uploadDir).toAbsolutePath();
    }

    public List<Image> findAll() {
        return repository.findAll();
    }

    public Optional<Image> find(int id) {
        return repository.findById(id);
    }

    public Image upload(MultipartFile file, String name) {
        // Save first so the database assigns the id, which becomes the file name.
        Image image = repository.save(new Image(name.replace(" ", "_"), "/"));

        try {
            Files.createDirectories(uploadDir);
            String fileName = image.getId() + extensionOf(file.getOriginalFilename());
            Files.copy(file.getInputStream(), uploadDir.resolve(fileName), StandardCopyOption.REPLACE_EXISTING);
            image.setPath("/uploads/" + fileName);
        } catch (IOException e) {
            repository.delete(image);
            throw new UncheckedIOException(e);
        }

        image = repository.save(image);
        events.publish(new ImageEvent(ImageEvent.Type.UPLOADED, image.getId()));
        return image;
    }

    public boolean delete(int id) {
        Optional<Image> found = repository.findById(id);
        if (found.isEmpty()) {
            return false;
        }

        try {
            // getFileName() drops any directory parts, so a bad path can't escape the uploads folder.
            Files.deleteIfExists(uploadDir.resolve(Path.of(found.get().getPath()).getFileName()));
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }

        repository.delete(found.get());
        events.publish(new ImageEvent(ImageEvent.Type.DELETED, id));
        return true;
    }

    private static String extensionOf(String originalName) {
        if (originalName == null) {
            return "";
        }
        int dot = originalName.lastIndexOf('.');
        // Letters and digits only, so the extension can't smuggle in path characters.
        return dot < 0 ? "" : "." + originalName.substring(dot + 1).replaceAll("[^A-Za-z0-9]", "");
    }
}
