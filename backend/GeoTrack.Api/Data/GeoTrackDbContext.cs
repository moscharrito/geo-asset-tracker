using GeoTrack.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace GeoTrack.Api.Data;

public class GeoTrackDbContext : DbContext
{
    public GeoTrackDbContext(DbContextOptions<GeoTrackDbContext> options)
        : base(options)
    {
    }

    public DbSet<Asset> Assets => Set<Asset>();
    public DbSet<GeoFence> GeoFences => Set<GeoFence>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Enable PostGIS extension
        modelBuilder.HasPostgresExtension("postgis");

        // Configure Asset entity
        modelBuilder.Entity<Asset>(entity =>
        {
            entity.HasKey(e => e.Id);

            entity.Property(e => e.Name)
                .IsRequired()
                .HasMaxLength(200);

            entity.Property(e => e.Description)
                .HasMaxLength(1000);

            entity.Property(e => e.AssetType)
                .IsRequired()
                .HasMaxLength(100);

            // Configure spatial column with SRID 4326 (WGS84)
            entity.Property(e => e.Location)
                .HasColumnType("geography(Point, 4326)");

            entity.Property(e => e.Status)
                .HasConversion<string>()
                .HasMaxLength(50);

            entity.Property(e => e.Metadata)
                .HasColumnType("jsonb");

            // Create spatial index for efficient geospatial queries
            entity.HasIndex(e => e.Location)
                .HasMethod("GIST");

            entity.HasIndex(e => e.Status);
            entity.HasIndex(e => e.AssetType);
        });

        // Configure GeoFence entity
        modelBuilder.Entity<GeoFence>(entity =>
        {
            entity.HasKey(e => e.Id);

            entity.Property(e => e.Name)
                .IsRequired()
                .HasMaxLength(200);

            entity.Property(e => e.Description)
                .HasMaxLength(1000);

            // Configure spatial column for polygon boundary
            entity.Property(e => e.Boundary)
                .HasColumnType("geography(Polygon, 4326)");

            entity.Property(e => e.Type)
                .HasConversion<string>()
                .HasMaxLength(50);

            // Create spatial index
            entity.HasIndex(e => e.Boundary)
                .HasMethod("GIST");
        });
    }
}
