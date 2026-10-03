package com.imagehub.api.event;

/**
 * `path` is where the original lives (e.g. /uploads/<uuid>.jpg)
 * so consumers such as the thumbnail service don't need database access. Null on old messages.
 */
public record ImageEvent(Type type, Integer imageId, String path) {
    public enum Type { UPLOADED, DELETED }
}
