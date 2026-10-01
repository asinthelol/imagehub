package com.imagehub.api.image;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/images")
public class ImageController {

    private static final Map<String, String> NOT_FOUND = Map.of("message", "Image not found.");

    private final ImageService images;

    public ImageController(ImageService images) {
        this.images = images;
    }

    @GetMapping
    public List<Image> getImages() {
        return images.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getImage(@PathVariable int id) {
        return images.find(id)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(404).body(NOT_FOUND));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteImage(@PathVariable int id) {
        if (!images.delete(id)) {
            return ResponseEntity.status(404).body(NOT_FOUND);
        }
        return ResponseEntity.ok(Map.of("message", "Image deleted successfully."));
    }
}
