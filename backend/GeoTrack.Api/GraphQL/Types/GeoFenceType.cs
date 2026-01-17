using GeoTrack.Api.Models;

namespace GeoTrack.Api.GraphQL.Types;

public class GeoFenceGraphQLType : ObjectType<GeoFence>
{
    protected override void Configure(IObjectTypeDescriptor<GeoFence> descriptor)
    {
        descriptor.Name("GeoFence");
        descriptor.Description("Represents a geographic boundary for monitoring asset locations.");

        descriptor.Field(g => g.Id)
            .Description("The unique identifier of the geofence.");

        descriptor.Field(g => g.Name)
            .Description("The display name of the geofence.");

        descriptor.Field(g => g.Description)
            .Description("A detailed description of the geofence.");

        descriptor.Field(g => g.Boundary)
            .Description("The polygon boundary of the geofence.");

        descriptor.Field(g => g.Type)
            .Description("Whether this is an inclusion or exclusion zone.");

        descriptor.Field(g => g.IsActive)
            .Description("Whether the geofence is currently active.");

        descriptor.Field(g => g.CreatedAt)
            .Description("When the geofence was created.");
    }
}

public class GeoFenceTypeEnumType : EnumType<GeoFenceType>
{
    protected override void Configure(IEnumTypeDescriptor<GeoFenceType> descriptor)
    {
        descriptor.Name("GeoFenceType");
        descriptor.Description("The type of geofence boundary.");

        descriptor.Value(GeoFenceType.Inclusion)
            .Description("Assets should remain within this boundary.");

        descriptor.Value(GeoFenceType.Exclusion)
            .Description("Assets should stay outside this boundary.");
    }
}
