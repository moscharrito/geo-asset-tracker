export interface Asset {
  id: string;
  name: string;
  description: string;
  assetType: string;
  latitude: number;
  longitude: number;
  status: AssetStatus;
  createdAt: string;
  updatedAt: string;
  metadata?: string;
}

export enum AssetStatus {
  Active = 'ACTIVE',
  Inactive = 'INACTIVE',
  Maintenance = 'MAINTENANCE',
  Retired = 'RETIRED'
}

export interface GeoFence {
  id: string;
  name: string;
  description?: string;
  boundary: GeoJsonPolygon;
  type: GeoFenceType;
  isActive: boolean;
  createdAt: string;
}

export enum GeoFenceType {
  Inclusion = 'INCLUSION',
  Exclusion = 'EXCLUSION'
}

export interface GeoJsonPolygon {
  type: 'Polygon';
  coordinates: number[][][];
}

export interface Coordinate {
  latitude: number;
  longitude: number;
}

export interface CreateAssetInput {
  name: string;
  description: string;
  assetType: string;
  latitude: number;
  longitude: number;
  status?: AssetStatus;
  metadata?: string;
}

export interface UpdateAssetInput {
  id: string;
  name?: string;
  description?: string;
  assetType?: string;
  latitude?: number;
  longitude?: number;
  status?: AssetStatus;
  metadata?: string;
}

export interface UpdateAssetLocationInput {
  id: string;
  latitude: number;
  longitude: number;
}

export interface NearbySearchInput {
  latitude: number;
  longitude: number;
  distanceMeters: number;
}

export interface AssetMarkerProps {
  asset: Asset;
  onClick?: (asset: Asset) => void;
  isSelected?: boolean;
}

export interface MapViewProps {
  assets: Asset[];
  geoFences?: GeoFence[];
  center?: [number, number];
  zoom?: number;
  onAssetClick?: (asset: Asset) => void;
  selectedAssetId?: string;
}
