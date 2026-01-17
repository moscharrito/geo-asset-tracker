using NetTopologySuite.Geometries;

namespace GeoTrack.Api.Models;

public class Asset
{
    public Guid Id { get; set; }

    public required string Name { get; set; }

    public required string Description { get; set; }

    public required string AssetType { get; set; }

    /// <summary>
    /// Geographic location stored as PostGIS Point (SRID 4326 - WGS84)
    /// </summary>
    public required Point Location { get; set; }

    public AssetStatus Status { get; set; } = AssetStatus.Active;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Optional metadata stored as JSON
    /// </summary>
    public string? Metadata { get; set; }
}

public enum AssetStatus
{
    Active,
    Inactive,
    Maintenance,
    Retired
}
