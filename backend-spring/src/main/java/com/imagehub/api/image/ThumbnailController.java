package com.imagehub.api.image;

import java.util.Map;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/thumbnails")
public class ThumbnailController {

    private final ImageService images;

    public ThumbnailController(ImageService images) {
        this.images = images;
    }

    // Asks the thumbnail service to (re)generate thumbnails for every image that lacks one.
    @PostMapping("/backfill")
    public Map<String, Integer> backfill() {
        return Map.of("queued", images.requestMissingThumbnails());
    }
}
