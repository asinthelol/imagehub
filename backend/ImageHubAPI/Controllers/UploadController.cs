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
            [FromForm] string imagePath,
            [FromForm] int? width,
            [FromForm] int? height)
        {
            if (file == null || file.Length == 0 || string.IsNullOrWhiteSpace(imageName) || string.IsNullOrWhiteSpace(imagePath))
            {
                return BadRequest(new { error = "No file uploaded or missing image name." });
            }

            var sanitizedFileName = imageName.Replace(" ", "_");

        
            // Only keep the size if both values look sane; otherwise leave them null.
            var hasSize = width is > 0 and <= 100_000 && height is > 0 and <= 100_000;

            var uploadsFolder = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot/uploads");
            Directory.CreateDirectory(uploadsFolder);

            // A random file name means a URL is never reused.
            // (a switch between backends would put a new picture at an old URL)
            var extension = new string(Path.GetExtension(file.FileName).Where(char.IsLetterOrDigit).ToArray());
            var fileName = extension.Length > 0 ? $"{Guid.NewGuid()}.{extension}" : $"{Guid.NewGuid()}";
            var filePath = Path.Combine(uploadsFolder, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var image = new Image
            {
                Name = sanitizedFileName,
                Path = $"/uploads/{fileName}",
                Width = hasSize ? width : null,
                Height = hasSize ? height : null
            };

            try
            {
                _context.Images.Add(image);
                await _context.SaveChangesAsync();
            }
            catch
            {
                System.IO.File.Delete(filePath);
                throw;
            }

            // Notify all connected clients that images have been updated
            await _hubContext.Clients.All.SendAsync("ImagesUpdated");

            return Ok(new { message = "Image uploaded successfully", image });
        }
    }
}
