'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUpRight, Camera, History, MapPin, QrCode as QrCodeIcon, Ticket, TrainFront, UtensilsCrossed } from 'lucide-react';
import QRCode from 'qrcode';
import InteractiveRouteMap, { type TransitData } from '@/components/interactive-route-map';
import CafeSectionSign from '@/components/cafe-section-sign';
import PagePager from '@/components/page-pager';
import SiteHeader from '@/components/site-header';
import { useTheme } from '@/components/theme-provider';
import StreetViewPanel, { type StreetViewData } from '@/components/street-view-panel';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import filmContextData from '@/public/data/film-context.route-v1.json';
import { sitePath } from '@/lib/site-path';

type VisualStyle = {
  visual_style_id: string;
  label: string;
  control_label: string;
  period: string;
  design_direction: string;
};

type Location = {
  location_id: string;
  route_order: number;
  location_name: string;
  district: string;
  address: string;
  coordinates: {
    latitude: number;
    longitude: number;
    status: string;
    verification?: { provider: string; match: string; checked_date: string };
  };
  location_type: string[];
  film: { film_id: string; title: string; release_year: number; directors: string[] };
  scene: { summary: string; shot_anchor: string; camera_direction: string | null; camera_direction_status?: string };
  current_state: string;
  access: { level: string; notes: string };
  route_fit: string;
  verification: { evidence_status: string; result: string; risk_or_gap: string; next_action: string };
  sources: { role: string; url: string }[];
};

type SiteData = {
  project: { title: string; narrative: string; location_count: number; coordinate_policy: string };
  visual_styles: VisualStyle[];
  locations: Location[];
};

type NarrativeStep = {
  order: number;
  location_id: string;
  chapter_id: string;
  connection_type: string;
  narrative_hook: string;
};

type NarrativeChapter = {
  chapter_id: string;
  order: number;
  title: string;
  period: string;
  introduction: string;
  transition_out: string;
};

type Narrative = {
  narrative_id: string;
  short_title: string;
  title: string;
  narrative_type: string;
  route_title: string;
  description: string;
  selection_rationale: string;
  start_label: string;
  end_label: string;
  estimated_duration: string;
  estimated_walking: string;
  chapters: NarrativeChapter[];
  route_sequence: NarrativeStep[];
};

export type NarrativeData = {
  project: { default_narrative_id: string; location_pool_count: number };
  narratives: Narrative[];
};

type TextEntry = {
  title: string;
  body: string;
};

type NarrativeTextSet = {
  included_in_route: boolean;
  'visitor-brief': TextEntry;
  'research-extended': TextEntry;
};

type TextMatrixLocation = {
  location_id: string;
  texts: Record<string, NarrativeTextSet>;
};

export type TextMatrixData = {
  project: { text_count: number; editorial_status: string };
  variants: {
    variant_id: string;
    label: string;
    detail_level: string;
    competence: string;
    tone: string;
    target_length: string;
  }[];
  locations: TextMatrixLocation[];
};

type StillGrade = 'A' | 'B' | 'C';

type StillSupport = {
  narrative_id: string;
  section_title: string;
  support_level: string;
  supported_claim: string;
};

type FilmStillRecord = {
  location_id: string;
  grade: StillGrade;
  film: { title: string; year: number };
  location_name: string;
  candidate_image: {
    status: string;
    image_url: string | null;
    local_asset?: {
      url: string;
      mime_type: string;
      bytes: number;
      sha256: string;
      imported_date: string;
    };
    source_page_url: string;
    source_page_title: string;
    image_locator: string;
    location_evidence_url?: string;
    location_evidence_note?: string;
    conflicting_evidence_url?: string;
    conflicting_evidence_note?: string;
  };
  copyright_credit: string;
  reuse_status: string;
  caption_en: string;
  alt_text_en: string;
  supports_research_view: StillSupport[];
  classification_reason: string;
  next_action: string;
};

export type FilmStillAuditData = {
  project: {
    checked_date: string;
    grade_counts: Record<StillGrade, number>;
    default_usage_note: string;
  };
  records: FilmStillRecord[];
};

const publicSiteUrl = 'https://delete4ever.github.io/ong_ong';
const friendlyLabel = (value: string) => value.replaceAll('_', ' ');
const filmContextIndex = new Map(filmContextData.films.map((film) => [film.film_id, film]));

function ChapterFilmScenes({ locations, steps, stillIndex, narrativeId, onSelect }: {
  locations: Location[];
  steps: NarrativeStep[];
  stillIndex: Map<string, FilmStillRecord>;
  narrativeId: string;
  onSelect: (location: Location) => void;
}) {
  const stepIndex = new Map(steps.map((step) => [step.location_id, step]));
  const films = Array.from(locations.reduce((index, location) => {
    const group = index.get(location.film.film_id) ?? [];
    group.push(location);
    index.set(location.film.film_id, group);
    return index;
  }, new Map<string, Location[]>()));

  return <div className="chapter-film-list">
    {films.map(([filmId, scenes]) => <article className="chapter-film" key={filmId}>
      <header className="chapter-film-heading">
        <span className="film-reel-mark" aria-hidden="true">✦</span>
        <div><small>Film · {scenes[0].film.release_year}</small><h4>{scenes[0].film.title}</h4><p>Directed by {scenes[0].film.directors.join(', ')} · {scenes.length} {scenes.length === 1 ? 'scene' : 'scenes'} on this route</p></div>
      </header>
      {filmContextIndex.get(filmId) && <div className="chapter-film-context">
        <p>{filmContextIndex.get(filmId)?.context}</p>
        <a href={filmContextIndex.get(filmId)?.source_url} target="_blank" rel="noreferrer">Film context: {filmContextIndex.get(filmId)?.source_label} <ArrowUpRight aria-hidden="true" /></a>
      </div>}
      <div className="chapter-scene-list">{scenes.map((location) => {
        const still = stillIndex.get(location.location_id);
        const imageUrl = still?.candidate_image.local_asset?.url ?? still?.candidate_image.image_url;
        const step = stepIndex.get(location.location_id);
        return <div className="chapter-scene" key={location.location_id}>
          <figure className={`chapter-scene-image${filmId === 'film-world-suzie-wong-1960' ? ' chapter-scene-image-full-frame' : ''}`}>
            {imageUrl ? <img src={sitePath(imageUrl)} alt={still?.alt_text_en ?? `Scene from ${location.film.title}`} loading="lazy" decoding="async" referrerPolicy="no-referrer" /> : <span>Scene image pending</span>}
            <figcaption>
              {filmId === 'film-world-suzie-wong-1960' && still?.caption_en && <strong className="chapter-scene-frame-cue">{still.caption_en}</strong>}
              {still?.copyright_credit ?? 'Film scene reference'} · <a href={still?.candidate_image.source_page_url ?? location.sources[0]?.url} target="_blank" rel="noreferrer">Image source</a>
            </figcaption>
          </figure>
          <div className="chapter-scene-copy">
            <span className="chapter-scene-number">Scene {String(step?.order ?? location.route_order).padStart(2, '0')}</span>
            <p>{step?.narrative_hook ?? location.scene.summary}</p>
            <div className="chapter-scene-place"><MapPin aria-hidden="true" /><span>Filming location: <strong>{location.location_name}</strong> · {location.district}</span></div>
            <div className="chapter-scene-actions">
              <button type="button" onClick={() => onSelect(location)}>Scene &amp; visit details <ArrowUpRight aria-hidden="true" /></button>
              <a href={sitePath(`/map/?narrative=${encodeURIComponent(narrativeId)}&focus=${encodeURIComponent(location.location_id)}`)}>Find on map <ArrowRight aria-hidden="true" /></a>
            </div>
          </div>
        </div>;
      })}</div>
    </article>)}
  </div>;
}

function StillEvidence({
  record,
  narrativeId,
  showResearchNotes,
}: {
  record: FilmStillRecord;
  narrativeId: string;
  showResearchNotes: boolean;
}) {
  const [imageFailed, setImageFailed] = useState(false);
  const narrativeSupport = record.supports_research_view.find((support) => support.narrative_id === narrativeId);
  const previewImageUrl = record.candidate_image.local_asset?.url ?? record.candidate_image.image_url;
  const showImage = record.grade === 'A' && Boolean(previewImageUrl) && !imageFailed;
  const placeholderTitle = 'Scene image unavailable';

  return (
    <section className={`still-evidence still-evidence-${record.grade.toLowerCase()}`} aria-labelledby="still-evidence-title">
      <div className="still-evidence-header">
        <div>
          <h3 id="still-evidence-title">Scene</h3>
          <p>{record.film.title} · {record.film.year}</p>
        </div>
      </div>

      {showImage ? (
        <figure className="still-figure">
          <img
            src={sitePath(previewImageUrl)}
            alt={record.alt_text_en}
            loading="lazy"
            decoding="async"
            referrerPolicy="no-referrer"
            onError={() => setImageFailed(true)}
          />
          <figcaption>{record.caption_en}</figcaption>
        </figure>
      ) : (
        <div className="still-placeholder">
          <div>
            <strong>{placeholderTitle}</strong>
            <p>Use the scene source below to view the original reference.</p>
          </div>
        </div>
      )}

      <div className={`still-evidence-copy${showResearchNotes ? '' : ' still-evidence-copy-compact'}`}>
        {showResearchNotes && narrativeSupport ? <div className="evidence-support">
          <strong>{narrativeSupport.section_title}</strong>
          <p>{narrativeSupport.supported_claim}</p>
        </div> : null}
        <p className="still-credit">{record.copyright_credit}</p>
      </div>

      <div className="source-links still-source-links">
        <a href={record.candidate_image.source_page_url} target="_blank" rel="noreferrer">
          Scene source <ArrowUpRight aria-hidden="true" />
        </a>
        {showResearchNotes && record.candidate_image.location_evidence_url ? (
          <a href={record.candidate_image.location_evidence_url} target="_blank" rel="noreferrer">
            Location evidence <ArrowUpRight aria-hidden="true" />
          </a>
        ) : null}
        {showResearchNotes && record.candidate_image.conflicting_evidence_url ? (
          <a href={record.candidate_image.conflicting_evidence_url} target="_blank" rel="noreferrer">
            Conflicting evidence <ArrowUpRight aria-hidden="true" />
          </a>
        ) : null}
      </div>

    </section>
  );
}

type RidgePoint = { x: number; y: number };

function ridgeCurve(points: RidgePoint[]) {
  if (points.length < 2) return '';
  const segments = [`M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`];
  for (let index = 0; index < points.length - 1; index += 1) {
    const previous = points[index - 1] ?? points[index];
    const current = points[index];
    const next = points[index + 1];
    const following = points[index + 2] ?? next;
    const controlOne = {
      x: current.x + (next.x - previous.x) / 6,
      y: current.y + (next.y - previous.y) / 6,
    };
    const controlTwo = {
      x: next.x - (following.x - current.x) / 6,
      y: next.y - (following.y - current.y) / 6,
    };
    segments.push(`C ${controlOne.x.toFixed(1)} ${controlOne.y.toFixed(1)}, ${controlTwo.x.toFixed(1)} ${controlTwo.y.toFixed(1)}, ${next.x.toFixed(1)} ${next.y.toFixed(1)}`);
  }
  return segments.join(' ');
}

const ridgeHeights = [205, 219, 169, 133, 96, 151, 184, 176, 222, 157, 129, 102, 146, 209, 177];

const traditionalPlaceNames: Record<string, string> = {
  'v2-01-jackson-road': '昃臣道・紀念碑',
  'v2-02-duddell-street': '都爹利街石階',
  'v2-03-midnight-express': '午夜快車舊址',
  'v2-04-pottinger-street': '砵典乍街石階',
  'v2-05-graham-market': '嘉咸街・結志街',
  'v2-06-escalator': '中環半山扶梯',
  'v2-07-central-pier-7': '中環天星碼頭',
  'v2-08-avenue-of-stars': '星光大道',
  'v2-09-middle-road-ymca': '中間道・青年會',
  'v2-10-chungking-mansions': '重慶大廈',
  'v2-11-canton-road': '廣東道・海港城',
  'v2-12-man-wah-sun-chuen': '文華新邨',
  'v2-13-old-ymt-police': '油麻地舊警署',
  'v2-14-former-carpark-temple-street': '廟街・停車場舊址',
  'v2-15-tin-hau-temple': '天后廟・榕樹頭',
  'v2-16-fruit-market': '油麻地果欄',
  'v2-17-reclamation-soy': '新填地街・豉油街',
  'v2-18-hung-wan-cafe': '鴻運冰廳餅店',
  'v3-19-mido-cafe': '美都餐室',
};

const routeGearOutline = `${Array.from({ length: 12 }, (_, tooth) => {
  const step = (Math.PI * 2) / 12;
  return [
    [0, 24], [.18, 24], [.28, 30], [.72, 30], [.82, 24],
  ].map(([fraction, radius]) => {
    const angle = -Math.PI / 2 + (tooth + fraction) * step;
    return `${(32 + Math.cos(angle) * radius).toFixed(2)} ${(32 + Math.sin(angle) * radius).toFixed(2)}`;
  });
}).flat().map((point, index) => `${index === 0 ? 'M' : 'L'} ${point}`).join(' ')} Z`;

function ridgeArea(points: RidgePoint[], height: number) {
  const path = ridgeCurve(points);
  return `${path} L ${points[points.length - 1].x} ${height} L ${points[0].x} ${height} Z`;
}

function RouteIndex({ locations, startLabel, endLabel, isLandscape, onSelect }: {
  locations: Location[];
  startLabel: string;
  endLabel: string;
  isLandscape: boolean;
  onSelect: (location: Location) => void;
}) {
  const width = 184 + Math.max(0, locations.length - 1) * 134;
  const height = 355;
  const stops = locations.map((_, index) => ({ x: 92 + index * 134, y: (ridgeHeights[index] ?? 190) - 24 }));
  const ridge = [{ x: 0, y: 218 }, ...stops, { x: width, y: 182 }];
  const middle = ridge.map((point, index) => ({ x: point.x, y: Math.min(315, point.y + 73 + Math.sin(index * 1.13) * 18) }));
  const foreground = ridge.map((point, index) => ({ x: point.x, y: Math.min(344, point.y + 145 + Math.cos(index * .94) * 19) }));

  return (
    <div className={`route-board${isLandscape ? ' route-board-landscape' : ' route-board-menu'}`}>
      <div className="route-board-heading">
        <strong className="theme-copy-print">Ordered route index</strong>
        <span className="theme-copy-cafe"><CafeSectionSign chinese="路線圖" english="Ordered route index" /></span>
        <span>{isLandscape ? 'Scroll along the mountain ridge; select a numbered stop for its scene.' : 'Scroll the menu plaques; select a stop for its film scene.'}</span>
      </div>
      <div className="route-terminal">
        {isLandscape ? <span className="route-terminal-seal" lang="zh-Hant" aria-hidden="true">起</span> : <TrainFront aria-hidden="true" />}
        <span>{startLabel}</span>
      </div>
      {isLandscape ? (
        <div className="route-landscape-scroll" role="region" aria-label="Ordered film locations along a scrollable mountain ridge" tabIndex={0}>
          <div className="route-landscape-content" style={{ width, height }}>
            <svg className="route-landscape-svg" viewBox={`0 0 ${width} ${height}`} aria-hidden="true" focusable="false">
              <defs>
                <linearGradient id="route-ridge-far" x1="0" y1="0" x2="1" y2=".2"><stop stopColor="#c4e8dd" /><stop offset=".4" stopColor="#dcebc5" /><stop offset=".75" stopColor="#abd9cf" /><stop offset="1" stopColor="#bde5dc" /></linearGradient>
                <linearGradient id="route-ridge-mid" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#86bdb8" /><stop offset="1" stopColor="#4a8294" /></linearGradient>
                <linearGradient id="route-ridge-front" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#436e80" /><stop offset="1" stopColor="#183b55" /></linearGradient>
              </defs>
              <path d={ridgeArea(ridge, height)} fill="url(#route-ridge-far)" />
              <path d={ridgeArea(middle, height)} fill="url(#route-ridge-mid)" opacity=".88" />
              <path d={ridgeArea(foreground, height)} fill="url(#route-ridge-front)" opacity=".94" />
              <path d={ridgeCurve(ridge)} className="route-landscape-halo" />
              <path d={ridgeCurve(ridge)} className="route-landscape-line" />
            </svg>
            <ol className="route-track-landscape">
              {locations.map((location, index) => (
                <li key={location.location_id} className={index % 2 === 1 && stops[index].y > 145 ? 'label-above' : 'label-below'} style={{ left: stops[index].x - 64, top: stops[index].y - 23 }}>
                  <button type="button" className="route-stop" onClick={() => onSelect(location)} aria-label={`Open stop ${location.route_order}: ${location.location_name}`}>
                    <span className="stop-dot stop-dot-gear" aria-hidden="true">
                      <svg viewBox="0 0 64 64" focusable="false" aria-hidden="true">
                        <path className="gear-teeth" d={routeGearOutline} />
                        <circle className="gear-face" cx="32" cy="32" r="22" />
                        <circle className="gear-inlay" cx="32" cy="32" r="17.5" />
                      </svg>
                      <span className="gear-number">{location.route_order}</span>
                    </span>
                    <span className="route-stop-copy"><strong>{location.location_name}</strong><small>{location.district}</small></span>
                  </button>
                </li>
              ))}
            </ol>
          </div>
        </div>
      ) : (
        <ol className="route-track" tabIndex={0} aria-label="Ordered film stops on hanging menu plaques">
          {locations.map((location) => (
            <li key={location.location_id}>
              <button type="button" className="route-stop" onClick={() => onSelect(location)} aria-label={`Open stop ${location.route_order}: ${location.location_name}`}>
                <span className="stop-dot">{String(location.route_order).padStart(2, '0')}</span>
                <span className="route-stop-chinese" lang="zh-Hant">{traditionalPlaceNames[location.location_id] ?? location.location_name}</span>
                <span className="route-stop-english"><strong>{location.location_name}</strong><small>{location.district}</small></span>
              </button>
            </li>
          ))}
        </ol>
      )}
      <div className="route-terminal route-terminal-end">
        {isLandscape ? <span className="route-terminal-seal" lang="zh-Hant" aria-hidden="true">終</span> : <MapPin aria-hidden="true" />}
        <span>{endLabel}</span>
      </div>
    </div>
  );
}

export default function RouteExperience({
  data,
  narratives,
  textMatrix,
  transit,
  filmStills,
  streetViews,
  googleMapsEmbedApiKey,
  view = 'films',
}: {
  data: SiteData;
  narratives: NarrativeData;
  textMatrix: TextMatrixData;
  transit: TransitData;
  filmStills: FilmStillAuditData;
  streetViews: StreetViewData;
  googleMapsEmbedApiKey?: string | null;
  view?: 'films' | 'map';
}) {
  const { activeTheme } = useTheme();
  const isFoxfireTheme = activeTheme === 'printed_hong_kong_1910_1949';
  const [activeNarrativeId, setActiveNarrativeId] = useState(narratives.project.default_narrative_id);
  const [openChapterId, setOpenChapterId] = useState<string | null>(null);
  const [showExtendedText, setShowExtendedText] = useState(false);
  const [selected, setSelected] = useState<Location | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [mapUnfolded, setMapUnfolded] = useState(false);
  const [lastOpenedStopId, setLastOpenedStopId] = useState<string | null>(null);
  const [focusedLocationId, setFocusedLocationId] = useState<string | null>(null);

  const activeNarrative = useMemo(
    () => narratives.narratives.find((narrative) => narrative.narrative_id === activeNarrativeId) ?? narratives.narratives[0],
    [activeNarrativeId, narratives.narratives],
  );

  const activeLocations = useMemo(() => {
    const locationIndex = new Map(data.locations.map((location) => [location.location_id, location]));
    return activeNarrative.route_sequence.flatMap((step) => {
      const location = locationIndex.get(step.location_id);
      return location ? [{ ...location, route_order: step.order }] : [];
    });
  }, [activeNarrative.route_sequence, data.locations]);

  const lastOpenedStopIndex = activeLocations.findIndex((location) => location.location_id === lastOpenedStopId);
  const ticketCurrentStop = activeLocations[Math.max(lastOpenedStopIndex, 0)];
  const ticketNextStop = activeLocations[lastOpenedStopIndex < 0 ? 1 : lastOpenedStopIndex + 1] ?? null;

  const filmYearRange = useMemo(() => {
    const years = activeLocations.map((location) => location.film.release_year);
    return `${Math.min(...years)}–${Math.max(...years)}`;
  }, [activeLocations]);

  const selectedStep = useMemo(
    () => (selected ? activeNarrative.route_sequence.find((step) => step.location_id === selected.location_id) ?? null : null),
    [activeNarrative.route_sequence, selected],
  );

  const selectedChapter = useMemo(
    () => (selectedStep ? activeNarrative.chapters.find((chapter) => chapter.chapter_id === selectedStep.chapter_id) ?? null : null),
    [activeNarrative.chapters, selectedStep],
  );

  const selectedMatrixRecord = useMemo(
    () => (selected ? textMatrix.locations.find((location) => location.location_id === selected.location_id) ?? null : null),
    [selected, textMatrix.locations],
  );

  const selectedTexts = selectedMatrixRecord?.texts[activeNarrative.narrative_id] ?? null;
  const selectedVisitorText = selectedTexts?.['visitor-brief'] ?? null;
  const selectedExtendedText = selectedTexts?.['research-extended'] ?? null;
  const stillIndex = useMemo(
    () => new Map(filmStills.records.map((record) => [record.location_id, record])),
    [filmStills.records],
  );
  const streetViewIndex = useMemo(
    () => new Map(streetViews.records.map((record) => [record.location_id, record])),
    [streetViews.records],
  );
  const selectedStill = selected ? stillIndex.get(selected.location_id) ?? null : null;
  const selectedStreetView = selected ? streetViewIndex.get(selected.location_id) ?? null : null;

  const selectedRoutePosition = selected ? activeLocations.findIndex((location) => location.location_id === selected.location_id) : -1;
  const selectedNavigationLocations = activeLocations;
  const selectedNavigationPosition = selectedRoutePosition;
  const previousLocation = selectedNavigationPosition > 0 ? selectedNavigationLocations[selectedNavigationPosition - 1] : null;
  const nextLocation = selectedNavigationPosition >= 0 && selectedNavigationPosition < selectedNavigationLocations.length - 1
    ? selectedNavigationLocations[selectedNavigationPosition + 1]
    : null;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedNarrative = params.get('narrative');
    const requestedLocation = params.get('location');
    const requestedFocus = params.get('focus');
    const storedNarrative = window.sessionStorage.getItem('visit-narrative');
    const initialNarrative = narratives.narratives.find((narrative) => narrative.narrative_id === requestedNarrative)
      ?? narratives.narratives.find((narrative) => narrative.narrative_id === storedNarrative)
      ?? narratives.narratives[0];
    setActiveNarrativeId(initialNarrative.narrative_id);
    setOpenChapterId(null);
    if (requestedFocus) setFocusedLocationId(requestedFocus);
    if (requestedLocation && initialNarrative.route_sequence.some((step) => step.location_id === requestedLocation)) {
      const location = data.locations.find((item) => item.location_id === requestedLocation);
      if (location) {
        setSelected(location);
        setLastOpenedStopId(location.location_id);
      }
    }
  }, [data.locations, narratives.narratives]);

  useEffect(() => {
    window.sessionStorage.setItem('visit-narrative', activeNarrativeId);
  }, [activeNarrativeId]);

  useEffect(() => {
    if (!selected) {
      setQrDataUrl(null);
      return;
    }
    const target = `${publicSiteUrl}/films/?narrative=${encodeURIComponent(activeNarrativeId)}&location=${encodeURIComponent(selected.location_id)}`;
    let cancelled = false;
    QRCode.toDataURL(target, { errorCorrectionLevel: 'M', margin: 2, width: 360, color: { dark: '#17130f', light: '#fffaf0' } })
      .then((dataUrl) => { if (!cancelled) setQrDataUrl(dataUrl); })
      .catch(() => { if (!cancelled) setQrDataUrl(null); });
    return () => { cancelled = true; };
  }, [activeNarrativeId, selected]);

  const updateLocationUrl = useCallback((location: Location | null, narrativeId = activeNarrativeId) => {
    const url = new URL(window.location.href);
    url.searchParams.set('narrative', narrativeId);
    url.searchParams.delete('focus');
    if (location) url.searchParams.set('location', location.location_id);
    else url.searchParams.delete('location');
    window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`);
  }, [activeNarrativeId]);

  const openLocation = useCallback((location: Location) => {
    setShowExtendedText(false);
    setSelected(location);
    if (activeLocations.some((stop) => stop.location_id === location.location_id)) setLastOpenedStopId(location.location_id);
    updateLocationUrl(location);
  }, [activeLocations, updateLocationUrl]);

  const handleMapSelect = useCallback(
    (locationId: string) => {
      const location = data.locations.find((item) => item.location_id === locationId);
      if (location) openLocation(location);
    },
    [data.locations, openLocation],
  );

  const selectNarrative = (narrativeId: string) => {
    setActiveNarrativeId(narrativeId);
    setOpenChapterId(null);
    setShowExtendedText(false);
    setSelected(null);
    setLastOpenedStopId(null);
    setFocusedLocationId(null);
    updateLocationUrl(null, narrativeId);
  };

  const closeLocation = () => {
    setSelected(null);
    updateLocationUrl(null);
  };

  return (
    <div className="site-shell">
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <SiteHeader current={view === 'map' ? 'map' : 'route'} narrativeId={activeNarrativeId} />

      <main id="main-content">
        {view === 'films' ? (
        <section className="opening-grid" aria-labelledby="page-title">
          <div className="opening-copy">
            <h1 id="page-title">
              <span className="theme-copy-print">Hong Kong<br />Through Film</span>
              <span className="theme-copy-cafe cafe-title-sign">
                <span lang="zh-Hant">電影茶餐廳</span>
                <small>Film Cha Chaan Teng</small>
              </span>
            </h1>
            <p className="opening-summary" aria-live="polite">{activeNarrative.description}</p>
          </div>

          <div className="clockwork-vision" aria-hidden="true">
            <span className="clockwork-vision-orbit" />
            <span className="clockwork-vision-gears" />
            <span className="clockwork-vision-fox" />
          </div>

          <div className="opening-controls">
            <div className="narrative-picker">
              <span>Choose a visit narrative</span>
              <ToggleGroup
                className="narrative-toggle"
                aria-label="Choose a visit narrative"
                value={[activeNarrativeId]}
                onValueChange={(values) => values[0] && selectNarrative(values[0])}
              >
                {narratives.narratives.map((narrative, index) => {
                  const Icon = narrative.narrative_type === 'historical_timeline' ? History : UtensilsCrossed;
                  return (
                    <ToggleGroupItem
                      key={narrative.narrative_id}
                      value={narrative.narrative_id}
                      aria-label={`Choose ${narrative.title}`}
                    >
                      <Icon aria-hidden="true" />
                      <span className="narrative-control-label">
                        <span className="theme-copy-print">Path</span>
                        <span className="theme-copy-cafe">Set</span>
                        {' '}{String.fromCharCode(65 + index)}
                      </span>
                      <strong>{narrative.short_title}</strong>
                    </ToggleGroupItem>
                  );
                })}
              </ToggleGroup>
            </div>

            <div className="route-summary">
              <a className="route-jump" href="#route-heading">
                Explore films and scenes <ArrowDown aria-hidden="true" />
              </a>

              <dl className="project-stats" aria-label="Selected narrative summary">
                <div><dt>Stops</dt><dd>{activeLocations.length}</dd></div>
                <div><dt>Duration</dt><dd>{activeNarrative.estimated_duration}</dd></div>
                <div><dt>Film years</dt><dd>{filmYearRange}</dd></div>
              </dl>
            </div>
            <aside className="cafe-order-ticket" aria-label="Selected route order ticket">
              <div className="ticket-heading"><span lang="zh-Hant">路線單</span><strong>ROUTE ORDER</strong><small>SET {activeNarrativeId === narratives.narratives[0].narrative_id ? 'A' : 'B'}</small></div>
              <p className="ticket-route-name">{activeNarrative.short_title}</p>
              <div className="ticket-stop"><span>{lastOpenedStopIndex < 0 ? 'START AT' : 'CURRENT STOP'}</span><strong>{String(Math.max(lastOpenedStopIndex, 0) + 1).padStart(2, '0')} · {ticketCurrentStop?.location_name}</strong></div>
              <div className="ticket-stop"><span>UP NEXT</span><strong>{ticketNextStop ? `${String(lastOpenedStopIndex < 0 ? 2 : lastOpenedStopIndex + 2).padStart(2, '0')} · ${ticketNextStop.location_name}` : 'Route complete'}</strong></div>
              <a href="#route-heading">Explore films and scenes <ArrowDown aria-hidden="true" /></a>
            </aside>
          </div>
        </section>
        ) : (
          <section className="map-page-intro" aria-labelledby="page-title">
            <h1 id="page-title"><span className="theme-copy-print">Route map &amp; visit order</span><span className="theme-copy-cafe"><CafeSectionSign chinese="路線圖" english="Route map & visit order" /></span></h1>
            <p>Choose the film journey, then inspect its numbered stops and optional transport layers. Film scenes and chapter stories live on the <a href={sitePath(`/films/?narrative=${encodeURIComponent(activeNarrativeId)}`)}>film route page</a>.</p>
            <div className="narrative-picker">
              <span>Choose a visit narrative</span>
              <ToggleGroup className="narrative-toggle" aria-label="Choose a visit narrative" value={[activeNarrativeId]} onValueChange={(values) => values[0] && selectNarrative(values[0])}>
                {narratives.narratives.map((narrative, index) => {
                  const Icon = narrative.narrative_type === 'historical_timeline' ? History : UtensilsCrossed;
                  return <ToggleGroupItem key={narrative.narrative_id} value={narrative.narrative_id} aria-label={`Choose ${narrative.title}`}><Icon aria-hidden="true" /><span className="narrative-control-label"><span className="theme-copy-print">Path</span><span className="theme-copy-cafe">Set</span> {String.fromCharCode(65 + index)}</span><strong>{narrative.short_title}</strong></ToggleGroupItem>;
                })}
              </ToggleGroup>
            </div>
          </section>
        )}

        <div className="route-content">
        {view === 'films' ? <section className="route-section" aria-labelledby="route-heading">
          <div className="cafe-receipt-masthead" aria-hidden="true">
            <span><b lang="zh-Hant">電影茶餐廳</b><small>FILM ORDER · HONG KONG</small></span>
            <strong>SET {activeNarrativeId === narratives.narratives[0].narrative_id ? 'A' : 'B'}</strong>
          </div>
          <div className="section-heading">
            <h2 id="route-heading"><span className="theme-copy-print">{activeNarrative.route_title}</span><span className="theme-copy-cafe"><CafeSectionSign chinese="電影場景" english={activeNarrative.route_title} /></span></h2>
          </div>
          <div className="chapter-guide" aria-label={`${activeNarrative.short_title} chapter guide`}>
            {activeNarrative.chapters.map((chapter) => {
              const chapterSteps = activeNarrative.route_sequence.filter((step) => step.chapter_id === chapter.chapter_id);
              const chapterLocations = chapterSteps.flatMap((step) => activeLocations.find((location) => location.location_id === step.location_id) ?? []);
              const filmNames = Array.from(new Set(chapterLocations.map((location) => location.film.title)));
              return (
                <details key={chapter.chapter_id} className={`chapter-card chapter-film-led${isFoxfireTheme ? ' chapter-talisman' : ''}`} open={openChapterId === chapter.chapter_id}>
                  <summary onClick={(event) => { event.preventDefault(); setOpenChapterId((current) => current === chapter.chapter_id ? null : chapter.chapter_id); }}>
                    <span className="talisman-seal" lang={isFoxfireTheme ? 'zh-Hant' : undefined} aria-hidden="true">{isFoxfireTheme ? '異' : String(chapter.order).padStart(2, '0')}</span>
                    <span className="talisman-heading">
                      <small className="chapter-number">Chapter {String(chapter.order).padStart(2, '0')} · {filmNames.length} films · {chapterLocations.length} scenes</small>
                      <strong>{chapter.title}</strong>
                      <span className="chapter-period">{filmNames.join(' · ')}</span>
                    </span>
                    <span className="talisman-action" aria-hidden="true">+</span>
                  </summary>
                  <div className="talisman-reading">
                    <p>{chapter.introduction}</p>
                    <ChapterFilmScenes locations={chapterLocations} steps={chapterSteps} stillIndex={stillIndex} narrativeId={activeNarrativeId} onSelect={openLocation} />
                    <div className="chapter-transition"><ArrowRight aria-hidden="true" /><span><strong>Into the next chapter</strong>{chapter.transition_out}</span></div>
                  </div>
                </details>
              );
            })}
          </div>
          <a className="route-to-map" href={sitePath(`/map/?narrative=${encodeURIComponent(activeNarrativeId)}`)}><MapPin aria-hidden="true" /> Plan the {activeLocations.length}-stop visit on the map <ArrowRight aria-hidden="true" /></a>
        </section> : null}
        {view === 'map' ? <div className="route-atlas" data-unfolded={mapUnfolded}>
          <RouteIndex locations={activeLocations} startLabel={activeNarrative.start_label} endLabel={activeNarrative.end_label} isLandscape={isFoxfireTheme} onSelect={openLocation} />
          <div className="clockwork-map-heading">
            <div><h2><span className="theme-copy-print">Route map</span><span className="theme-copy-cafe"><CafeSectionSign chinese="地圖" english="Route map" /></span></h2><p>Follow the numbered itinerary. Open a pin to read its film scene and visitor notes.</p></div>
            <button type="button" aria-expanded={mapUnfolded} onClick={() => setMapUnfolded((current) => !current)}>{mapUnfolded ? 'Reduce map' : 'Expand map'} <ArrowDown aria-hidden="true" /></button>
          </div>
          <InteractiveRouteMap
            locations={activeLocations}
            transit={transit}
            activeNarrativeId={activeNarrative.narrative_id}
            onSelect={handleMapSelect}
            layoutKey={mapUnfolded ? 1 : 0}
            focusLocationId={focusedLocationId}
          />
        </div> : null}

        </div>
        <PagePager current={view === 'map' ? 'map' : 'route'} narrativeId={activeNarrativeId} />
      </main>

      <footer className="site-footer"><span>Hong Kong Through Film</span></footer>

      <Sheet open={Boolean(selected)} onOpenChange={(open) => !open && closeLocation()}>
        <SheetContent className="location-sheet sm:max-w-xl" side="right">
          {selected ? (
            <>
              <SheetHeader className="location-sheet-header">
                <p className="sheet-index">Route stop {String(selectedRoutePosition + 1).padStart(2, '0')} · {activeNarrative.short_title}</p>
                <SheetTitle className="sheet-title">{view === 'films' ? selected.film.title : selected.location_name}</SheetTitle>
                <SheetDescription>{view === 'films' ? `${selected.film.release_year} · ${selected.film.directors.join(', ')} · ${selected.location_name}` : selected.address}</SheetDescription>
              </SheetHeader>
              <div className="sheet-body">
                <nav className="location-sheet-pager" aria-label="Location navigation">
                  <button type="button" onClick={() => previousLocation && openLocation(previousLocation)} disabled={!previousLocation}>
                    <ArrowLeft aria-hidden="true" /> Previous
                  </button>
                  <span>{selectedNavigationPosition + 1} / {selectedNavigationLocations.length}</span>
                  <button type="button" onClick={() => nextLocation && openLocation(nextLocation)} disabled={!nextLocation}>
                    Next <ArrowRight aria-hidden="true" />
                  </button>
                </nav>
                <div className="film-credit">{view === 'films' ? <MapPin aria-hidden="true" /> : <Ticket aria-hidden="true" />}<div><small>{view === 'films' ? 'Filming place to visit' : 'Film'}</small><strong>{view === 'films' ? selected.location_name : selected.film.title}</strong><span>{view === 'films' ? selected.address : `${selected.film.release_year} · ${selected.film.directors.join(', ')}`}</span></div></div>
                <section className="matrix-copy" aria-labelledby="matrix-copy-title">
                  <div className="matrix-copy-header">
                    <div>
                      <h3>Story &amp; scene</h3>
                      <p>{activeNarrative.short_title}</p>
                    </div>
                  </div>
                  {selectedVisitorText ? (
                    <>
                      <h4 id="matrix-copy-title">{selectedVisitorText.title}</h4>
                      <p className="matrix-text">{selectedVisitorText.body}</p>
                    </>
                  ) : (
                    <p className="matrix-text">This narrative text is not available yet.</p>
                  )}
                  {selectedExtendedText ? (
                    <>
                      <button
                        className="reading-depth-button"
                        type="button"
                        aria-expanded={showExtendedText}
                        aria-controls="extended-location-reading"
                        onClick={() => setShowExtendedText((current) => !current)}
                      >
                        {showExtendedText ? 'Tell me less' : 'Tell me more'}
                        <ArrowDown aria-hidden="true" />
                      </button>
                      <div id="extended-location-reading" className="extended-reading" hidden={!showExtendedText}>
                        <h4>{selectedExtendedText.title}</h4>
                        <p className="matrix-text">{selectedExtendedText.body}</p>
                      </div>
                    </>
                  ) : null}
                </section>
                {selectedStill ? (
                  <StillEvidence
                    key={`${selectedStill.location_id}-${selectedStill.candidate_image.local_asset?.url ?? selectedStill.candidate_image.image_url ?? selectedStill.grade}`}
                    record={selectedStill}
                    narrativeId={activeNarrative.narrative_id}
                    showResearchNotes={showExtendedText}
                  />
                ) : null}
                {selectedStreetView ? (
                  <StreetViewPanel
                    locationName={selected.location_name}
                    record={selectedStreetView}
                    apiKey={googleMapsEmbedApiKey}
                    sceneImageUrl={sitePath(selectedStill?.candidate_image.local_asset?.url ?? selectedStill?.candidate_image.image_url)}
                    sceneAlt={selectedStill?.alt_text_en}
                    sceneCaption={selectedStill?.caption_en}
                  />
                ) : null}
                {selectedStep ? (
                  <section className="narrative-hook">
                    <h3>{selectedChapter?.title ?? 'In this narrative'}</h3>
                    <p>{selectedStep.narrative_hook}</p>
                  </section>
                ) : null}
                <section><h3>In the film</h3><p>{selected.scene.summary}</p></section>
                <section><h3>Find the frame</h3><p>{selected.scene.shot_anchor}</p></section>
                <section className="camera-direction">
                  <Camera aria-hidden="true" />
                  <div>
                    <h3>Camera orientation</h3>
                    <p>{selected.scene.camera_direction ?? 'This camera angle has not yet been confirmed on site.'}</p>
                  </div>
                </section>
                <div className="detail-pair">
                  <section><h3>Visiting today</h3><p>{selected.current_state}</p></section>
                  <section><h3>Access</h3><p>{selected.access.notes}</p></section>
                </div>
                <section className="location-qr">
                  <div>
                    <QrCodeIcon aria-hidden="true" />
                    <h3>Open this location on site</h3>
                    <p>Scan to reopen this exact location and narrative on a phone.</p>
                    <a href={`${publicSiteUrl}/films/?narrative=${encodeURIComponent(activeNarrativeId)}&location=${encodeURIComponent(selected.location_id)}`} target="_blank" rel="noreferrer">Open shareable location link <ArrowUpRight aria-hidden="true" /></a>
                  </div>
                  {qrDataUrl ? <img src={qrDataUrl} alt={`QR code linking to ${selected.location_name}`} /> : <span className="qr-loading">Generating QR…</span>}
                </section>
                <div className="source-links">
                  {selected.sources.map((source) => <a key={source.role} href={source.url} target="_blank" rel="noreferrer">{friendlyLabel(source.role)} source <ArrowUpRight aria-hidden="true" /></a>)}
                </div>
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  );
}
