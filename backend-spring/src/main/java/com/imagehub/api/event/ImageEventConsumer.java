package com.imagehub.api.event;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;



@Component
public class ImageEventConsumer {

    private static final Logger log = LoggerFactory.getLogger(ImageEventConsumer.class);

    private final SimpMessagingTemplate websocket;

    public ImageEventConsumer(SimpMessagingTemplate websocket) {
        this.websocket = websocket;
    }

    @KafkaListener(topics = "${imagehub.kafka.topic}")
    public void onImageEvent(ImageEvent event) {
        log.info("Consumed {}", event);
        websocket.convertAndSend("/topic/images", event);
    }
}
