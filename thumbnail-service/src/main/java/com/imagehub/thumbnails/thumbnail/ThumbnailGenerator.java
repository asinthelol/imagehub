package com.imagehub.thumbnails.thumbnail;

import java.awt.Graphics2D;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Iterator;

import javax.imageio.IIOImage;
import javax.imageio.ImageIO;
import javax.imageio.ImageReader;
import javax.imageio.ImageWriteParam;
import javax.imageio.ImageWriter;
import javax.imageio.stream.FileImageOutputStream;
import javax.imageio.stream.ImageInputStream;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import com.luciad.imageio.webp.WebPWriteParam;

import net.coobird.thumbnailator.Thumbnails;

// Turns an image file into a small WebP thumbnail.
@Component
public class ThumbnailGenerator {

    // Refuse to decode anything bigger than this
    private static final long MAX_PIXELS = 100_000_000L;

    private final int maxWidth;
    private final float quality;

    public ThumbnailGenerator(@Value("${imagehub.thumbnail.max-width:640}") int maxWidth,
                              @Value("${imagehub.thumbnail.quality:0.8}") float quality) {
        this.maxWidth = maxWidth;
        this.quality = quality;
        ImageIO.scanForPlugins(); // make sure the WebP plugin is registered
    }

    /**
     * Writes a WebP thumbnail of {@code source} (at most maxWidth pixels wide,
     * EXIF rotation applied) to {@code target}.
     *
     * @throws CorruptImageException if the file can't be decoded as an image
     * @throws IOException           when it's worth retrying
     */
    public void generate(Path source, Path target) throws IOException {
        if (!Files.isReadable(source)) {
            throw new IOException("Can't read " + source);
        }
        checkDecodable(source);

        BufferedImage image;
        try {
            // Decoding at scale 1.0 also applies the EXIF orientation. Thumbnailator would enlarge a
            // small image if asked for a width, so the resize only happens when it is actually larger.
            image = Thumbnails.of(source.toFile()).scale(1.0).asBufferedImage();
            if (image.getWidth() > maxWidth) {
                image = Thumbnails.of(image).width(maxWidth).asBufferedImage();
            }
        } catch (IOException | RuntimeException e) {
            throw new CorruptImageException("Could not decode " + source.getFileName() + ": " + e.getMessage(), e);
        }

        writeWebp(image, target);
    }

    // is there a reader for this file, and is it a sane size?
    private static void checkDecodable(Path source) throws IOException {
        try (ImageInputStream in = ImageIO.createImageInputStream(source.toFile())) {
            Iterator<ImageReader> readers = in == null ? null : ImageIO.getImageReaders(in);
            if (readers == null || !readers.hasNext()) {
                throw new CorruptImageException("Not a supported image: " + source.getFileName());
            }
            ImageReader reader = readers.next();
            try {
                reader.setInput(in);
                long pixels = (long) reader.getWidth(0) * reader.getHeight(0);
                if (pixels > MAX_PIXELS) {
                    throw new CorruptImageException("Image too large (" + pixels + " pixels): " + source.getFileName());
                }
            } catch (IOException | RuntimeException e) {
                if (e instanceof CorruptImageException corrupt) {
                    throw corrupt;
                }
                throw new CorruptImageException("Unreadable image header: " + source.getFileName(), e);
            } finally {
                reader.dispose();
            }
        }
    }

    private void writeWebp(BufferedImage source, Path target) throws IOException {
        // The encoder is happiest with RGB or ARGB.
        boolean alpha = source.getColorModel().hasAlpha();
        BufferedImage image = new BufferedImage(
                source.getWidth(), source.getHeight(),
                alpha ? BufferedImage.TYPE_INT_ARGB : BufferedImage.TYPE_INT_RGB);
        Graphics2D g = image.createGraphics();
        try {
            g.drawImage(source, 0, 0, null);
        } finally {
            g.dispose();
        }

        Iterator<ImageWriter> writers = ImageIO.getImageWritersByMIMEType("image/webp");
        if (!writers.hasNext()) {
            throw new IllegalStateException("No WebP writer is registered; is webp-imageio on the classpath?");
        }
        ImageWriter writer = writers.next();
        WebPWriteParam param = new WebPWriteParam(writer.getLocale());
        param.setCompressionMode(ImageWriteParam.MODE_EXPLICIT);
        param.setCompressionType(param.getCompressionTypes()[WebPWriteParam.LOSSY_COMPRESSION]);
        param.setCompressionQuality(quality);

        // Write to a temp file and move it into place.
        Files.createDirectories(target.getParent());
        Path temp = target.resolveSibling(target.getFileName() + ".tmp");
        try (FileImageOutputStream out = new FileImageOutputStream(temp.toFile())) {
            writer.setOutput(out);
            writer.write(null, new IIOImage(image, null, null), param);
        } catch (IOException | RuntimeException e) {
            Files.deleteIfExists(temp);
            throw e;
        } finally {
            writer.dispose();
        }
        Files.move(temp, target, StandardCopyOption.ATOMIC_MOVE, StandardCopyOption.REPLACE_EXISTING);
    }
}
