package com.imagehub.api.image;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ImageRepository extends JpaRepository<Image, Integer> {

    // Images that don't have a thumbnail yet.
    List<Image> findByThumbPathIsNull();
}
