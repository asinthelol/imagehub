using Microsoft.EntityFrameworkCore;
using ImageHubAPI.Models;
using System.Collections.Generic;

namespace ImageHubAPI.Data
{
    public class APIContext : DbContext
    {
        public APIContext(DbContextOptions<APIContext> options) : base(options)
        {
        }

        public DbSet<Image> Images { get; set; }
    }
}
