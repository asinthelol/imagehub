package com.imagehub.thumbnails.event;

import java.io.IOException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import com.imagehub.thumbnails.thumbnail.ThumbnailService;

@Component
public class ImageEventListener {

    private static final Logger log = LoggerFactory.getLogger(ImageEventListener.class);

    private final ThumbnailService thumbnails;

    public ImageEventListener(ThumbnailService thumbnails) {
        this.thumbnails = thumbnails;
    }

    @KafkaListener(topics = "${imagehub.kafka.topic}", groupId = "${imagehub.kafka.group}")
    public void onImageEvent(ImageEvent event) throws IOException {
        log.info("Consumed {}", event);
        thumbnails.handle(event);
    }
}
