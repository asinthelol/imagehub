using Microsoft.EntityFrameworkCore;
using ImageHubAPI.Data;
using ImageHubAPI.Hubs;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddSignalR();

builder.Services.AddDbContext<APIContext>(options =>
    options.UseSqlite("Data Source=ImageHub.db"));

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
        policy.WithOrigins("http://localhost:3000") // Replace origin with your frontend's URL
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials());
});
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

var app = builder.Build();

app.UseCors("AllowFrontend");

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
}

app.UseAuthorization();

app.MapControllers();
app.MapHub<ImageHub>("/hubs/images");

app.UseStaticFiles();

app.Run();
