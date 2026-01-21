import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polygon, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Asset, GeoFence, MapViewProps } from '../../types/Asset';

const statusColors: Record<string, string> = {
  ACTIVE: '#22c55e',
  INACTIVE: '#6b7280',
  MAINTENANCE: '#f59e0b',
  RETIRED: '#ef4444',
};

const assetTypeIcons: Record<string, string> = {
  Vehicle: '🚗',
  Equipment: '🔧',
  Personnel: '👤',
  default: '📍',
};

// Create custom icon for assets
function createAssetIcon(asset: Asset, isSelected: boolean): L.DivIcon {
  const color = statusColors[asset.status] || statusColors.ACTIVE;
  const icon = assetTypeIcons[asset.assetType] || assetTypeIcons.default;
  const borderColor = isSelected ? '#3b82f6' : 'white';
  const scale = isSelected ? 'scale(1.1)' : 'scale(1)';
  const shadow = isSelected
    ? '0 0 0 3px rgba(59, 130, 246, 0.5), 0 2px 8px rgba(0,0,0,0.3)'
    : '0 2px 8px rgba(0,0,0,0.3)';

  return L.divIcon({
    className: 'custom-asset-marker',
    html: `<div style="
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: ${color};
      border: 3px solid ${borderColor};
      box-shadow: ${shadow};
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      transform: ${scale};
      cursor: pointer;
    ">${icon}</div>`,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  });
}

// Component to fly to selected asset
function FlyToAsset({ asset }: { asset: Asset | null }) {
  const map = useMap();

  useEffect(() => {
    if (asset) {
      map.flyTo([asset.latitude, asset.longitude], 15, { duration: 1 });
    }
  }, [asset, map]);

  return null;
}

export function MapView({
  assets,
  geoFences = [],
  center = [-122.4194, 37.7749], // San Francisco default [lng, lat]
  zoom = 12,
  onAssetClick,
  selectedAssetId,
}: MapViewProps) {
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  // Find selected asset when selectedAssetId changes
  useEffect(() => {
    if (selectedAssetId) {
      const asset = assets.find((a) => a.id === selectedAssetId);
      setSelectedAsset(asset || null);
    } else {
      setSelectedAsset(null);
    }
  }, [selectedAssetId, assets]);

  const handleMarkerClick = (asset: Asset) => {
    onAssetClick?.(asset);
  };

  // Convert center from [lng, lat] to [lat, lng] for Leaflet
  const mapCenter: [number, number] = [center[1], center[0]];

  return (
    <div className="map-container" style={{ position: 'relative', width: '100%', height: '100%' }}>
      <MapContainer
        center={mapCenter}
        zoom={zoom}
        style={{ width: '100%', height: '100%' }}
        zoomControl={true}
      >
        {/* Dark theme tile layer from CartoDB */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {/* Render geofences as polygons */}
        {geoFences.map((geoFence) => {
          if (!geoFence.boundary?.coordinates?.[0]) return null;

          // Convert GeoJSON coordinates [lng, lat] to Leaflet [lat, lng]
          const positions = geoFence.boundary.coordinates[0].map(
            (coord: number[]) => [coord[1], coord[0]] as [number, number]
          );

          const color = geoFence.type === 'INCLUSION' ? '#3b82f6' : '#ef4444';

          return (
            <Polygon
              key={geoFence.id}
              positions={positions}
              pathOptions={{
                color: color,
                fillColor: color,
                fillOpacity: 0.2,
                weight: 2,
                dashArray: '5, 5',
              }}
            />
          );
        })}

        {/* Render asset markers */}
        {assets.map((asset) => (
          <Marker
            key={asset.id}
            position={[asset.latitude, asset.longitude]}
            icon={createAssetIcon(asset, asset.id === selectedAssetId)}
            eventHandlers={{
              click: () => handleMarkerClick(asset),
            }}
          >
            <Popup>
              <div style={{ minWidth: '200px' }}>
                <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>{asset.name}</h3>
                <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#666' }}>
                  <strong>Type:</strong> {asset.assetType}
                </p>
                <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#666' }}>
                  <strong>Status:</strong> {asset.status}
                </p>
                <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#666' }}>
                  <strong>Description:</strong> {asset.description}
                </p>
                <p style={{ margin: '0', fontSize: '11px', color: '#999', fontFamily: 'monospace' }}>
                  {asset.latitude.toFixed(6)}, {asset.longitude.toFixed(6)}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Fly to selected asset */}
        <FlyToAsset asset={selectedAsset} />
      </MapContainer>
    </div>
  );
}
