import { ArrowLeft, ArrowRight } from 'lucide-react';
import { sitePath } from '@/lib/site-path';

export type SitePage = 'route' | 'map' | 'documents' | 'disclaimer';

const pages: Array<{ id: SitePage; href: string; label: string }> = [
  { id: 'route', href: '/', label: 'Route' },
  { id: 'map', href: '/map', label: 'Map' },
  { id: 'documents', href: '/documents', label: 'Documents' },
  { id: 'disclaimer', href: '/disclaimer', label: 'Disclaimer' },
];

export default function PagePager({ current, narrativeId }: { current: SitePage; narrativeId?: string }) {
  const index = pages.findIndex((page) => page.id === current);
  const previous = pages[(index - 1 + pages.length) % pages.length];
  const next = pages[(index + 1) % pages.length];
  const hrefFor = (page: typeof pages[number]) => {
    const route = sitePath(page.href === '/' ? '/' : `${page.href}/`);
    return narrativeId && (page.id === 'route' || page.id === 'map')
      ? `${route}?narrative=${encodeURIComponent(narrativeId)}`
      : route;
  };

  return (
    <nav className="page-pager" aria-label="Page navigation">
      <a href={hrefFor(previous)} rel="prev">
        <ArrowLeft aria-hidden="true" />
        <span><small>Previous</small><strong>{previous.label}</strong></span>
      </a>
      <a href={hrefFor(next)} rel="next">
        <span><small>Next</small><strong>{next.label}</strong></span>
        <ArrowRight aria-hidden="true" />
      </a>
    </nav>
  );
}
