using GeoTrack.Api.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace GeoTrack.Api.Infrastructure;

/// <summary>
/// Factory for creating DbContext instances at design time (for migrations)
/// </summary>
public class GeoTrackDbContextFactory : IDesignTimeDbContextFactory<GeoTrackDbContext>
{
    public GeoTrackDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<GeoTrackDbContext>();

        optionsBuilder.UseNpgsql(
            "Host=localhost;Port=5432;Database=geotrack;Username=postgres;Password=postgres",
            npgsqlOptions => npgsqlOptions.UseNetTopologySuite());

        return new GeoTrackDbContext(optionsBuilder.Options);
    }
}
