using GeoTrack.Api.Models;

namespace GeoTrack.Api.GraphQL.Subscriptions;

[SubscriptionType]
public class AssetSubscriptions
{
    /// <summary>
    /// Subscribe to all asset creation events
    /// </summary>
    [Subscribe]
    [Topic]
    public Asset AssetCreated([EventMessage] Asset asset) => asset;

    /// <summary>
    /// Subscribe to all asset update events
    /// </summary>
    [Subscribe]
    [Topic]
    public Asset AssetUpdated([EventMessage] Asset asset) => asset;

    /// <summary>
    /// Subscribe to all asset location update events
    /// </summary>
    [Subscribe]
    [Topic]
    public Asset AssetLocationUpdated([EventMessage] Asset asset) => asset;

    /// <summary>
    /// Subscribe to location updates for a specific asset
    /// </summary>
    [Subscribe]
    [Topic($"{nameof(AssetLocationUpdated)}_{{assetId}}")]
    public Asset AssetLocationUpdatedById(
        [EventMessage] Asset asset,
        Guid assetId) => asset;

    /// <summary>
    /// Subscribe to asset deletion events
    /// </summary>
    [Subscribe]
    [Topic]
    public Guid AssetDeleted([EventMessage] Guid assetId) => assetId;
}
