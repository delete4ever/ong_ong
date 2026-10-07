'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import type { Map as MapLibreMap, Marker as MapLibreMarker, Popup as MapLibrePopup } from 'maplibre-gl';
import { BusFront, ExternalLink, Footprints, Ship, TrainFront } from 'lucide-react';
import CafeSectionSign from '@/components/cafe-section-sign';

type Location = {
  location_id: string;
  route_order: number;
  location_name: string;
  district: string;
  coordinates: { latitude: number; longitude: number; status: string };
  film: { title: string; release_year: number };
};

export type TransitMode = 'mtr' | 'bus' | 'ferry';

export type TransitSegment = {
  id: string;
  mode: string;
  route_ids: string[];
  label: string;
  from: string;
  to: string;
  description: string;
  color: string;
  coordinates: number[][];
  official_url: string;
  narrative_guidance?: Record<string, {
    label?: string;
    from?: string;
    to?: string;
    description: string;
  }>;
};

export type TransitData = {
  status: string;
  last_checked: string;
  notice: string;
  segments: TransitSegment[];
};

const allLayers = [
  { id: 'film', label: 'Film route', icon: Footprints },
  { id: 'mtr', label: 'MTR', icon: TrainFront },
  { id: 'bus', label: 'Bus', icon: BusFront },
  { id: 'ferry', label: 'Ferry', icon: Ship },
] as const;

const modeIcon = {
  mtr: TrainFront,
  bus: BusFront,
  ferry: Ship,
};

const transitSigns: Record<TransitMode, { chinese: string; english: string }> = {
  ferry: { chinese: '輪渡', english: 'Ferry' },
  bus: { chinese: '九巴', english: 'Bus' },
  mtr: { chinese: '地鐵', english: 'MTR' },
};

type ProjectedSegment = {
  id: string;
  mode: string;
  points: string;
  color: string;
};

type ProjectedRoutes = {
  film: string;
  transit: ProjectedSegment[];
};

export default function InteractiveRouteMap({
  locations,
  transit,
  activeNarrativeId,
  onSelect,
  layoutKey,
  focusLocationId,
}: {
  locations: Location[];
  transit: TransitData;
  activeNarrativeId: string;
  onSelect: (locationId: string) => void;
  layoutKey?: number;
  focusLocationId?: string | null;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const markersRef = useRef<MapLibreMarker[]>([]);
  const popupsRef = useRef<MapLibrePopup[]>([]);
  const [ready, setReady] = useState(false);
  const [mapError, setMapError] = useState(false);
  const [projectedRoutes, setProjectedRoutes] = useState<ProjectedRoutes>({ film: '', transit: [] });
  const availableLayers = allLayers.filter(
    (layer) => layer.id === 'film' || transit.segments.some((segment) => segment.mode === layer.id),
  );
  const [visibleLayers, setVisibleLayers] = useState<string[]>(
    availableLayers.filter((layer) => layer.id === 'film' || layer.id === 'ferry').map((layer) => layer.id),
  );
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;
    let disposed = false;
    setReady(false);
    setMapError(false);
    setProjectedRoutes({ film: '', transit: [] });

    import('maplibre-gl')
      .then((maplibregl) => {
        if (disposed || !containerRef.current) return;

        const map = new maplibregl.Map({
          container: containerRef.current,
          center: [114.166, 22.302],
          zoom: 12.4,
          minZoom: 10.5,
          maxZoom: 18,
          attributionControl: false,
          style: {
            version: 8,
            sources: {
              osm: {
                type: 'raster',
                tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
                tileSize: 256,
                attribution: '© OpenStreetMap contributors',
              },
            },
            layers: [{ id: 'osm-basemap', type: 'raster', source: 'osm' }],
          },
        });

        mapRef.current = map;
        map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
        map.addControl(
          new maplibregl.AttributionControl({
            compact: true,
            customAttribution: 'Transit lines are schematic',
          }),
          'bottom-right',
        );

        map.on('load', () => {
          if (disposed) return;

          const projectCoordinates = (coordinates: number[][]) => coordinates.map(([longitude, latitude]) => {
            const point = map.project([longitude, latitude]);
            return `${point.x.toFixed(1)},${point.y.toFixed(1)}`;
          }).join(' ');

          const updateProjectedRoutes = () => {
            if (disposed) return;
            setProjectedRoutes({
              film: projectCoordinates(locations.map((location) => [location.coordinates.longitude, location.coordinates.latitude])),
              transit: transit.segments.map((segment) => ({
                id: segment.id,
                mode: segment.mode,
                points: projectCoordinates(segment.coordinates),
                color: segment.color,
              })),
            });
          };

          const bounds = new maplibregl.LngLatBounds();
          const routePosition = new Map(locations.map((location, index) => [location.location_id, index + 1]));
          locations.forEach((location) => {
            const lngLat: [number, number] = [location.coordinates.longitude, location.coordinates.latitude];
            bounds.extend(lngLat);
            const stopNumber = routePosition.get(location.location_id);

            const markerButton = document.createElement('button');
            markerButton.type = 'button';
            markerButton.className = 'map-stop-marker';
            const markerPlate = document.createElement('span');
            markerPlate.className = 'map-stop-plate';
            const markerNumber = document.createElement('span');
            markerNumber.className = 'map-stop-number';
            markerNumber.textContent = String(stopNumber).padStart(2, '0');
            markerPlate.appendChild(markerNumber);
            markerButton.appendChild(markerPlate);
            markerButton.setAttribute('aria-label', `Open route stop ${stopNumber}: ${location.location_name}`);
            markerButton.title = `Stop ${stopNumber}: ${location.location_name}`;

            const popupContent = document.createElement('div');
            popupContent.className = 'map-stop-popup';
            const popupIndex = document.createElement('small');
            popupIndex.textContent = `Stop ${String(stopNumber).padStart(2, '0')} · ${location.district}`;
            const popupTitle = document.createElement('strong');
            popupTitle.textContent = location.location_name;
            const popupFilm = document.createElement('span');
            popupFilm.textContent = `${location.film.title} · ${location.film.release_year}`;
            const popupAction = document.createElement('em');
            popupAction.textContent = 'Select for location details';
            popupContent.appendChild(popupIndex);
            popupContent.appendChild(popupTitle);
            popupContent.appendChild(popupFilm);
            popupContent.appendChild(popupAction);

            const popup = new maplibregl.Popup({ offset: 22, closeButton: false, closeOnClick: false }).setDOMContent(popupContent);
            const marker = new maplibregl.Marker({ element: markerButton, anchor: 'center' }).setLngLat(lngLat).addTo(map);

            markerButton.addEventListener('mouseenter', () => popup.setLngLat(lngLat).addTo(map));
            markerButton.addEventListener('mouseleave', () => popup.remove());
            markerButton.addEventListener('focus', () => popup.setLngLat(lngLat).addTo(map));
            markerButton.addEventListener('blur', () => popup.remove());
            markerButton.addEventListener('click', () => onSelect(location.location_id));

            markersRef.current.push(marker);
            popupsRef.current.push(popup);
          });

          map.fitBounds(bounds, { padding: { top: 58, right: 58, bottom: 58, left: 58 }, maxZoom: 13.35, duration: 0 });
          map.on('move', updateProjectedRoutes);
          map.on('resize', updateProjectedRoutes);
          map.once('idle', updateProjectedRoutes);
          updateProjectedRoutes();
          setReady(true);
        });
      })
      .catch(() => setMapError(true));

    return () => {
      disposed = true;
      popupsRef.current.forEach((popup) => popup.remove());
      markersRef.current.forEach((marker) => marker.remove());
      popupsRef.current = [];
      markersRef.current = [];
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, [locations, onSelect, transit.segments]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => mapRef.current?.resize());
    return () => cancelAnimationFrame(frame);
  }, [layoutKey]);

  useEffect(() => {
    if (!ready || !focusLocationId) return;
    const location = locations.find((item) => item.location_id === focusLocationId);
    if (location) mapRef.current?.easeTo({ center: [location.coordinates.longitude, location.coordinates.latitude], zoom: 15.1, duration: 0 });
  }, [focusLocationId, locations, ready]);

  const toggleLayer = (id: string) => {
    setVisibleLayers((current) => {
      return current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
    });
  };

  return (
    <div className="map-experience">
      <div className="map-toolbar" aria-label="Map layers">
        <div>
          <small>Spatial planner</small>
          <strong>Map &amp; transport layers</strong>
        </div>
        <div className="map-layer-controls">
          {availableLayers.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              aria-pressed={visibleLayers.includes(id)}
              aria-label={`${visibleLayers.includes(id) ? 'Hide' : 'Show'} ${label} on the map`}
              onClick={() => toggleLayer(id)}
            >
              <span className={`map-layer-swatch map-layer-swatch-${id}`} aria-hidden="true" />
              <Icon aria-hidden="true" /> {label}
            </button>
          ))}
        </div>
      </div>
      <p className="map-layer-status" aria-live="polite">
        Visible: {availableLayers.filter(({ id }) => visibleLayers.includes(id)).map(({ label }) => label).join(', ') || 'basemap only'}
      </p>

      <div className="map-frame">
        <div ref={containerRef} className="interactive-map" aria-label={`Interactive map of ${locations.length} numbered route stops and optional public-transport layers`} />
        {ready ? (
          <svg className="map-route-overlay" aria-hidden="true">
            {visibleLayers.includes('film') && projectedRoutes.film ? (
              <polyline className="map-route-line map-route-line-film" points={projectedRoutes.film} />
            ) : null}
            {projectedRoutes.transit.map((segment) => visibleLayers.includes(segment.mode) ? (
              <g key={segment.id} className={`map-route-group map-route-group-${segment.mode}`} style={{ '--route-color': segment.color } as CSSProperties}>
                <polyline className="map-route-line map-route-line-casing" points={segment.points} />
                <polyline className={`map-route-line map-route-line-transit map-route-line-${segment.mode}`} points={segment.points} />
              </g>
            ) : null)}
          </svg>
        ) : null}
        {!ready && !mapError ? <p className="map-status">Loading map…</p> : null}
        {mapError ? (
          <div className="map-fallback">
            <strong>The basemap could not load.</strong>
            <span>The numbered route below still contains every location and remains fully usable.</span>
          </div>
        ) : null}
      </div>

      <div className="transit-cards">
        {transit.segments.map((segment) => {
          const Icon = modeIcon[segment.mode as TransitMode] ?? BusFront;
          const guidance = segment.narrative_guidance?.[activeNarrativeId];
          const sign = transitSigns[segment.mode as TransitMode];
          return (
            <article key={segment.id} style={{ '--transit-color': segment.color } as CSSProperties}>
              <Icon aria-hidden="true" />
              <div>
                {sign ? <CafeSectionSign chinese={sign.chinese} english={sign.english} className="transit-card-sign" /> : null}
                <small>{guidance?.from ?? segment.from} → {guidance?.to ?? segment.to}</small>
                <h3>{guidance?.label ?? segment.label}</h3>
                <p>{guidance?.description ?? segment.description}</p>
                <a href={segment.official_url} target="_blank" rel="noreferrer">
                  Operator information <ExternalLink aria-hidden="true" />
                </a>
              </div>
            </article>
          );
        })}
      </div>
      <p className="map-notice">{transit.notice} Last checked {transit.last_checked}.</p>
    </div>
  );
}
