package com.imagehub.thumbnails.event;

import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

@Component
public class ThumbnailEventPublisher {

    private static final Logger log = LoggerFactory.getLogger(ThumbnailEventPublisher.class);

    private final KafkaTemplate<String, ThumbnailEvent> kafka;
    private final String topic;

    public ThumbnailEventPublisher(KafkaTemplate<String, ThumbnailEvent> kafka,
                                   @Value("${imagehub.kafka.thumbnail-topic}") String topic) {
        this.kafka = kafka;
        this.topic = topic;
    }

    /**
     * Waits for the broker to confirm. If publishing fails the exception propagates, the error handler
     * retries, and the consumed event's offset is NOT committed, so the event isn't lost.
     */
    public void publishReady(ThumbnailEvent event) {
        try {
            var md = kafka.send(topic, String.valueOf(event.imageId()), event)
                    .get(10, TimeUnit.SECONDS).getRecordMetadata();
            log.info("Published {} to {}-{}@{}", event, md.topic(), md.partition(), md.offset());
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new IllegalStateException("Interrupted while publishing " + event, e);
        } catch (ExecutionException | TimeoutException e) {
            throw new IllegalStateException("Could not publish " + event, e);
        }
    }
}
