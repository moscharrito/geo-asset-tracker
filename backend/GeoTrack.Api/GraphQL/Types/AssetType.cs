using GeoTrack.Api.Models;

namespace GeoTrack.Api.GraphQL.Types;

public class AssetType : ObjectType<Asset>
{
    protected override void Configure(IObjectTypeDescriptor<Asset> descriptor)
    {
        descriptor.Description("Represents a trackable asset with geographic location.");

        descriptor.Field(a => a.Id)
            .Description("The unique identifier of the asset.");

        descriptor.Field(a => a.Name)
            .Description("The display name of the asset.");

        descriptor.Field(a => a.Description)
            .Description("A detailed description of the asset.");

        descriptor.Field(a => a.AssetType)
            .Description("The category/type of asset (e.g., Vehicle, Equipment, Personnel).");

        descriptor.Field(a => a.Location)
            .Description("The current geographic location of the asset.");

        descriptor.Field(a => a.Status)
            .Description("The current operational status of the asset.");

        descriptor.Field(a => a.CreatedAt)
            .Description("When the asset was first registered in the system.");

        descriptor.Field(a => a.UpdatedAt)
            .Description("When the asset was last updated.");

        descriptor.Field(a => a.Metadata)
            .Description("Additional metadata stored as JSON.");

        // Add computed fields for convenience
        descriptor.Field("latitude")
            .Type<FloatType>()
            .Description("The latitude coordinate of the asset.")
            .Resolve(ctx => ctx.Parent<Asset>().Location.Y);

        descriptor.Field("longitude")
            .Type<FloatType>()
            .Description("The longitude coordinate of the asset.")
            .Resolve(ctx => ctx.Parent<Asset>().Location.X);
    }
}

public class AssetStatusType : EnumType<AssetStatus>
{
    protected override void Configure(IEnumTypeDescriptor<AssetStatus> descriptor)
    {
        descriptor.Description("The operational status of an asset.");

        descriptor.Value(AssetStatus.Active)
            .Description("Asset is active and operational.");

        descriptor.Value(AssetStatus.Inactive)
            .Description("Asset is temporarily inactive.");

        descriptor.Value(AssetStatus.Maintenance)
            .Description("Asset is undergoing maintenance.");

        descriptor.Value(AssetStatus.Retired)
            .Description("Asset has been permanently retired.");
    }
}
