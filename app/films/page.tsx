import type { Metadata } from 'next';
import RouteExperience, { type FilmStillAuditData } from '@/components/route-experience';
import filmStillAuditData from '@/public/data/film-stills.audit-v1.json';
import locationsData from '@/public/data/locations.route-v2.json';
import textMatrixData from '@/public/data/location-texts.route-v3.json';
import narrativeData from '@/public/data/narratives.route-v3.json';
import transitData from '@/public/data/transit.json';
import streetViewData from '@/public/data/street-view.route-v1.json';

export const metadata: Metadata = {
  title: 'Films & scenes',
  description: 'Explore Hong Kong film scenes and the locations behind two self-guided routes.',
};

export default function FilmsPage() {
  const routeV3Data = {
    ...locationsData,
    project: {
      ...locationsData.project,
      narrative: narrativeData.narratives[0].description,
      location_count: narrativeData.project.location_pool_count,
      verification_stage: 'narrative_v3',
      last_verified: narrativeData.project.last_verified,
    },
    locations: [...locationsData.locations, ...narrativeData.location_additions],
  };

  return (
    <RouteExperience
      data={routeV3Data}
      narratives={narrativeData}
      textMatrix={textMatrixData}
      transit={transitData}
      filmStills={filmStillAuditData as FilmStillAuditData}
      streetViews={streetViewData}
      googleMapsEmbedApiKey={process.env.GOOGLE_MAPS_EMBED_API_KEY ?? null}
    />
  );
}
