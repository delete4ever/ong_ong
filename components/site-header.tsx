import { Clapperboard } from 'lucide-react';
import ThemeSwitcher from '@/components/theme-switcher';
import type { SitePage } from '@/components/page-pager';
import { sitePath } from '@/lib/site-path';

type SiteHeaderProps = {
  current: SitePage;
  narrativeId?: string;
};

export default function SiteHeader({ current, narrativeId }: SiteHeaderProps) {
  const narrativeQuery = narrativeId ? `?narrative=${encodeURIComponent(narrativeId)}` : '';
  return (
    <header className="site-header">
      <a className="wordmark" href={sitePath('/')} aria-label="Hong Kong Through Film home">
        <span className="wordmark-mark" aria-hidden="true"><Clapperboard /></span>
        <span><strong>Hong Kong</strong><small>Through Film</small></span>
      </a>
      <nav className="site-nav" aria-label="Primary navigation">
        <a aria-current={current === 'landing' ? 'page' : undefined} href={sitePath('/')}>Start here</a>
        <a aria-current={current === 'route' ? 'page' : undefined} href={sitePath(`/films/${narrativeQuery}`)}>Films &amp; scenes</a>
        <a aria-current={current === 'map' ? 'page' : undefined} href={sitePath(`/map/${narrativeQuery}`)}>Route map</a>
        <a aria-current={current === 'documents' ? 'page' : undefined} href={sitePath('/documents/')}>Documents</a>
        <a aria-current={current === 'disclaimer' ? 'page' : undefined} href={sitePath('/disclaimer/')}>Disclaimer</a>
      </nav>
      <div className="header-controls"><ThemeSwitcher /></div>
    </header>
  );
}
