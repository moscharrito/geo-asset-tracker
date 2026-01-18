import { useState, useMemo } from 'react';
import { MapView } from './components/Map/MapView';
import { useAssets } from './hooks/useAssetSubscription';
import { Asset, AssetStatus } from './types/Asset';
import './styles/map.css';

const assetTypeIcons: Record<string, string> = {
  Vehicle: '🚗',
  Equipment: '🔧',
  Personnel: '👤',
};

const statusColors: Record<string, string> = {
  ACTIVE: '#22c55e',
  INACTIVE: '#6b7280',
  MAINTENANCE: '#f59e0b',
  RETIRED: '#ef4444',
};

function App() {
  const { assets, loading, error } = useAssets();
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      const matchesType = filterType === 'all' || asset.assetType === filterType;
      const matchesStatus = filterStatus === 'all' || asset.status === filterStatus;
      const matchesSearch =
        !searchTerm ||
        asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesType && matchesStatus && matchesSearch;
    });
  }, [assets, filterType, filterStatus, searchTerm]);

  const assetTypes = useMemo(() => {
    const types = new Set(assets.map((a) => a.assetType));
    return Array.from(types);
  }, [assets]);

  const handleAssetClick = (asset: Asset) => {
    setSelectedAssetId(asset.id);
  };

  const selectedAsset = assets.find((a) => a.id === selectedAssetId);

  if (error) {
    return (
      <div className="app-container error">
        <div className="error-message">
          <h2>Connection Error</h2>
          <p>Unable to connect to the GeoTrack API. Please ensure the backend is running.</p>
          <code>{error.message}</code>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="header-left">
          <h1>
            <span className="logo">📍</span>
            GeoTrack
          </h1>
          <span className="subtitle">Asset Location Tracker</span>
        </div>
        <div className="header-right">
          <div className="asset-count">
            <span className="count">{filteredAssets.length}</span>
            <span className="label">Assets</span>
          </div>
          {loading && <div className="loading-indicator">Syncing...</div>}
        </div>
      </header>

      {/* Main Content */}
      <div className="main-content">
        {/* Sidebar */}
        <aside className="sidebar">
          {/* Search */}
          <div className="search-box">
            <input
              type="text"
              placeholder="Search assets..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filters */}
          <div className="filters">
            <div className="filter-group">
              <label>Type</label>
              <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                <option value="all">All Types</option>
                {assetTypes.map((type) => (
                  <option key={type} value={type}>
                    {assetTypeIcons[type] || '📍'} {type}
                  </option>
                ))}
              </select>
            </div>
            <div className="filter-group">
              <label>Status</label>
              <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                <option value="all">All Statuses</option>
                {Object.values(AssetStatus).map((status) => (
                  <option key={status} value={status}>
                    {status.charAt(0) + status.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Asset List */}
          <div className="asset-list">
            <h3>Assets</h3>
            {filteredAssets.length === 0 ? (
              <div className="empty-list">No assets found</div>
            ) : (
              filteredAssets.map((asset) => (
                <div
                  key={asset.id}
                  className={`asset-item ${asset.id === selectedAssetId ? 'selected' : ''}`}
                  onClick={() => handleAssetClick(asset)}
                >
                  <div className="asset-icon">
                    {assetTypeIcons[asset.assetType] || '📍'}
                  </div>
                  <div className="asset-info">
                    <div className="asset-name">{asset.name}</div>
                    <div className="asset-type">{asset.assetType}</div>
                  </div>
                  <div
                    className="asset-status"
                    style={{ backgroundColor: statusColors[asset.status] }}
                    title={asset.status}
                  />
                </div>
              ))
            )}
          </div>

          {/* Selected Asset Details */}
          {selectedAsset && (
            <div className="asset-details">
              <h3>Details</h3>
              <div className="detail-row">
                <span className="detail-label">Name</span>
                <span className="detail-value">{selectedAsset.name}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Type</span>
                <span className="detail-value">{selectedAsset.assetType}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Status</span>
                <span
                  className="detail-value status-badge"
                  style={{ backgroundColor: `${statusColors[selectedAsset.status]}30`, color: statusColors[selectedAsset.status] }}
                >
                  {selectedAsset.status}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Description</span>
                <span className="detail-value">{selectedAsset.description}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Coordinates</span>
                <span className="detail-value coordinates">
                  {selectedAsset.latitude.toFixed(6)}, {selectedAsset.longitude.toFixed(6)}
                </span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Last Updated</span>
                <span className="detail-value">
                  {new Date(selectedAsset.updatedAt).toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </aside>

        {/* Map */}
        <main className="map-wrapper">
          <MapView
            assets={filteredAssets}
            onAssetClick={handleAssetClick}
            selectedAssetId={selectedAssetId || undefined}
          />
        </main>
      </div>
    </div>
  );
}

export default App;
