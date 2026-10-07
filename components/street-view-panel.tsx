import { ExternalLink, ScanSearch } from 'lucide-react';

export type StreetViewRecord = {
  location_id: string;
  viewpoint: { latitude: number; longitude: number };
  pov: { heading: number; pitch: number; fov: number };
  alignment_basis: string;
  alignment_status: string;
};

export type StreetViewData = {
  project: {
    provider: string;
    record_count: number;
    checked_date: string;
    implementation_note: string;
  };
  records: StreetViewRecord[];
};

function buildMapsUrl(record: StreetViewRecord) {
  const params = new URLSearchParams({
    api: '1',
    map_action: 'pano',
    viewpoint: `${record.viewpoint.latitude},${record.viewpoint.longitude}`,
    heading: String(record.pov.heading),
    pitch: String(record.pov.pitch),
    fov: String(record.pov.fov),
  });
  return `https://www.google.com/maps/@?${params.toString()}`;
}

function buildEmbedUrl(record: StreetViewRecord, apiKey: string) {
  const params = new URLSearchParams({
    key: apiKey,
    location: `${record.viewpoint.latitude},${record.viewpoint.longitude}`,
    heading: String(record.pov.heading),
    pitch: String(record.pov.pitch),
    fov: String(record.pov.fov),
    language: 'en',
    region: 'HK',
  });
  return `https://www.google.com/maps/embed/v1/streetview?${params.toString()}`;
}

export default function StreetViewPanel({
  locationName,
  record,
  apiKey,
  sceneImageUrl,
  sceneAlt,
  sceneCaption,
}: {
  locationName: string;
  record: StreetViewRecord;
  apiKey?: string | null;
  sceneImageUrl?: string | null;
  sceneAlt?: string;
  sceneCaption?: string;
}) {
  const mapsUrl = buildMapsUrl(record);

  return (
    <section className="street-view-panel" aria-labelledby={`street-view-${record.location_id}`}>
      <div className="street-view-heading">
        <ScanSearch aria-hidden="true" />
        <div>
          <h3 id={`street-view-${record.location_id}`}>Scene-to-street comparison</h3>
          <p>{record.alignment_basis}</p>
        </div>
      </div>
      <div className="street-view-comparison">
        <figure className="street-view-reference">
          {sceneImageUrl ? <img src={sceneImageUrl} alt={sceneAlt ?? `Scene reference for ${locationName}`} loading="lazy" decoding="async" referrerPolicy="no-referrer" /> : <div className="street-view-image-missing">Scene reference unavailable</div>}
          <figcaption><strong>Film scene</strong><span>{sceneCaption ?? 'Use the credited scene above as the framing reference.'}</span></figcaption>
        </figure>
        <div className="street-view-live">
          {apiKey ? (
            <iframe
              title={`Aligned Google Street View for ${locationName}`}
              src={buildEmbedUrl(record, apiKey)}
              loading="lazy"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            />
          ) : (
            <div className="street-view-key-fallback">
              <span>360°</span>
              <strong>Street View unavailable here</strong>
              <p>Open the panorama in Google Maps below.</p>
            </div>
          )}
          <a href={mapsUrl} target="_blank" rel="noreferrer">Open in Google Street View <ExternalLink aria-hidden="true" /></a>
        </div>
      </div>
      <p className="street-view-status">Google may show the nearest available panorama rather than the film camera's exact position.</p>
    </section>
  );
}
