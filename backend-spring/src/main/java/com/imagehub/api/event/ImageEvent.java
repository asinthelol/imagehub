package com.imagehub.api.event;

public record ImageEvent(Type type, Integer imageId) {
    public enum Type { UPLOADED, DELETED }
}
