import { gql } from '@apollo/client';

export const CREATE_ASSET = gql`
  mutation CreateAsset($input: CreateAssetInputInput!) {
    createAsset(input: $input) {
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

export const UPDATE_ASSET = gql`
  mutation UpdateAsset($input: UpdateAssetInputInput!) {
    updateAsset(input: $input) {
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

export const UPDATE_ASSET_LOCATION = gql`
  mutation UpdateAssetLocation($input: UpdateAssetLocationInputInput!) {
    updateAssetLocation(input: $input) {
      id
      name
      latitude
      longitude
      updatedAt
    }
  }
`;

export const UPDATE_ASSET_STATUS = gql`
  mutation UpdateAssetStatus($id: UUID!, $status: AssetStatus!) {
    updateAssetStatus(id: $id, status: $status) {
      id
      name
      status
      updatedAt
    }
  }
`;

export const DELETE_ASSET = gql`
  mutation DeleteAsset($id: UUID!) {
    deleteAsset(id: $id)
  }
`;

export const BULK_UPDATE_LOCATIONS = gql`
  mutation BulkUpdateLocations($inputs: [UpdateAssetLocationInputInput!]!) {
    bulkUpdateLocations(inputs: $inputs) {
      id
      name
      latitude
      longitude
      updatedAt
    }
  }
`;

export const CREATE_GEOFENCE = gql`
  mutation CreateGeoFence($input: CreateGeoFenceInputInput!) {
    createGeoFence(input: $input) {
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

export const UPDATE_GEOFENCE = gql`
  mutation UpdateGeoFence(
    $id: UUID!
    $name: String
    $description: String
    $coordinates: [CoordinateInputInput!]
    $type: GeoFenceType
    $isActive: Boolean
  ) {
    updateGeoFence(
      id: $id
      name: $name
      description: $description
      coordinates: $coordinates
      type: $type
      isActive: $isActive
    ) {
      id
      name
      description
      boundary
      type
      isActive
    }
  }
`;

export const DELETE_GEOFENCE = gql`
  mutation DeleteGeoFence($id: UUID!) {
    deleteGeoFence(id: $id)
  }
`;

export const TOGGLE_GEOFENCE_ACTIVE = gql`
  mutation ToggleGeoFenceActive($id: UUID!) {
    toggleGeoFenceActive(id: $id) {
      id
      name
      isActive
    }
  }
`;
