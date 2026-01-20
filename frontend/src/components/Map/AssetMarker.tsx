import { memo } from 'react';
import { Asset, AssetMarkerProps } from '../../types/Asset';

// Define colors for different asset statuses
const statusColors: Record<string, string> = {
  ACTIVE: '#22c55e',
  INACTIVE: '#6b7280',
  MAINTENANCE: '#f59e0b',
  RETIRED: '#ef4444',
};

// Define icons for different asset types
const assetTypeIcons: Record<string, string> = {
  Vehicle: '🚗',
  Equipment: '🔧',
  Personnel: '👤',
  default: '📍',
};

export const AssetMarker = memo(function AssetMarker({
  asset,
  onClick,
  isSelected = false,
}: AssetMarkerProps) {
  const handleClick = () => {
    onClick?.(asset);
  };

  return (
    <div
      className={`asset-marker ${isSelected ? 'selected' : ''}`}
      onClick={handleClick}
      style={{
        width: '36px',
        height: '36px',
        borderRadius: '50%',
        background: statusColors[asset.status] || statusColors.ACTIVE,
        border: isSelected ? '3px solid #3b82f6' : '3px solid white',
        boxShadow: isSelected
          ? '0 0 0 3px rgba(59, 130, 246, 0.5), 0 2px 8px rgba(0,0,0,0.3)'
          : '0 2px 8px rgba(0,0,0,0.3)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '16px',
        transition: 'transform 0.2s, box-shadow 0.2s',
        transform: isSelected ? 'scale(1.1)' : 'scale(1)',
      }}
      title={`${asset.name} (${asset.assetType})`}
    >
      {assetTypeIcons[asset.assetType] || assetTypeIcons.default}
    </div>
  );
});

export function getMarkerColor(asset: Asset): string {
  return statusColors[asset.status] || statusColors.ACTIVE;
}

export function getMarkerIcon(asset: Asset): string {
  return assetTypeIcons[asset.assetType] || assetTypeIcons.default;
}
