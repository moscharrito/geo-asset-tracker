import { gql } from '@apollo/client';

export const GET_ASSETS = gql`
  query GetAssets {
    assets {
      id
      name
      description
      assetType
      latitude
      longitude
      status
      createdAt
      updatedAt
      metadata
    }
  }
`;

export const GET_ASSET_BY_ID = gql`
  query GetAssetById($id: UUID!) {
    assetById(id: $id) {
      id
      name
      description
      assetType
      latitude
      longitude
      status
      createdAt
      updatedAt
      metadata
    }
  }
`;

export const GET_ASSETS_NEARBY = gql`
  query GetAssetsNearby($input: NearbySearchInputInput!) {
    assetsNearby(input: $input) {
      id
      name
      description
      assetType
      latitude
      longitude
      status
      createdAt
      updatedAt
    }
  }
`;

export const GET_ASSETS_WITHIN_GEOFENCE = gql`
  query GetAssetsWithinGeoFence($geoFenceId: UUID!) {
    assetsWithinGeoFence(geoFenceId: $geoFenceId) {
      id
      name
      description
      assetType
      latitude
      longitude
      status
    }
  }
`;

export const GET_ASSETS_BY_STATUS = gql`
  query GetAssetsByStatus($status: AssetStatus!) {
    assetsByStatus(status: $status) {
      id
      name
      description
      assetType
      latitude
      longitude
      status
    }
  }
`;

export const GET_ASSETS_BY_TYPE = gql`
  query GetAssetsByType($assetType: String!) {
    assetsByType(assetType: $assetType) {
      id
      name
      description
      assetType
      latitude
      longitude
      status
    }
  }
`;

export const GET_ASSET_TYPES = gql`
  query GetAssetTypes {
    assetTypes
  }
`;

export const SEARCH_ASSETS = gql`
  query SearchAssets($searchTerm: String!) {
    searchAssets(searchTerm: $searchTerm) {
      id
      name
      description
      assetType
      latitude
      longitude
      status
    }
  }
`;

export const GET_GEOFENCES = gql`
  query GetGeoFences {
    geoFences {
      id
      name
      description
      boundary
      type
      isActive
      createdAt
    }
  }
`;

export const GET_ACTIVE_GEOFENCES = gql`
  query GetActiveGeoFences {
    activeGeoFences {
      id
      name
      description
      boundary
      type
      isActive
      createdAt
    }
  }
`;
