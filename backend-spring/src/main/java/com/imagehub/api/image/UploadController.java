package com.imagehub.api.image;

import java.util.Map;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/upload")
public class UploadController {

    private final ImageService images;

    public UploadController(ImageService images) {
        this.images = images;
    }

    // The frontend also sends an "imagePath" form field; it's ignored because the server decides the path.
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> postImage(@RequestParam(required = false) MultipartFile file,
                                       @RequestParam(required = false) String imageName) {
        if (file == null || file.isEmpty() || imageName == null || imageName.isBlank()) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "No file uploaded or missing image name."));
        }

        Image image = images.upload(file, imageName);
        return ResponseEntity.ok(Map.of("message", "Image uploaded successfully", "image", image));
    }
}
