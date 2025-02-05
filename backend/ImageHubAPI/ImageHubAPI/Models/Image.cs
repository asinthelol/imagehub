namespace ImageHubAPI.Models
{
    public class Image
    {
        public int Id { get; set; }
        public required string Name { get; set; }
        public required string Path { get; set; }
    }
}
