using GeoTrack.Api.Models;

namespace GeoTrack.Api.GraphQL.Types;

public class CreateAssetInput
{
    public required string Name { get; set; }
    public required string Description { get; set; }
    public required string AssetType { get; set; }
    public required double Latitude { get; set; }
    public required double Longitude { get; set; }
    public AssetStatus Status { get; set; } = AssetStatus.Active;
    public string? Metadata { get; set; }
}

public class UpdateAssetInput
{
    public required Guid Id { get; set; }
    public string? Name { get; set; }
    public string? Description { get; set; }
    public string? AssetType { get; set; }
    public double? Latitude { get; set; }
    public double? Longitude { get; set; }
    public AssetStatus? Status { get; set; }
    public string? Metadata { get; set; }
}

public class UpdateAssetLocationInput
{
    public required Guid Id { get; set; }
    public required double Latitude { get; set; }
    public required double Longitude { get; set; }
}

public class CoordinateInput
{
    public required double Latitude { get; set; }
    public required double Longitude { get; set; }
}

public class CreateGeoFenceInput
{
    public required string Name { get; set; }
    public string? Description { get; set; }
    public required List<CoordinateInput> Coordinates { get; set; }
    public GeoFenceType Type { get; set; } = GeoFenceType.Inclusion;
}

public class AssetFilterInput
{
    public string? AssetType { get; set; }
    public AssetStatus? Status { get; set; }
    public string? SearchTerm { get; set; }
}

public class NearbySearchInput
{
    public required double Latitude { get; set; }
    public required double Longitude { get; set; }
    public required double DistanceMeters { get; set; }
}
