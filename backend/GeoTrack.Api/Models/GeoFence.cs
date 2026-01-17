using NetTopologySuite.Geometries;

namespace GeoTrack.Api.Models;

public class GeoFence
{
    public Guid Id { get; set; }

    public required string Name { get; set; }

    public string? Description { get; set; }

    /// <summary>
    /// Polygon boundary stored as PostGIS Polygon (SRID 4326 - WGS84)
    /// </summary>
    public required Polygon Boundary { get; set; }

    public GeoFenceType Type { get; set; } = GeoFenceType.Inclusion;

    public bool IsActive { get; set; } = true;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public enum GeoFenceType
{
    Inclusion,
    Exclusion
}
