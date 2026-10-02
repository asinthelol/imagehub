package com.imagehub.api.event;

// Published by the thumbnail service to thumbnail-events once a thumbnail file exists.
public record ThumbnailEvent(Integer imageId, String thumbPath) {
}
