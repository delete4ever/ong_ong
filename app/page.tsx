import type { Metadata } from 'next';
import { ArrowRight, Film, MapPin } from 'lucide-react';

import CafeSectionSign from '@/components/cafe-section-sign';
import LegacyFilmRedirect from '@/components/legacy-film-redirect';
import SiteHeader from '@/components/site-header';
import { sitePath } from '@/lib/site-path';

export const metadata: Metadata = {
  title: 'Start here',
  description: 'Explore Hong Kong through film scenes, two self-guided routes, and a map of the places behind the camera.',
};

export default function LandingPage() {
  return (
    <div className="site-shell landing-shell">
      <LegacyFilmRedirect />
      <a className="skip-link" href="#main-content">Skip to main content</a>
      <SiteHeader current="landing" />

      <main id="main-content" className="landing-main">
        <section className="landing-hero" aria-labelledby="landing-title">
          <div className="landing-hero-copy">
            <p className="landing-kicker">A film-location guide to Hong Kong</p>
            <h1 id="landing-title">Hong Kong<br />Through Film</h1>
            <p className="landing-lead">Begin with a scene, then find its place in the city. Explore film stills, location stories and two self-guided routes drawn from 19 researched filming places.</p>
            <div className="landing-actions">
              <a className="landing-action-primary" href={sitePath('/films/')}>Explore films &amp; scenes <ArrowRight aria-hidden="true" /></a>
              <a className="landing-action-secondary" href={sitePath('/map/')}>See the route map <MapPin aria-hidden="true" /></a>
            </div>
          </div>
          <div className="landing-hero-art" aria-hidden="true">
            <div className="landing-art-frame">
              <span className="landing-art-overline">HONG KONG · ON SCREEN / ON FOOT</span>
              <span className="landing-art-number">19</span>
              <span className="landing-art-caption">filming places<br />two ways to visit</span>
            </div>
          </div>
        </section>

        <section className="landing-routes" aria-labelledby="landing-routes-title">
          <div className="landing-section-heading">
            <p className="landing-kicker">Choose your way through the city</p>
            <h2 id="landing-routes-title"><span className="theme-copy-print">Two film journeys</span><span className="theme-copy-cafe"><CafeSectionSign chinese="電影路線" english="Two film journeys" /></span></h2>
            <p>Both routes begin with the films and continue to their locations. Choose the story that interests you; you can switch routes later.</p>
          </div>
          <div className="landing-route-grid">
            <a className="landing-route-card" href={sitePath('/films/?narrative=historical-timeline')}>
              <span className="landing-route-index">Path A <span>15 stops</span></span>
              <Film aria-hidden="true" />
              <h3>Cinema Through Time</h3>
              <p>Follow recognisable scenes across film decades, from old cafés and markets to Central and the harbour.</p>
              <span className="landing-card-link">Browse this route <ArrowRight aria-hidden="true" /></span>
            </a>
            <a className="landing-route-card" href={sitePath('/films/?narrative=cinematic-food-trail')}>
              <span className="landing-route-index">Path B <span>10 stops</span></span>
              <span className="landing-food-mark" aria-hidden="true">茶</span>
              <h3>Cinema on the Table</h3>
              <p>Trace food through Hong Kong films, then visit the cafés, streets and markets behind those scenes.</p>
              <span className="landing-card-link">Browse this route <ArrowRight aria-hidden="true" /></span>
            </a>
          </div>
        </section>

        <section className="landing-how" aria-labelledby="landing-how-title">
          <div className="landing-section-heading">
            <p className="landing-kicker">How to use this guide</p>
            <h2 id="landing-how-title"><span className="theme-copy-print">From frame to street</span><span className="theme-copy-cafe"><CafeSectionSign chinese="使用指南" english="From frame to street" /></span></h2>
          </div>
          <ol className="landing-steps">
            <li><span>01</span><div><h3>Pick a route</h3><p>Choose a film journey above, then open its chapters and scenes.</p></div></li>
            <li><span>02</span><div><h3>Meet the location</h3><p>Open a scene for its film context, address and visit notes.</p></div></li>
            <li><span>03</span><div><h3>Plan your visit</h3><p>Use the ordered route and map. Street View shows the place today; the original camera view may have changed.</p></div></li>
          </ol>
        </section>

        <section className="landing-themes" aria-labelledby="landing-themes-title">
          <div className="landing-section-heading">
            <p className="landing-kicker">About the two visual themes</p>
            <h2 id="landing-themes-title"><span className="theme-copy-print">Two looks, the same places</span><span className="theme-copy-cafe"><CafeSectionSign chinese="雙重風格" english="Two looks, the same places" /></span></h2>
            <p>The theme switch in the header changes the look of the site. It does not change the route or its stops.</p>
          </div>
          <div className="landing-theme-grid">
            <article className="landing-theme-card landing-theme-foxfire">
              <span className="landing-theme-tag">01 · Foxfire &amp; Steel</span>
              <h3>Folklore meets machinery</h3>
              <p>Inspired by <em>Good Hunting</em>, an episode of <em>Love, Death &amp; Robots</em>: fox spirits and steam-driven technology inhabit an imagined colonial-era Hong Kong. Ink-like mountain curves, gears and glowing colour shape this visual world.</p>
            </article>
            <article className="landing-theme-card landing-theme-cafe">
              <span className="landing-theme-tag">02 · Cha Chaan Teng</span>
              <h3>Inside a Hong Kong café</h3>
              <p>A cha chaan teng is a Hong Kong-style café serving everyday meals and drinks. Its red-and-green signs, order tickets and hanging menu plaques inspire this theme.</p>
            </article>
          </div>
        </section>

        <div className="landing-finish"><a href={sitePath('/films/')}>Start with the films <ArrowRight aria-hidden="true" /></a></div>
      </main>
      <footer className="site-footer"><span>Hong Kong Through Film</span></footer>
    </div>
  );
}
