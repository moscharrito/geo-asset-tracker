import { useEffect, useCallback } from 'react';
import { useQuery, useSubscription, useApolloClient } from '@apollo/client';
import { GET_ASSETS } from '../apollo/queries';
import {
  ASSET_CREATED,
  ASSET_UPDATED,
  ASSET_LOCATION_UPDATED,
  ASSET_DELETED,
} from '../apollo/subscriptions';
import { Asset } from '../types/Asset';

interface UseAssetsResult {
  assets: Asset[];
  loading: boolean;
  error?: Error;
  refetch: () => void;
}

export function useAssets(): UseAssetsResult {
  const client = useApolloClient();
  const { data, loading, error, refetch } = useQuery<{ assets: Asset[] }>(GET_ASSETS);

  // Subscribe to asset created events
  useSubscription<{ assetCreated: Asset }>(ASSET_CREATED, {
    onData: ({ data: subData }) => {
      if (subData.data?.assetCreated) {
        const newAsset = subData.data.assetCreated;
        const existingData = client.readQuery<{ assets: Asset[] }>({ query: GET_ASSETS });

        if (existingData) {
          client.writeQuery({
            query: GET_ASSETS,
            data: {
              assets: [...existingData.assets, newAsset],
            },
          });
        }
      }
    },
  });

  // Subscribe to asset updated events
  useSubscription<{ assetUpdated: Asset }>(ASSET_UPDATED, {
    onData: ({ data: subData }) => {
      if (subData.data?.assetUpdated) {
        const updatedAsset = subData.data.assetUpdated;
        const existingData = client.readQuery<{ assets: Asset[] }>({ query: GET_ASSETS });

        if (existingData) {
          client.writeQuery({
            query: GET_ASSETS,
            data: {
              assets: existingData.assets.map((asset) =>
                asset.id === updatedAsset.id ? updatedAsset : asset
              ),
            },
          });
        }
      }
    },
  });

  // Subscribe to asset location updated events (optimized for frequent GPS updates)
  useSubscription<{ assetLocationUpdated: Asset }>(ASSET_LOCATION_UPDATED, {
    onData: ({ data: subData }) => {
      if (subData.data?.assetLocationUpdated) {
        const updatedAsset = subData.data.assetLocationUpdated;
        const existingData = client.readQuery<{ assets: Asset[] }>({ query: GET_ASSETS });

        if (existingData) {
          client.writeQuery({
            query: GET_ASSETS,
            data: {
              assets: existingData.assets.map((asset) =>
                asset.id === updatedAsset.id
                  ? { ...asset, latitude: updatedAsset.latitude, longitude: updatedAsset.longitude, updatedAt: updatedAsset.updatedAt }
                  : asset
              ),
            },
          });
        }
      }
    },
  });

  // Subscribe to asset deleted events
  useSubscription<{ assetDeleted: string }>(ASSET_DELETED, {
    onData: ({ data: subData }) => {
      if (subData.data?.assetDeleted) {
        const deletedId = subData.data.assetDeleted;
        const existingData = client.readQuery<{ assets: Asset[] }>({ query: GET_ASSETS });

        if (existingData) {
          client.writeQuery({
            query: GET_ASSETS,
            data: {
              assets: existingData.assets.filter((asset) => asset.id !== deletedId),
            },
          });
        }
      }
    },
  });

  const handleRefetch = useCallback(() => {
    refetch();
  }, [refetch]);

  return {
    assets: data?.assets || [],
    loading,
    error: error as Error | undefined,
    refetch: handleRefetch,
  };
}

// Hook for subscribing to a specific asset's location updates
export function useAssetLocationSubscription(assetId: string | null) {
  const { data, loading, error } = useSubscription<{ assetLocationUpdatedById: Asset }>(
    ASSET_LOCATION_UPDATED,
    {
      variables: { assetId },
      skip: !assetId,
    }
  );

  return {
    asset: data?.assetLocationUpdatedById || null,
    loading,
    error: error as Error | undefined,
  };
}
