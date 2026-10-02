package com.imagehub.thumbnails.thumbnail;

import java.awt.Color;
import java.awt.Graphics2D;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Random;
import java.util.stream.Stream;

import javax.imageio.ImageIO;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;

class ThumbnailGeneratorTest {

    @TempDir
    Path dir;

    ThumbnailGenerator generator;

    @BeforeEach
    void setUp() {
        generator = new ThumbnailGenerator(640, 0.8f);
    }

    // A noisy picture
    private static BufferedImage picture(int width, int height, boolean alpha) {
        BufferedImage img = new BufferedImage(width, height, alpha ? BufferedImage.TYPE_INT_ARGB : BufferedImage.TYPE_INT_RGB);
        Random random = new Random(42);
        Graphics2D g = img.createGraphics();
        for (int i = 0; i < 400; i++) {
            g.setColor(new Color(random.nextInt(256), random.nextInt(256), random.nextInt(256), alpha ? 255 : 255));
            g.fillRect(random.nextInt(width), random.nextInt(height), 1 + random.nextInt(width / 6 + 1), 1 + random.nextInt(height / 6 + 1));
        }
        g.dispose();
        return img;
    }

    private Path write(String name, BufferedImage image, String format) throws IOException {
        Path file = dir.resolve(name);
        assertTrue(ImageIO.write(image, format, file.toFile()), "no writer for " + format);
        return file;
    }

    private static BufferedImage read(Path webp) throws IOException {
        BufferedImage image = ImageIO.read(webp.toFile());
        assertTrue(image != null, "thumbnail isn't a readable image");
        return image;
    }

    @Test
    void largeJpegIsScaledDownKeepingAspectRatio() throws Exception {
        Path source = write("big.jpg", picture(2000, 1000, false), "jpg");
        Path thumb = dir.resolve("out/big.jpg.webp");

        generator.generate(source, thumb);

        BufferedImage result = read(thumb);
        assertEquals(640, result.getWidth());
        assertEquals(320, result.getHeight());
        assertTrue(Files.size(thumb) < Files.size(source), "a thumbnail should be smaller than the original");
    }

    @Test
    void smallImageIsNotEnlarged() throws Exception {
        Path source = write("small.png", picture(200, 100, false), "png");
        Path thumb = dir.resolve("small.png.webp");

        generator.generate(source, thumb);

        BufferedImage result = read(thumb);
        assertEquals(200, result.getWidth());
        assertEquals(100, result.getHeight());
    }

    @Test
    void transparencyIsKept() throws Exception {
        BufferedImage img = new BufferedImage(800, 400, BufferedImage.TYPE_INT_ARGB);
        Graphics2D g = img.createGraphics();
        g.setColor(new Color(200, 40, 40, 255));
        g.fillRect(0, 0, 400, 400);          // opaque left half; right half stays fully transparent
        g.dispose();
        Path thumb = dir.resolve("alpha.png.webp");

        generator.generate(write("alpha.png", img, "png"), thumb);

        BufferedImage result = read(thumb);
        assertEquals(255, result.getRGB(100, 100) >>> 24, "opaque side should stay opaque");
        assertTrue((result.getRGB(result.getWidth() - 50, 100) >>> 24) < 20, "transparent side should stay transparent");
    }

    @Test
    void webpAndGifInputsWork() throws Exception {
        Path webp = write("in.webp", picture(900, 600, false), "webp");
        Path gif = write("in.gif", picture(900, 600, false), "gif");

        generator.generate(webp, dir.resolve("a.webp"));
        generator.generate(gif, dir.resolve("b.webp"));

        assertEquals(640, read(dir.resolve("a.webp")).getWidth());
        assertEquals(640, read(dir.resolve("b.webp")).getWidth());
    }

    @Test
    void exifRotationIsApplied() throws Exception {
        // fixture: 800x400 pixels tagged "rotate 90 degrees", i.e. it should display as 400 wide, 800 tall
        Path source = Path.of(getClass().getResource("/fixtures/exif-rotated.jpg").toURI());
        Path thumb = dir.resolve("rotated.webp");

        generator.generate(source, thumb);

        BufferedImage result = read(thumb);
        assertEquals(400, result.getWidth());
        assertEquals(800, result.getHeight());
    }

    @Test
    void aFileThatIsNotAnImageIsRejectedAsCorrupt() throws Exception {
        Path source = dir.resolve("fake.png");
        Files.writeString(source, "this is definitely not a png");

        assertThrows(CorruptImageException.class, () -> generator.generate(source, dir.resolve("fake.webp")));
        assertFalse(Files.exists(dir.resolve("fake.webp")));
    }

    @Test
    void aJpegCutOffInsideItsHeaderIsRejectedAsCorruptAndLeavesNothingBehind() throws Exception {
        byte[] whole = Files.readAllBytes(write("whole.jpg", picture(1200, 800, false), "jpg"));
        Path headerOnly = dir.resolve("cut.jpg");
        Files.write(headerOnly, java.util.Arrays.copyOf(whole, 60));

        assertThrows(CorruptImageException.class, () -> generator.generate(headerOnly, dir.resolve("cut.webp")));

        try (Stream<Path> files = Files.list(dir)) {
            assertTrue(files.noneMatch(p -> p.getFileName().toString().startsWith("cut.webp")),
                    "no thumbnail or temp file should remain after a failure");
        }
    }

    @Test
    void aJpegCutOffMidwayGetsAThumbnailOfWhatDecodes() throws Exception {
        // Java's JPEG decoder is lenient: it decodes the part that exists and fills in the rest, the same
        // partial picture a browser would show for the original. So this is not treated as corrupt.
        byte[] whole = Files.readAllBytes(write("whole2.jpg", picture(1200, 800, false), "jpg"));
        Path partial = dir.resolve("partial.jpg");
        Files.write(partial, java.util.Arrays.copyOf(whole, whole.length / 3));
        Path thumb = dir.resolve("partial.webp");

        generator.generate(partial, thumb);

        assertEquals(640, read(thumb).getWidth());
        try (Stream<Path> files = Files.list(dir)) {
            assertTrue(files.noneMatch(p -> p.getFileName().toString().endsWith(".tmp")), "no temp file left behind");
        }
    }

    @Test
    void aMissingFileIsAnIoErrorNotACorruptImage() {
        // Missing/unreadable is infrastructure trouble, which the error handler retries; corrupt is not retried.
        assertThrows(IOException.class, () -> generator.generate(dir.resolve("nope.jpg"), dir.resolve("nope.webp")));
    }

    @Test
    void successLeavesOnlyTheThumbnail() throws Exception {
        Path source = write("clean.jpg", picture(1000, 700, false), "jpg");
        Path out = dir.resolve("thumbs");
        generator.generate(source, out.resolve("clean.jpg.webp"));

        try (Stream<Path> files = Files.list(out)) {
            assertEquals(1, files.count(), "temp file should have been moved into place");
        }
    }
}
