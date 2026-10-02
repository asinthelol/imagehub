package com.imagehub.thumbnails.thumbnail;

/**
 * The file isn't an image we can decode (corrupt, unsupported, or absurdly large).
 * Retrying can't help, so the Kafka error handler sends these straight to the dead-letter topic.
 */
public class CorruptImageException extends RuntimeException {

    public CorruptImageException(String message) {
        super(message);
    }

    public CorruptImageException(String message, Throwable cause) {
        super(message, cause);
    }
}
