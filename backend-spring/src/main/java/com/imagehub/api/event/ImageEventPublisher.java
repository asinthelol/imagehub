package com.imagehub.api.event;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;



@Component
public class ImageEventPublisher {

    private static final Logger log = LoggerFactory.getLogger(ImageEventPublisher.class);

    private final KafkaTemplate<String, ImageEvent> kafka;
    private final String topic;

    public ImageEventPublisher(KafkaTemplate<String, ImageEvent> kafka,
                               @Value("${imagehub.kafka.topic}") String topic) {
        this.kafka = kafka;
        this.topic = topic;
    }

    public void publish(ImageEvent event) {
        kafka.send(topic, String.valueOf(event.imageId()), event).whenComplete((result, ex) -> {
            if (ex != null) {
                log.error("Failed to publish {}", event, ex);
            } else {
                var md = result.getRecordMetadata();
                log.info("Published {} to {}-{}@{}", event, md.topic(), md.partition(), md.offset());
            }
        });
    }
}
