import { useRef, useEffect, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Asset, GeoFence, MapViewProps } from '../../types/Asset';
import { AssetPopup } from '../UI/AssetPopup';

// Set Mapbox access token from environment variable
mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || '';

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

export function MapView({
  assets,
  geoFences = [],
  center = [-122.4194, 37.7749], // San Francisco default
  zoom = 12,
  onAssetClick,
  selectedAssetId,
}: MapViewProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const [popupAsset, setPopupAsset] = useState<Asset | null>(null);
  const [popupPosition, setPopupPosition] = useState<{ x: number; y: number } | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: center,
      zoom: zoom,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
    map.current.addControl(new mapboxgl.ScaleControl(), 'bottom-left');

    // Add geofences when map loads
    map.current.on('load', () => {
      addGeoFencesToMap();
    });

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Add geofences to map
  const addGeoFencesToMap = useCallback(() => {
    if (!map.current || !map.current.isStyleLoaded()) return;

    geoFences.forEach((geoFence, index) => {
      const sourceId = `geofence-${geoFence.id}`;
      const layerId = `geofence-layer-${geoFence.id}`;
      const outlineId = `geofence-outline-${geoFence.id}`;

      // Remove existing layers if any
      if (map.current?.getLayer(layerId)) {
        map.current.removeLayer(layerId);
      }
      if (map.current?.getLayer(outlineId)) {
        map.current.removeLayer(outlineId);
      }
      if (map.current?.getSource(sourceId)) {
        map.current.removeSource(sourceId);
      }

      // Add source
      map.current?.addSource(sourceId, {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {
            name: geoFence.name,
            type: geoFence.type,
          },
          geometry: geoFence.boundary,
        },
      });

      // Add fill layer
      const fillColor = geoFence.type === 'INCLUSION' ? '#3b82f6' : '#ef4444';
      map.current?.addLayer({
        id: layerId,
        type: 'fill',
        source: sourceId,
        paint: {
          'fill-color': fillColor,
          'fill-opacity': 0.2,
        },
      });

      // Add outline layer
      map.current?.addLayer({
        id: outlineId,
        type: 'line',
        source: sourceId,
        paint: {
          'line-color': fillColor,
          'line-width': 2,
          'line-dasharray': [2, 2],
        },
      });
    });
  }, [geoFences]);

  // Update geofences when they change
  useEffect(() => {
    if (map.current?.isStyleLoaded()) {
      addGeoFencesToMap();
    }
  }, [geoFences, addGeoFencesToMap]);

  // Update markers when assets change
  useEffect(() => {
    if (!map.current) return;

    const currentAssetIds = new Set(assets.map((a) => a.id));

    // Remove markers for assets that no longer exist
    markersRef.current.forEach((marker, id) => {
      if (!currentAssetIds.has(id)) {
        marker.remove();
        markersRef.current.delete(id);
      }
    });

    // Add or update markers
    assets.forEach((asset) => {
      const existingMarker = markersRef.current.get(asset.id);

      if (existingMarker) {
        // Update existing marker position
        existingMarker.setLngLat([asset.longitude, asset.latitude]);
      } else {
        // Create new marker
        const el = createMarkerElement(asset);
        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([asset.longitude, asset.latitude])
          .addTo(map.current!);

        // Add click handler
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          handleAssetClick(asset, e);
        });

        markersRef.current.set(asset.id, marker);
      }

      // Update marker selection state
      const marker = markersRef.current.get(asset.id);
      if (marker) {
        const el = marker.getElement();
        el.classList.toggle('selected', asset.id === selectedAssetId);
      }
    });
  }, [assets, selectedAssetId]);

  const createMarkerElement = (asset: Asset): HTMLDivElement => {
    const el = document.createElement('div');
    el.className = 'asset-marker';
    el.style.cssText = `
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: ${statusColors[asset.status] || statusColors.ACTIVE};
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      transition: transform 0.2s, box-shadow 0.2s;
    `;
    el.innerHTML = assetTypeIcons[asset.assetType] || assetTypeIcons.default;

    el.addEventListener('mouseenter', () => {
      el.style.transform = 'scale(1.2)';
      el.style.boxShadow = '0 4px 12px rgba(0,0,0,0.4)';
    });

    el.addEventListener('mouseleave', () => {
      el.style.transform = 'scale(1)';
      el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.3)';
    });

    return el;
  };

  const handleAssetClick = (asset: Asset, event: MouseEvent) => {
    setPopupAsset(asset);
    setPopupPosition({ x: event.clientX, y: event.clientY });
    onAssetClick?.(asset);
  };

  const handleClosePopup = () => {
    setPopupAsset(null);
    setPopupPosition(null);
  };

  // Fly to selected asset
  useEffect(() => {
    if (selectedAssetId && map.current) {
      const asset = assets.find((a) => a.id === selectedAssetId);
      if (asset) {
        map.current.flyTo({
          center: [asset.longitude, asset.latitude],
          zoom: 15,
          duration: 1000,
        });
      }
    }
  }, [selectedAssetId, assets]);

  return (
    <div className="map-container" style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
      {popupAsset && popupPosition && (
        <AssetPopup
          asset={popupAsset}
          position={popupPosition}
          onClose={handleClosePopup}
        />
      )}
    </div>
  );
}
