using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using ImageHubAPI.Models;
using ImageHubAPI.Data;
using ImageHubAPI.Hubs;

namespace ImageHubAPI.Controllers
{
    [Route("api/upload")]
    [ApiController]
    public class UploadController : ControllerBase
    {
        private readonly APIContext _context;
        private readonly IHubContext<ImageHub> _hubContext;

        public UploadController(APIContext context, IHubContext<ImageHub> hubContext)
        {
            _context = context;
            _hubContext = hubContext;
        }

        // Create a new image
        [HttpPost]
        [Consumes("multipart/form-data")]
        public async Task<ActionResult<Image>> PostImage(
            [FromForm] IFormFile file,
            [FromForm] string imageName,
            [FromForm] string imagePath)
        {
            if (file == null || file.Length == 0 || string.IsNullOrWhiteSpace(imageName) || string.IsNullOrWhiteSpace(imagePath))
            {
                return BadRequest(new { error = "No file uploaded or missing image name." });
            }

            var sanitizedFileName = imageName.Replace(" ", "_");

        
            var image = new Image
            {
                Name = sanitizedFileName,
                Path = imagePath
            };

            _context.Images.Add(image);
            await _context.SaveChangesAsync();

            // Notify all connected clients that images have been updated
            await _hubContext.Clients.All.SendAsync("ImagesUpdated");

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
