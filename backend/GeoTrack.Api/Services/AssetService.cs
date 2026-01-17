using GeoTrack.Api.Data;
using GeoTrack.Api.Models;
using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Geometries;

namespace GeoTrack.Api.Services;

public interface IAssetService
{
    Task<IEnumerable<Asset>> GetAssetsWithinDistanceAsync(Point point, double distanceMeters, CancellationToken cancellationToken = default);
    Task<IEnumerable<Asset>> GetAssetsWithinPolygonAsync(Polygon polygon, CancellationToken cancellationToken = default);
    Task<bool> IsAssetWithinGeoFenceAsync(Guid assetId, Guid geoFenceId, CancellationToken cancellationToken = default);
    Task<IEnumerable<GeoFence>> GetGeoFencesContainingAssetAsync(Guid assetId, CancellationToken cancellationToken = default);
    Task SeedDemoDataAsync(CancellationToken cancellationToken = default);
}

public class AssetService : IAssetService
{
    private readonly GeoTrackDbContext _context;
    private static readonly GeometryFactory GeometryFactory = new(new PrecisionModel(), 4326);

    public AssetService(GeoTrackDbContext context)
    {
        _context = context;
    }

    public async Task<IEnumerable<Asset>> GetAssetsWithinDistanceAsync(
        Point point,
        double distanceMeters,
        CancellationToken cancellationToken = default)
    {
        return await _context.Assets
            .AsNoTracking()
            .Where(a => a.Location.IsWithinDistance(point, distanceMeters))
            .OrderBy(a => a.Location.Distance(point))
            .ToListAsync(cancellationToken);
    }

    public async Task<IEnumerable<Asset>> GetAssetsWithinPolygonAsync(
        Polygon polygon,
        CancellationToken cancellationToken = default)
    {
        return await _context.Assets
            .AsNoTracking()
            .Where(a => a.Location.Within(polygon))
            .ToListAsync(cancellationToken);
    }

    public async Task<bool> IsAssetWithinGeoFenceAsync(
        Guid assetId,
        Guid geoFenceId,
        CancellationToken cancellationToken = default)
    {
        var asset = await _context.Assets
            .AsNoTracking()
            .FirstOrDefaultAsync(a => a.Id == assetId, cancellationToken);

        var geoFence = await _context.GeoFences
            .AsNoTracking()
            .FirstOrDefaultAsync(g => g.Id == geoFenceId, cancellationToken);

        if (asset is null || geoFence is null)
            return false;

        return asset.Location.Within(geoFence.Boundary);
    }

    public async Task<IEnumerable<GeoFence>> GetGeoFencesContainingAssetAsync(
        Guid assetId,
        CancellationToken cancellationToken = default)
    {
        var asset = await _context.Assets
            .AsNoTracking()
            .FirstOrDefaultAsync(a => a.Id == assetId, cancellationToken);

        if (asset is null)
            return Enumerable.Empty<GeoFence>();

        return await _context.GeoFences
            .AsNoTracking()
            .Where(g => g.IsActive && asset.Location.Within(g.Boundary))
            .ToListAsync(cancellationToken);
    }

    public async Task SeedDemoDataAsync(CancellationToken cancellationToken = default)
    {
        if (await _context.Assets.AnyAsync(cancellationToken))
            return;

        // Demo assets around San Francisco
        var demoAssets = new List<Asset>
        {
            new()
            {
                Id = Guid.NewGuid(),
                Name = "Delivery Truck #1",
                Description = "Ford Transit delivery vehicle",
                AssetType = "Vehicle",
                Location = GeometryFactory.CreatePoint(new Coordinate(-122.4194, 37.7749)),
                Status = AssetStatus.Active
            },
            new()
            {
                Id = Guid.NewGuid(),
                Name = "Delivery Truck #2",
                Description = "Mercedes Sprinter delivery vehicle",
                AssetType = "Vehicle",
                Location = GeometryFactory.CreatePoint(new Coordinate(-122.4094, 37.7849)),
                Status = AssetStatus.Active
            },
            new()
            {
                Id = Guid.NewGuid(),
                Name = "Field Technician #1",
                Description = "Senior maintenance technician",
                AssetType = "Personnel",
                Location = GeometryFactory.CreatePoint(new Coordinate(-122.4294, 37.7649)),
                Status = AssetStatus.Active
            },
            new()
            {
                Id = Guid.NewGuid(),
                Name = "Generator Unit A",
                Description = "Portable power generator",
                AssetType = "Equipment",
                Location = GeometryFactory.CreatePoint(new Coordinate(-122.3994, 37.7949)),
                Status = AssetStatus.Active
            },
            new()
            {
                Id = Guid.NewGuid(),
                Name = "Forklift #3",
                Description = "Electric warehouse forklift",
                AssetType = "Equipment",
                Location = GeometryFactory.CreatePoint(new Coordinate(-122.4394, 37.7549)),
                Status = AssetStatus.Maintenance
            },
            new()
            {
                Id = Guid.NewGuid(),
                Name = "Service Van #5",
                Description = "HVAC service vehicle",
                AssetType = "Vehicle",
                Location = GeometryFactory.CreatePoint(new Coordinate(-122.4494, 37.7449)),
                Status = AssetStatus.Active
            },
            new()
            {
                Id = Guid.NewGuid(),
                Name = "Drone Unit #1",
                Description = "DJI inspection drone",
                AssetType = "Equipment",
                Location = GeometryFactory.CreatePoint(new Coordinate(-122.4144, 37.7799)),
                Status = AssetStatus.Active
            },
            new()
            {
                Id = Guid.NewGuid(),
                Name = "Field Supervisor",
                Description = "Area supervisor for downtown region",
                AssetType = "Personnel",
                Location = GeometryFactory.CreatePoint(new Coordinate(-122.4244, 37.7699)),
                Status = AssetStatus.Active
            }
        };

        _context.Assets.AddRange(demoAssets);

        // Demo geofence - Downtown SF zone
        var downtownCoords = new[]
        {
            new Coordinate(-122.4294, 37.7899),
            new Coordinate(-122.4094, 37.7899),
            new Coordinate(-122.4094, 37.7599),
            new Coordinate(-122.4294, 37.7599),
            new Coordinate(-122.4294, 37.7899)
        };

        var demoGeoFence = new GeoFence
        {
            Id = Guid.NewGuid(),
            Name = "Downtown SF Zone",
            Description = "Primary service area in downtown San Francisco",
            Boundary = GeometryFactory.CreatePolygon(downtownCoords),
            Type = GeoFenceType.Inclusion,
            IsActive = true
        };

        _context.GeoFences.Add(demoGeoFence);

        await _context.SaveChangesAsync(cancellationToken);
    }
}
