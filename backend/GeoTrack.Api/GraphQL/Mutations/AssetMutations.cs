using GeoTrack.Api.Data;
using GeoTrack.Api.GraphQL.Types;
using GeoTrack.Api.Models;
using GeoTrack.Api.Services;
using HotChocolate.Subscriptions;
using Microsoft.EntityFrameworkCore;
using NetTopologySuite.Geometries;

namespace GeoTrack.Api.GraphQL.Mutations;

[MutationType]
public class AssetMutations
{
    private static readonly GeometryFactory GeometryFactory = new(new PrecisionModel(), 4326);

    /// <summary>
    /// Create a new asset
    /// </summary>
    public async Task<Asset> CreateAsset(
        CreateAssetInput input,
        GeoTrackDbContext context,
        [Service] ITopicEventSender eventSender,
        CancellationToken cancellationToken)
    {
        var asset = new Asset
        {
            Id = Guid.NewGuid(),
            Name = input.Name,
            Description = input.Description,
            AssetType = input.AssetType,
            Location = GeometryFactory.CreatePoint(new Coordinate(input.Longitude, input.Latitude)),
            Status = input.Status,
            Metadata = input.Metadata,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        context.Assets.Add(asset);
        await context.SaveChangesAsync(cancellationToken);

        // Publish event for subscription
        await eventSender.SendAsync(nameof(AssetSubscriptions.AssetCreated), asset, cancellationToken);

        return asset;
    }

    /// <summary>
    /// Update an existing asset
    /// </summary>
    public async Task<Asset> UpdateAsset(
        UpdateAssetInput input,
        GeoTrackDbContext context,
        [Service] ITopicEventSender eventSender,
        CancellationToken cancellationToken)
    {
        var asset = await context.Assets.FindAsync([input.Id], cancellationToken)
            ?? throw new GraphQLException($"Asset with ID {input.Id} not found.");

        if (input.Name is not null)
            asset.Name = input.Name;

        if (input.Description is not null)
            asset.Description = input.Description;

        if (input.AssetType is not null)
            asset.AssetType = input.AssetType;

        if (input.Latitude.HasValue && input.Longitude.HasValue)
            asset.Location = GeometryFactory.CreatePoint(new Coordinate(input.Longitude.Value, input.Latitude.Value));

        if (input.Status.HasValue)
            asset.Status = input.Status.Value;

        if (input.Metadata is not null)
            asset.Metadata = input.Metadata;

        asset.UpdatedAt = DateTime.UtcNow;

        await context.SaveChangesAsync(cancellationToken);

        // Publish event for subscription
        await eventSender.SendAsync(nameof(AssetSubscriptions.AssetUpdated), asset, cancellationToken);

        return asset;
    }

    /// <summary>
    /// Update only the location of an asset (optimized for frequent GPS updates)
    /// </summary>
    public async Task<Asset> UpdateAssetLocation(
        UpdateAssetLocationInput input,
        GeoTrackDbContext context,
        [Service] ITopicEventSender eventSender,
        CancellationToken cancellationToken)
    {
        var asset = await context.Assets.FindAsync([input.Id], cancellationToken)
            ?? throw new GraphQLException($"Asset with ID {input.Id} not found.");

        asset.Location = GeometryFactory.CreatePoint(new Coordinate(input.Longitude, input.Latitude));
        asset.UpdatedAt = DateTime.UtcNow;

        await context.SaveChangesAsync(cancellationToken);

        // Publish location update event
        await eventSender.SendAsync(nameof(AssetSubscriptions.AssetLocationUpdated), asset, cancellationToken);
        await eventSender.SendAsync($"{nameof(AssetSubscriptions.AssetLocationUpdated)}_{input.Id}", asset, cancellationToken);

        return asset;
    }

    /// <summary>
    /// Update the status of an asset
    /// </summary>
    public async Task<Asset> UpdateAssetStatus(
        Guid id,
        AssetStatus status,
        GeoTrackDbContext context,
        [Service] ITopicEventSender eventSender,
        CancellationToken cancellationToken)
    {
        var asset = await context.Assets.FindAsync([id], cancellationToken)
            ?? throw new GraphQLException($"Asset with ID {id} not found.");

        asset.Status = status;
        asset.UpdatedAt = DateTime.UtcNow;

        await context.SaveChangesAsync(cancellationToken);

        await eventSender.SendAsync(nameof(AssetSubscriptions.AssetUpdated), asset, cancellationToken);

        return asset;
    }

    /// <summary>
    /// Delete an asset
    /// </summary>
    public async Task<bool> DeleteAsset(
        Guid id,
        GeoTrackDbContext context,
        [Service] ITopicEventSender eventSender,
        CancellationToken cancellationToken)
    {
        var asset = await context.Assets.FindAsync([id], cancellationToken);

        if (asset is null)
            return false;

        context.Assets.Remove(asset);
        await context.SaveChangesAsync(cancellationToken);

        await eventSender.SendAsync(nameof(AssetSubscriptions.AssetDeleted), id, cancellationToken);

        return true;
    }

    /// <summary>
    /// Bulk update locations (for batch GPS updates)
    /// </summary>
    public async Task<IEnumerable<Asset>> BulkUpdateLocations(
        List<UpdateAssetLocationInput> inputs,
        GeoTrackDbContext context,
        [Service] ITopicEventSender eventSender,
        CancellationToken cancellationToken)
    {
        var ids = inputs.Select(i => i.Id).ToList();
        var assets = await context.Assets
            .Where(a => ids.Contains(a.Id))
            .ToDictionaryAsync(a => a.Id, cancellationToken);

        var updatedAssets = new List<Asset>();

        foreach (var input in inputs)
        {
            if (assets.TryGetValue(input.Id, out var asset))
            {
                asset.Location = GeometryFactory.CreatePoint(new Coordinate(input.Longitude, input.Latitude));
                asset.UpdatedAt = DateTime.UtcNow;
                updatedAssets.Add(asset);
            }
        }

        await context.SaveChangesAsync(cancellationToken);

        // Publish events for each updated asset
        foreach (var asset in updatedAssets)
        {
            await eventSender.SendAsync(nameof(AssetSubscriptions.AssetLocationUpdated), asset, cancellationToken);
        }

        return updatedAssets;
    }
}
