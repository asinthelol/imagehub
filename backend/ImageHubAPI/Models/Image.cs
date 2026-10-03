namespace ImageHubAPI.Models
{
    public class Image
    {
        public int Id { get; set; }
        public required string Name { get; set; }
        public required string Path { get; set; }

        // Pixel size, measured by the browser at upload. Null for rows created before this existed.
        public int? Width { get; set; }
        public int? Height { get; set; }
    }
}
