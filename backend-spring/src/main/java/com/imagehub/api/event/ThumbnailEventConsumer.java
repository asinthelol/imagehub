package com.imagehub.api.event;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

import com.imagehub.api.image.ImageService;

@Component
public class ThumbnailEventConsumer {

    private static final Logger log = LoggerFactory.getLogger(ThumbnailEventConsumer.class);

    private final ImageService images;
    private final SimpMessagingTemplate websocket;

    public ThumbnailEventConsumer(ImageService images, SimpMessagingTemplate websocket) {
        this.images = images;
        this.websocket = websocket;
    }

    @KafkaListener(
            topics = "${imagehub.kafka.thumbnail-topic}",
            groupId = "${imagehub.kafka.thumbnail-group}",
            properties = "spring.json.value.default.type=com.imagehub.api.event.ThumbnailEvent")
    public void onThumbnailReady(ThumbnailEvent event) {
        log.info("Consumed {}", event);
        images.attachThumbnail(event.imageId(), event.thumbPath())
                .ifPresent(image -> websocket.convertAndSend(
                        "/topic/images", new Refresh("THUMBNAIL_READY", image.getId())));
    }
    
    record Refresh(String type, Integer imageId) {
    }
}
