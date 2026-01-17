using GeoTrack.Api.Data;
using GeoTrack.Api.GraphQL.Types;
using GeoTrack.Api.Models;
using NetTopologySuite.Geometries;

namespace GeoTrack.Api.GraphQL.Mutations;

[MutationType]
public class GeoFenceMutations
{
    private static readonly GeometryFactory GeometryFactory = new(new PrecisionModel(), 4326);

    /// <summary>
    /// Create a new geofence
    /// </summary>
    public async Task<GeoFence> CreateGeoFence(
        CreateGeoFenceInput input,
        GeoTrackDbContext context,
        CancellationToken cancellationToken)
    {
        if (input.Coordinates.Count < 3)
        {
            throw new GraphQLException("At least 3 coordinates are required to form a polygon.");
        }

        // Convert coordinates to polygon, closing the ring if needed
        var coords = input.Coordinates.Select(c => new Coordinate(c.Longitude, c.Latitude)).ToList();
        if (coords[0] != coords[^1])
        {
            coords.Add(coords[0]);
        }

        var geoFence = new GeoFence
        {
            Id = Guid.NewGuid(),
            Name = input.Name,
            Description = input.Description,
            Boundary = GeometryFactory.CreatePolygon(coords.ToArray()),
            Type = input.Type,
            IsActive = true,
            CreatedAt = DateTime.UtcNow
        };

        context.GeoFences.Add(geoFence);
        await context.SaveChangesAsync(cancellationToken);

        return geoFence;
    }

    /// <summary>
    /// Update a geofence
    /// </summary>
    public async Task<GeoFence> UpdateGeoFence(
        Guid id,
        string? name,
        string? description,
        List<CoordinateInput>? coordinates,
        GeoFenceType? type,
        bool? isActive,
        GeoTrackDbContext context,
        CancellationToken cancellationToken)
    {
        var geoFence = await context.GeoFences.FindAsync([id], cancellationToken)
            ?? throw new GraphQLException($"GeoFence with ID {id} not found.");

        if (name is not null)
            geoFence.Name = name;

        if (description is not null)
            geoFence.Description = description;

        if (coordinates is not null && coordinates.Count >= 3)
        {
            var coords = coordinates.Select(c => new Coordinate(c.Longitude, c.Latitude)).ToList();
            if (coords[0] != coords[^1])
            {
                coords.Add(coords[0]);
            }
            geoFence.Boundary = GeometryFactory.CreatePolygon(coords.ToArray());
        }

        if (type.HasValue)
            geoFence.Type = type.Value;

        if (isActive.HasValue)
            geoFence.IsActive = isActive.Value;

        await context.SaveChangesAsync(cancellationToken);

        return geoFence;
    }

    /// <summary>
    /// Delete a geofence
    /// </summary>
    public async Task<bool> DeleteGeoFence(
        Guid id,
        GeoTrackDbContext context,
        CancellationToken cancellationToken)
    {
        var geoFence = await context.GeoFences.FindAsync([id], cancellationToken);

        if (geoFence is null)
            return false;

        context.GeoFences.Remove(geoFence);
        await context.SaveChangesAsync(cancellationToken);

        return true;
    }

    /// <summary>
    /// Toggle geofence active status
    /// </summary>
    public async Task<GeoFence> ToggleGeoFenceActive(
        Guid id,
        GeoTrackDbContext context,
        CancellationToken cancellationToken)
    {
        var geoFence = await context.GeoFences.FindAsync([id], cancellationToken)
            ?? throw new GraphQLException($"GeoFence with ID {id} not found.");

        geoFence.IsActive = !geoFence.IsActive;
        await context.SaveChangesAsync(cancellationToken);

        return geoFence;
    }
}
