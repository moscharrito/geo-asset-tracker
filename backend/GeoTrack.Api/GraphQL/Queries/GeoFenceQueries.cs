using GeoTrack.Api.Data;
using GeoTrack.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace GeoTrack.Api.GraphQL.Queries;

[QueryType]
public class GeoFenceQueries
{
    /// <summary>
    /// Get all geofences
    /// </summary>
    [UseFiltering]
    [UseSorting]
    public IQueryable<GeoFence> GetGeoFences(GeoTrackDbContext context)
    {
        return context.GeoFences.AsNoTracking();
    }

    /// <summary>
    /// Get a single geofence by ID
    /// </summary>
    public async Task<GeoFence?> GetGeoFenceById(
        Guid id,
        GeoTrackDbContext context,
        CancellationToken cancellationToken)
    {
        return await context.GeoFences
            .AsNoTracking()
            .FirstOrDefaultAsync(g => g.Id == id, cancellationToken);
    }

    /// <summary>
    /// Get active geofences only
    /// </summary>
    public async Task<IEnumerable<GeoFence>> GetActiveGeoFences(
        GeoTrackDbContext context,
        CancellationToken cancellationToken)
    {
        return await context.GeoFences
            .AsNoTracking()
            .Where(g => g.IsActive)
            .OrderBy(g => g.Name)
            .ToListAsync(cancellationToken);
    }
}
