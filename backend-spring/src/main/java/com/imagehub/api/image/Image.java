package com.imagehub.api.image;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;



@Entity
public class Image {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;
    private String name;
    private String path;

    // Pixel size. Null for rows created before this existed.
    private Integer width;
    private Integer height;

    protected Image() {} // required by JPA

    public Image(String name, String path) {
        this.name = name;
        this.path = path;
    }

    public Integer getId() { return id; }
    public String getName() { return name; }
    public String getPath() { return path; }
    public void setPath(String path) { this.path = path; }
    public Integer getWidth() { return width; }
    public Integer getHeight() { return height; }

    // Stores the size only if both values look sane; otherwise leaves them null.
    public void setDimensions(Integer width, Integer height) {
        if (width != null && height != null && width > 0 && height > 0 && width <= 100_000 && height <= 100_000) {
            this.width = width;
            this.height = height;
        }
    }
}
