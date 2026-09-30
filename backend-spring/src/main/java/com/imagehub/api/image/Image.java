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

    protected Image() {} // required by JPA

    public Image(String name, String path) {
        this.name = name;
        this.path = path;
    }

    public Integer getId() { return id; }
    public String getName() { return name; }
    public String getPath() { return path; }
    public void setPath(String path) { this.path = path; }
}
