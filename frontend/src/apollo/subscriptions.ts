import { gql } from '@apollo/client';

export const ASSET_CREATED = gql`
  subscription AssetCreated {
    assetCreated {
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

export const ASSET_UPDATED = gql`
  subscription AssetUpdated {
    assetUpdated {
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

export const ASSET_LOCATION_UPDATED = gql`
  subscription AssetLocationUpdated {
    assetLocationUpdated {
      id
      name
      description
      assetType
      latitude
      longitude
      status
      updatedAt
    }
  }
`;

export const ASSET_LOCATION_UPDATED_BY_ID = gql`
  subscription AssetLocationUpdatedById($assetId: UUID!) {
    assetLocationUpdatedById(assetId: $assetId) {
      id
      name
      latitude
      longitude
      updatedAt
    }
  }
`;

export const ASSET_DELETED = gql`
  subscription AssetDeleted {
    assetDeleted
  }
`;
