package com.imagehub.thumbnails;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

import java.awt.image.BufferedImage;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import java.util.function.BooleanSupplier;
import java.util.function.Predicate;

import javax.imageio.ImageIO;

import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.apache.kafka.clients.consumer.KafkaConsumer;
import org.apache.kafka.clients.producer.KafkaProducer;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.clients.producer.ProducerRecord;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.apache.kafka.common.serialization.StringSerializer;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.kafka.test.EmbeddedKafkaBroker;
import org.springframework.kafka.test.context.EmbeddedKafka;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;

/**
 * The whole service being tested here. Events go in, files and events come out.
 * Messages are sent as JSON strings.
 */
@SpringBootTest(properties = {
        "spring.kafka.bootstrap-servers=${spring.embedded.kafka.brokers}",
        "imagehub.kafka.group=pipeline-test-thumbnailer"
})
@EmbeddedKafka(partitions = 1, topics = {"image-events", "thumbnail-events"})
class ThumbnailPipelineTest {

    static final Path UPLOADS = newTempDir();

    @DynamicPropertySource
    static void properties(DynamicPropertyRegistry registry) {
        registry.add("imagehub.upload-dir", UPLOADS::toString);
    }

    @Autowired
    EmbeddedKafkaBroker broker;

    // ---- the tests ------------------------------------------------------------------------------

    @Test
    void anUploadedImageGetsAThumbnailAndAReadyEvent() throws Exception {
        String name = original("a-" + UUID.randomUUID() + ".png", 1200, 800);

        send("11", uploaded(11, name));

        String ready = awaitRecord("thumbnail-events", v -> v.contains("\"imageId\":11")).value();
        assertTrue(ready.contains("\"thumbPath\":\"/uploads/thumbs/" + name + ".webp\""), ready);

        Path thumb = UPLOADS.resolve("thumbs").resolve(name + ".webp");
        assertTrue(Files.exists(thumb));
        BufferedImage image = ImageIO.read(thumb.toFile());
        assertEquals(640, image.getWidth());
        assertEquals(427, image.getHeight());
    }

    @Test
    void aDeletedEventRemovesTheThumbnail() throws Exception {
        String name = original("d-" + UUID.randomUUID() + ".png", 900, 600);
        Path thumb = UPLOADS.resolve("thumbs").resolve(name + ".webp");

        send("12", uploaded(12, name));
        waitUntil(() -> Files.exists(thumb));
        send("12", deleted(12, name));

        waitUntil(() -> !Files.exists(thumb));
    }

    @Test
    void replayingAnImageDoesNotRegenerateButStillReportsReady() throws Exception {
        String name = original("r-" + UUID.randomUUID() + ".png", 1000, 700);
        Path thumb = UPLOADS.resolve("thumbs").resolve(name + ".webp");

        send("13", uploaded(13, name));
        awaitRecord("thumbnail-events", v -> v.contains("\"imageId\":13"));
        var firstWrite = Files.getLastModifiedTime(thumb);

        // the same UPLOADED again, which must fill in the database
        // again without redoing the work
        send("13", uploaded(13, name));
        awaitRecord("thumbnail-events", v -> v.contains("\"imageId\":13"));

        assertEquals(firstWrite, Files.getLastModifiedTime(thumb));
    }

    @Test
    void aCorruptImageGoesToTheDeadLetterTopicWithoutBlockingTheNextOne() throws Exception {
        String bad = "bad-" + UUID.randomUUID() + ".png";
        Files.writeString(UPLOADS.resolve(bad), "not a png at all");
        String good = original("g-" + UUID.randomUUID() + ".png", 800, 800);

        send("14", uploaded(14, bad));
        send("15", uploaded(15, good)); // behind the bad one, on the same partition

        ConsumerRecord<String, String> dead = awaitRecord("image-events.DLT", v -> v.contains(bad));
        assertNotNull(dead);
        awaitRecord("thumbnail-events", v -> v.contains("\"imageId\":15"));
        assertFalse(Files.exists(UPLOADS.resolve("thumbs").resolve(bad + ".webp")));
    }

    @Test
    void aMalformedMessageGoesToTheDeadLetterTopicWithoutBlockingTheNextOne() throws Exception {
        String good = original("m-" + UUID.randomUUID() + ".png", 800, 800);

        send("16", "{this is not json");
        send("17", uploaded(17, good));

        awaitRecord("image-events.DLT", v -> v.contains("this is not json"));
        awaitRecord("thumbnail-events", v -> v.contains("\"imageId\":17"));
    }

    @Test
    void aMissingOriginalIsSkippedAndTheNextImageIsStillProcessed() throws Exception {
        String good = original("s-" + UUID.randomUUID() + ".png", 800, 800);

        send("18", uploaded(18, "never-existed-" + UUID.randomUUID() + ".png"));
        send("19", uploaded(19, good));

        awaitRecord("thumbnail-events", v -> v.contains("\"imageId\":19"));
    }

    // ---- helpers --------------------------------------------------------------------------------

    private static Path newTempDir() {
        try {
            return Files.createTempDirectory("thumbnail-pipeline-test");
        } catch (IOException e) {
            throw new IllegalStateException(e);
        }
    }

    private static String uploaded(int id, String fileName) {
        return "{\"type\":\"UPLOADED\",\"imageId\":" + id + ",\"path\":\"/uploads/" + fileName + "\"}";
    }

    private static String deleted(int id, String fileName) {
        return "{\"type\":\"DELETED\",\"imageId\":" + id + ",\"path\":\"/uploads/" + fileName + "\"}";
    }

    // Writes an original into the shared uploads folder and returns its file name.
    private String original(String fileName, int width, int height) throws IOException {
        BufferedImage image = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
        var random = new java.util.Random(7);
        for (int i = 0; i < 300; i++) {
            image.setRGB(random.nextInt(width), random.nextInt(height), random.nextInt(0xFFFFFF));
        }
        ImageIO.write(image, "png", UPLOADS.resolve(fileName).toFile());
        return fileName;
    }

    private void send(String key, String json) throws Exception {
        try (var producer = new KafkaProducer<String, String>(Map.<String, Object>of(
                ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, broker.getBrokersAsString(),
                ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class,
                ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, StringSerializer.class))) {
            producer.send(new ProducerRecord<>("image-events", key, json)).get(10, TimeUnit.SECONDS);
        }
    }

    // Reads a topic from the start until a record matching the predicate shows up.
    private ConsumerRecord<String, String> awaitRecord(String topic, Predicate<String> matches) {
        try (var consumer = new KafkaConsumer<String, String>(Map.<String, Object>of(
                ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, broker.getBrokersAsString(),
                ConsumerConfig.GROUP_ID_CONFIG, "test-reader-" + UUID.randomUUID(),
                ConsumerConfig.AUTO_OFFSET_RESET_CONFIG, "earliest",
                ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class,
                ConsumerConfig.VALUE_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class))) {
            consumer.subscribe(List.of(topic));
            long deadline = System.nanoTime() + Duration.ofSeconds(30).toNanos();
            while (System.nanoTime() < deadline) {
                for (ConsumerRecord<String, String> record : consumer.poll(Duration.ofMillis(300))) {
                    if (record.value() != null && matches.test(record.value())) {
                        return record;
                    }
                }
            }
        }
        throw new AssertionError("No matching record arrived on " + topic + " within 30s");
    }

    private static void waitUntil(BooleanSupplier condition) throws InterruptedException {
        long deadline = System.nanoTime() + Duration.ofSeconds(30).toNanos();
        while (System.nanoTime() < deadline) {
            if (condition.getAsBoolean()) {
                return;
            }
            Thread.sleep(100);
        }
        throw new AssertionError("Condition not met within 30s");
    }
}
