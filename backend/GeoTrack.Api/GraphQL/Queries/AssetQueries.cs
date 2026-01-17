using GeoTrack.Api.Data;
using GeoTrack.Api.GraphQL.Types;
using GeoTrack.Api.Models;
using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Geometries;

namespace GeoTrack.Api.GraphQL.Queries;

[QueryType]
public class AssetQueries
{
    /// <summary>
    /// Get all assets with optional filtering
    /// </summary>
    [UseFiltering]
    [UseSorting]
    public IQueryable<Asset> GetAssets(GeoTrackDbContext context)
    {
        return context.Assets.AsNoTracking();
    }

    /// <summary>
    /// Get a single asset by ID
    /// </summary>
    public async Task<Asset?> GetAssetById(
        Guid id,
        GeoTrackDbContext context,
        CancellationToken cancellationToken)
    {
        return await context.Assets
            .AsNoTracking()
            .FirstOrDefaultAsync(a => a.Id == id, cancellationToken);
    }

    /// <summary>
    /// Find assets within a specified distance from a point using PostGIS IsWithinDistance
    /// </summary>
    public async Task<IEnumerable<Asset>> GetAssetsNearby(
        NearbySearchInput input,
        GeoTrackDbContext context,
        CancellationToken cancellationToken)
    {
        var geometryFactory = new GeometryFactory(new PrecisionModel(), 4326);
        var searchPoint = geometryFactory.CreatePoint(new Coordinate(input.Longitude, input.Latitude));

        return await context.Assets
            .AsNoTracking()
            .Where(a => a.Location.IsWithinDistance(searchPoint, input.DistanceMeters))
            .OrderBy(a => a.Location.Distance(searchPoint))
            .ToListAsync(cancellationToken);
    }

    /// <summary>
    /// Find assets within a geofence boundary using PostGIS Within
    /// </summary>
    public async Task<IEnumerable<Asset>> GetAssetsWithinGeoFence(
        Guid geoFenceId,
        GeoTrackDbContext context,
        CancellationToken cancellationToken)
    {
        var geoFence = await context.GeoFences
            .AsNoTracking()
            .FirstOrDefaultAsync(g => g.Id == geoFenceId, cancellationToken);

        if (geoFence == null)
        {
            return Enumerable.Empty<Asset>();
        }

        return await context.Assets
            .AsNoTracking()
            .Where(a => a.Location.Within(geoFence.Boundary))
            .ToListAsync(cancellationToken);
    }

    /// <summary>
    /// Find assets within a custom polygon boundary
    /// </summary>
    public async Task<IEnumerable<Asset>> GetAssetsWithinBoundary(
        List<CoordinateInput> coordinates,
        GeoTrackDbContext context,
        CancellationToken cancellationToken)
    {
        if (coordinates.Count < 3)
        {
            throw new GraphQLException("At least 3 coordinates are required to form a polygon.");
        }

        var geometryFactory = new GeometryFactory(new PrecisionModel(), 4326);

        // Close the ring if not already closed
        var coords = coordinates.Select(c => new Coordinate(c.Longitude, c.Latitude)).ToList();
        if (coords[0] != coords[^1])
        {
            coords.Add(coords[0]);
        }

        var polygon = geometryFactory.CreatePolygon(coords.ToArray());

        return await context.Assets
            .AsNoTracking()
            .Where(a => a.Location.Within(polygon))
            .ToListAsync(cancellationToken);
    }

    /// <summary>
    /// Get assets by status
    /// </summary>
    public async Task<IEnumerable<Asset>> GetAssetsByStatus(
        AssetStatus status,
        GeoTrackDbContext context,
        CancellationToken cancellationToken)
    {
        return await context.Assets
            .AsNoTracking()
            .Where(a => a.Status == status)
            .OrderBy(a => a.Name)
            .ToListAsync(cancellationToken);
    }

    /// <summary>
    /// Get assets by type
    /// </summary>
    public async Task<IEnumerable<Asset>> GetAssetsByType(
        string assetType,
        GeoTrackDbContext context,
        CancellationToken cancellationToken)
    {
        return await context.Assets
            .AsNoTracking()
            .Where(a => a.AssetType == assetType)
            .OrderBy(a => a.Name)
            .ToListAsync(cancellationToken);
    }

    /// <summary>
    /// Search assets by name or description
    /// </summary>
    public async Task<IEnumerable<Asset>> SearchAssets(
        string searchTerm,
        GeoTrackDbContext context,
        CancellationToken cancellationToken)
    {
        var term = searchTerm.ToLower();

        return await context.Assets
            .AsNoTracking()
            .Where(a => a.Name.ToLower().Contains(term) ||
                        a.Description.ToLower().Contains(term))
            .OrderBy(a => a.Name)
            .ToListAsync(cancellationToken);
    }

    /// <summary>
    /// Get all distinct asset types
    /// </summary>
    public async Task<IEnumerable<string>> GetAssetTypes(
        GeoTrackDbContext context,
        CancellationToken cancellationToken)
    {
        return await context.Assets
            .AsNoTracking()
            .Select(a => a.AssetType)
            .Distinct()
            .OrderBy(t => t)
            .ToListAsync(cancellationToken);
    }
}
