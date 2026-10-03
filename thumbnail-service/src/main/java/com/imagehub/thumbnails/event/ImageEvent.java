package com.imagehub.thumbnails.event;

public record ImageEvent(Type type, Integer imageId, String path) {
    public enum Type { UPLOADED, DELETED }
}
