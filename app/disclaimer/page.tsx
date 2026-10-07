import type { Metadata } from 'next';
import { ArrowUpRight, Copyright, FileText, GraduationCap, Map as MapIcon } from 'lucide-react';

import PagePager from '@/components/page-pager';
import SiteHeader from '@/components/site-header';
import filmStillAuditData from '@/public/data/film-stills.audit-v1.json';

export const metadata: Metadata = {
  title: 'Disclaimer',
  description: 'Academic purpose, source register, image rights, and attribution for Hong Kong Through Film.',
};

export default function DisclaimerPage() {
  return (
    <div className="site-shell info-shell">
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <SiteHeader current="disclaimer" />
      <main id="main-content" className="info-main">
        <section className="info-opening disclaimer-opening">
          <div>
            <p className="eyebrow">Scope, purpose, and rights</p>
            <h1>Academic<br />Disclaimer</h1>
          </div>
          <div className="info-lead">
            <p>The purpose of this website is to explore typographic and layout systems for specialised tourist visits. It was created as an end-of-course project for <strong>Information Modeling and Web Technologies</strong> in the Master&apos;s Degree in Digital Humanities and Digital Knowledge at the University of Bologna, under the supervision of Prof. Fabio Vitali.</p>
            <p>The documents and images are presented for research, criticism, teaching, and location identification. Their publication here is not intended as an alternative to, or replacement for, their original locations.</p>
          </div>
        </section>

        <section className="info-section" aria-labelledby="rights-heading">
          <div className="info-section-label"><Copyright aria-hidden="true" /><span>Rights</span></div>
          <div>
            <h2 id="rights-heading">Rights remain with their owners</h2>
            <div className="two-column-copy">
              <div><h3>Film and documentary material</h3><p>Copyright and related rights in films, scene images, articles, maps, and third-party documents remain with their original owners. Attribution identifies provenance; it does not claim permission or transfer ownership.</p></div>
              <div><h3>Original project work</h3><p>Original research organisation, narrative writing, metadata structure, typographic themes, and layout choices are © 2026 Lulu Yang. Open-source fonts and software remain under their respective licences.</p></div>
            </div>
          </div>
        </section>

        <section className="info-section" aria-labelledby="map-heading">
          <div className="info-section-label"><MapIcon aria-hidden="true" /><span>Visitor use</span></div>
          <div>
            <h2 id="map-heading">A planning companion, not live directions</h2>
            <p className="info-section-lead">Coordinates, camera orientations, walking links, public-transport lines, opening status, and access notes are research-scale guidance. Visitors must check current conditions, operator information, permissions, safety, and accessibility before travelling.</p>
            <p>The basemap is supplied by OpenStreetMap contributors. Transit overlays are schematic and do not replace official journey planners. Google Street View links and conditional embeds are supplied by Google Maps under its own terms. The saved viewpoint and camera angle are working comparisons; Google may update imagery or snap to a different nearby panorama.</p>
          </div>
        </section>

        <section className="info-section source-register" aria-labelledby="sources-heading">
          <div className="info-section-label"><FileText aria-hidden="true" /><span>Source register</span></div>
          <div>
            <h2 id="sources-heading">Scene-image sources</h2>
            <p className="info-section-lead">Each entry records the film, target location, visible credit, and original source page used for location research.</p>
            <div className="source-register-list">
              {filmStillAuditData.records.map((record, index) => (
                <details key={record.location_id}>
                  <summary><span>{String(index + 1).padStart(2, '0')}</span><strong>{record.location_name}</strong><small>{record.film.title} · {record.film.year}</small></summary>
                  <div>
                    <p>{record.copyright_credit}</p>
                    <p><strong>Reuse status:</strong> {record.reuse_status.replaceAll('_', ' ')}</p>
                    <a href={record.candidate_image.source_page_url} target="_blank" rel="noreferrer">Original source page <ArrowUpRight aria-hidden="true" /></a>
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        <aside className="course-credit"><GraduationCap aria-hidden="true" /><p><strong>Coursework statement</strong><br />Information Modeling and Web Technologies · University of Bologna · A.Y. 2025–26 · Prof. Fabio Vitali · Solo project by Ludi Yang.</p></aside>
        <PagePager current="disclaimer" />
      </main>
      <footer className="site-footer"><span>Hong Kong Through Film</span><span>Disclaimer · 2026</span></footer>
    </div>
  );
}
