package com.imagehub.thumbnails.config;

import java.util.Map;

import org.apache.kafka.clients.admin.NewTopic;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.common.TopicPartition;
import org.apache.kafka.common.serialization.ByteArraySerializer;
import org.apache.kafka.common.serialization.StringSerializer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;
import org.springframework.kafka.core.DefaultKafkaProducerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.listener.DeadLetterPublishingRecoverer;
import org.springframework.kafka.listener.DefaultErrorHandler;
import org.springframework.kafka.support.serializer.DelegatingByTypeSerializer;
import org.springframework.kafka.support.serializer.JacksonJsonSerializer;
import org.springframework.util.backoff.FixedBackOff;

import com.imagehub.thumbnails.event.ImageEvent;
import com.imagehub.thumbnails.thumbnail.CorruptImageException;

@Configuration
public class KafkaConfig {

    // Where messages we can't process end up
    @Bean
    NewTopic imageEventsDeadLetterTopic(@Value("${imagehub.kafka.topic}") String topic) {
        return TopicBuilder.name(deadLetterTopic(topic)).partitions(3).replicas(1).build();
    }

    static String deadLetterTopic(String topic) {
        return topic + ".DLT";
    }

    /**
     * Transient failures (disk hiccup, broker blip) are retried 3 times, a second apart. After that, or
     * straight away for errors that retrying can't fix, the message goes to the dead-letter topic and
     * the consumer moves on.
     */
    @Bean
    DefaultErrorHandler kafkaErrorHandler(@Value("${spring.kafka.bootstrap-servers}") String bootstrapServers,
                                          @Value("${imagehub.kafka.topic}") String topic) {
        // A producer for dead letters. It must be able to send both a decoded ImageEvent and
        // the bytes of a message that couldn't be decoded.
        var json = new JacksonJsonSerializer<ImageEvent>();
        json.setAddTypeInfo(false);
        var serializer = new DelegatingByTypeSerializer(Map.of(
                byte[].class, new ByteArraySerializer(),
                ImageEvent.class, json));
        var producerFactory = new DefaultKafkaProducerFactory<String, Object>(
                Map.<String, Object>of(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers),
                new StringSerializer(), serializer);

        var recoverer = new DeadLetterPublishingRecoverer(
                new KafkaTemplate<>(producerFactory),
                (record, exception) -> new TopicPartition(deadLetterTopic(topic), record.partition()));

        var handler = new DefaultErrorHandler(recoverer, new FixedBackOff(1000L, 3));
        handler.addNotRetryableExceptions(CorruptImageException.class); // can't be fixed by trying again
        return handler;
    }
}
