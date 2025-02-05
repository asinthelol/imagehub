using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using ImageHubAPI.Models;
using ImageHubAPI.Data;

namespace ImageHubAPI.Controllers
{
    [Route("api/upload")]
    [ApiController]
    public class UploadController : ControllerBase
    {
        private readonly APIContext _context;

        public UploadController(APIContext context)
        {
            _context = context;
        }

        public class ImageUploadDto
        {
            public string ImageName { get; set; } = string.Empty;
            public string ImagePath { get; set; } = string.Empty;
        }

        // Create a new image
        [HttpPost]
        [Consumes("multipart/form-data")]
        public async Task<ActionResult<Image>> PostImage(
            [FromForm] IFormFile file,
            [FromForm] string imageName,
            [FromForm] string imagePath)
        {
            Console.WriteLine("Received Image Name: " + imageName);
            Console.WriteLine("Received Image Path: " + imagePath);
            Console.WriteLine("Received File: " + (file?.FileName ?? "No file"));
            if (file == null || file.Length == 0 || string.IsNullOrWhiteSpace(imageName) || string.IsNullOrWhiteSpace(imagePath))
            {
                return BadRequest(new { error = "No file uploaded or missing image name." });
            }

            var image = new Image
            {
                Name = imageName,
                Path = imagePath
            };

            _context.Images.Add(image);
            await _context.SaveChangesAsync();

            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/uploads");
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            var fileName = $"{image.Id}{Path.GetExtension(file.FileName)}";
            var filePath = Path.Combine(uploadsFolder, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            image.Path = $"/uploads/{fileName}";
            await _context.SaveChangesAsync();

            return Ok(new { message = "Image uploaded successfully", image });
        }
    }
}
