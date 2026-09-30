package com.imagehub.api.config;

import java.nio.file.Path;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final String allowedOrigin;
    private final Path uploadDir;

    public WebConfig(@Value("${imagehub.allowed-origin}") String allowedOrigin,
                     @Value("${imagehub.upload-dir}") String uploadDir) {
        this.allowedOrigin = allowedOrigin;
        this.uploadDir = Path.of(uploadDir).toAbsolutePath();
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(allowedOrigin)
                .allowedMethods("GET", "POST", "DELETE")
                .allowCredentials(true);
    }

    // Serve uploaded files at /uploads/** (the .NET app did this with wwwroot + UseStaticFiles).
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations(uploadDir.toUri().toString());
    }
}
