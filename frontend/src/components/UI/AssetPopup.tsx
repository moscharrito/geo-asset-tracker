import { useEffect, useRef } from 'react';
import { Asset } from '../../types/Asset';

interface AssetPopupProps {
  asset: Asset;
  position: { x: number; y: number };
  onClose: () => void;
}

const statusLabels: Record<string, { label: string; color: string }> = {
  ACTIVE: { label: 'Active', color: '#22c55e' },
  INACTIVE: { label: 'Inactive', color: '#6b7280' },
  MAINTENANCE: { label: 'Maintenance', color: '#f59e0b' },
  RETIRED: { label: 'Retired', color: '#ef4444' },
};

export function AssetPopup({ asset, position, onClose }: AssetPopupProps) {
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const status = statusLabels[asset.status] || statusLabels.ACTIVE;
  const formattedDate = new Date(asset.updatedAt).toLocaleString();

  return (
    <div
      ref={popupRef}
      className="asset-popup"
      style={{
        position: 'fixed',
        left: Math.min(position.x + 10, window.innerWidth - 320),
        top: Math.min(position.y + 10, window.innerHeight - 280),
        width: '300px',
        backgroundColor: '#1f2937',
        borderRadius: '12px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
        padding: '16px',
        zIndex: 1000,
        color: 'white',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}>{asset.name}</h3>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: '#9ca3af',
            cursor: 'pointer',
            fontSize: '20px',
            padding: '0 4px',
            lineHeight: 1,
          }}
        >
          ×
        </button>
      </div>

      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          marginTop: '8px',
          padding: '4px 10px',
          borderRadius: '9999px',
          backgroundColor: `${status.color}20`,
          color: status.color,
          fontSize: '12px',
          fontWeight: 500,
        }}
      >
        <span
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: status.color,
          }}
        />
        {status.label}
      </div>

      <div style={{ marginTop: '16px', fontSize: '14px' }}>
        <div style={{ marginBottom: '12px' }}>
          <div style={{ color: '#9ca3af', fontSize: '12px', marginBottom: '2px' }}>Type</div>
          <div>{asset.assetType}</div>
        </div>

        <div style={{ marginBottom: '12px' }}>
          <div style={{ color: '#9ca3af', fontSize: '12px', marginBottom: '2px' }}>Description</div>
          <div style={{ color: '#d1d5db' }}>{asset.description}</div>
        </div>

        <div style={{ marginBottom: '12px' }}>
          <div style={{ color: '#9ca3af', fontSize: '12px', marginBottom: '2px' }}>Coordinates</div>
          <div style={{ fontFamily: 'monospace', fontSize: '13px' }}>
            {asset.latitude.toFixed(6)}, {asset.longitude.toFixed(6)}
          </div>
        </div>

        <div>
          <div style={{ color: '#9ca3af', fontSize: '12px', marginBottom: '2px' }}>Last Updated</div>
          <div style={{ color: '#d1d5db' }}>{formattedDate}</div>
        </div>
      </div>
    </div>
  );
}
