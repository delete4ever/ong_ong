import type { Metadata } from 'next';
import { ArrowLeft, BookOpen, Database, ExternalLink, FileJson, Route } from 'lucide-react';

import PagePager from '@/components/page-pager';
import SiteHeader from '@/components/site-header';
import { sitePath } from '@/lib/site-path';

export const metadata: Metadata = {
  title: 'Documents',
  description: 'How the film routes, two visual worlds, and shared metadata model were deliberately designed.',
};

const foxPalette = [
  { name: 'Ink blue', hex: '#10283e', role: 'the city at night and the base for readable controls' },
  { name: 'Foxfire pink', hex: '#ef5e86', role: 'the supernatural accent and active route' },
  { name: 'Mist cyan', hex: '#8de5db', role: 'air, water, and a counterpoint to the pink' },
  { name: 'Dossier paper', hex: '#fff7e9', role: 'a quiet surface for film text and evidence' },
  { name: 'Copper', hex: '#b08051', role: 'instrument edges, gears, and fasteners' },
];

const cafePalette = [
  { name: 'Bottle green', hex: '#176146', role: 'window frames, signs, and the restaurant interior' },
  { name: 'Sign red', hex: '#b52f25', role: 'bilingual headings and selected actions' },
  { name: 'Menu cream', hex: '#fff5d7', role: 'receipts, labels, and longer reading' },
  { name: 'Pale wood', hex: '#d9cba8', role: 'unpolished hanging order plaques' },
  { name: 'Warm gold', hex: '#d1a663', role: 'small borders and sign details' },
];

const references = {
  fox: [
    {
      kind: 'Folklore image',
      title: 'Nine-tailed fox from Shan Hai Jing',
      image: '/images/theme/shanhaijing-nine-tailed-fox.svg',
      alt: 'Historic line engraving of a nine-tailed fox.',
      source: 'https://commons.wikimedia.org/wiki/File:%E5%8D%97%E5%B1%B1%E7%B6%93-%E4%B9%9D%E5%B0%BE%E7%8B%90.svg',
      credit: 'Hu Wenhuan edition · Wikimedia Commons · public domain',
      use: 'Its fine engraved line informs the fox motif and gives the folklore strand a visible source.',
    },
    {
      kind: 'Printing detail',
      title: 'Ornamental corner, 1888',
      image: '/images/theme/victorian/watson-corner-1888.svg',
      alt: 'Curled Victorian printing ornament on a transparent background.',
      source: 'https://commons.wikimedia.org/wiki/File:Joseph_Watson_ornamental_corner_19.svg',
      credit: 'Joseph Watson type specimen · Wikimedia Commons · public domain',
      use: 'Its curled line becomes a restrained print edge on chapter slips and page corners.',
    },
  ],
  cafe: [
    {
      kind: 'Cha chaan teng sign · photographed 2008',
      title: 'Tsui Wah Restaurant street sign',
      image: '/images/theme/tsui-wah-sign-reference-2.jpg',
      alt: 'Large green Tsui Wah Restaurant sign with pink-red Chinese lettering and a yellow English name.',
      source: 'https://commons.wikimedia.org/wiki/File:Tsui_Wah_Restaurant_Neon_Signs,_D%27Aguilar_Street.jpg',
      credit: 'Michell Zappa · Wikimedia Commons · CC BY-SA 2.0',
      use: 'The green sign face, warm Chinese lettering, English baseline, and framed shape directly inform this theme’s colour and sign hierarchy.',
    },
    {
      kind: 'Bing sutt sign · photographed 2021',
      title: 'Wong Pei Bing Sutt circular sign',
      image: '/images/theme/wong-pei-sign-reference.jpg',
      alt: 'Hong Kong bing sutt sign with individual Chinese characters in circular badges.',
      source: 'https://commons.wikimedia.org/wiki/File:Hong_Kong_style_design_sign_of_Wong_Pei_Bing_Sutt_at_Tuen_Mun.jpg',
      credit: 'Peachyeung316 · Wikimedia Commons · CC BY-SA 4.0',
      use: 'Its one-character-per-circle arrangement directly informs the green roundels and English ribbon used for section titles.',
    },
  ],
};

const schemaRows = [
  { layer: 'Film', key: 'film_id', contents: 'Title, release year, director, film-history context, source', purpose: 'Introduces the work before asking the visitor to find its location.' },
  { layer: 'Place + scene', key: 'location_id', contents: 'Name, district, address, coordinates, scene summary, shot anchor', purpose: 'Connects a specific frame to a place that can be visited.' },
  { layer: 'Visit evidence', key: 'location_id', contents: 'Current state, access, camera direction, Street View alignment, verification, sources', purpose: 'Keeps a plausible viewpoint separate from a verified exact camera position.' },
  { layer: 'Scene image', key: 'location_id', contents: 'Image URL, caption, alt text, rights credit, source and match grade', purpose: 'Shows a traceable film frame in each chapter.' },
  { layer: 'Narrative', key: 'narrative_id', contents: 'Selected location IDs, route order, chapters, transitions, transport logic', purpose: 'Builds two different visits from one shared location collection.' },
  { layer: 'Narrative text', key: 'narrative_id + location_id', contents: 'Brief and extended scene interpretations for each included place', purpose: 'Reframes the same research for each route.' },
];

function Palette({ colours }: { colours: typeof foxPalette }) {
  return (
    <ul className="documents-palette" aria-label="Theme colour palette">
      {colours.map((colour) => (
        <li key={colour.name}>
          <span className="documents-swatch" style={{ backgroundColor: colour.hex }} aria-hidden="true" />
          <strong>{colour.name}</strong>
          <code>{colour.hex}</code>
          <span>{colour.role}</span>
        </li>
      ))}
    </ul>
  );
}

function ReferenceGallery({ items }: { items: typeof references.fox }) {
  return (
    <div className="publication-grid documents-reference-grid">
      {items.map((item) => (
        <article key={item.title}>
          <a className="publication-cover" href={item.source} target="_blank" rel="noreferrer">
            <img src={sitePath(item.image)} alt={item.alt} loading="lazy" decoding="async" referrerPolicy="no-referrer" />
          </a>
          <div>
            <BookOpen aria-hidden="true" />
            <small>{item.kind}</small>
            <h3>{item.title}</h3>
            <p>{item.use}</p>
            <p className="publication-credit">{item.credit}</p>
            <a href={item.source} target="_blank" rel="noreferrer">View source record <ExternalLink aria-hidden="true" /></a>
          </div>
        </article>
      ))}
    </div>
  );
}

export default function Documents() {
  return (
    <div className="site-shell rationale-shell">
      <SiteHeader current="documents" />
      <main className="rationale-main">
        <section className="rationale-opening documents-opening">
          <div>
            <p className="eyebrow">Behind the route</p>
            <h1>Design<br />Documents</h1>
          </div>
          <div className="rationale-intro">
            <p className="rationale-lead">Start with a film. Find its frame in the city. Then make the journey between frames feel like part of the story.</p>
            <p>Hong Kong Through Film follows those questions through two itineraries. They draw from the same researched places and offer different ways to experience the city. Foxfire &amp; Steel and Cha Chaan Teng give each journey its own visual atmosphere.</p>
          </div>
        </section>

        <section className="rationale-section" aria-labelledby="route-design-heading">
          <div className="rationale-number">01</div>
          <div className="rationale-content">
            <p className="eyebrow">Route design</p>
            <h2 id="route-design-heading">A film selection made walkable</h2>
            <p className="rationale-lead">The film selection begins with scenes whose Hong Kong locations can be researched, recognised, and visited.</p>
            <div className="two-column-copy">
              <div><h3>How a film entered the collection</h3><p>I began with films whose scene locations are described in online sources. From those candidates, I chose recognisable frames with image evidence and places a visitor can approach today. The selection spans different film periods and different cinematic uses of Hong Kong. Each film card identifies the work and its production context, including international productions filmed in the city.</p></div>
              <div><h3>How a place became a stop</h3><p>Each stop has a scene that can be explained, a visible landmark to look for, and useful present-day access guidance. Film chapters introduce the work, show its scene image, and lead into the place to visit. The separate map then helps a visitor move between the scenes.</p></div>
            </div>
            <div className="documents-route-pair">
              <article><span>Path A · 15 stops</span><h3>Cinema Through Time</h3><p>Moves from Prince Edward through Kowloon, across the harbour, and into Central. The chapters group films by changing screen experiences—cafés and street power, pursuit and spectacle, then Central&apos;s performance and absence. Geographic order makes these fifteen scenes a continuous visit.</p></article>
              <article><span>Path B · 10 stops</span><h3>Cinema on the Table</h3><p>Connects food streets, markets, cafés, and nearby film scenes. Some moments take place around food; others lead to the everyday places where visitors can eat along the route. At Mido Café, the filmed exterior and the present-day dining experience meet in one stop.</p></article>
            </div>
            <p className="documents-note">Shared location IDs let each narrative choose its own order and interpretation while retaining the film, scene evidence, coordinates, and access information for every stop.</p>
          </div>
        </section>

        <section className="rationale-section" aria-labelledby="foxfire-heading">
          <div className="rationale-number">02</div>
          <div className="rationale-content">
            <p className="eyebrow">Graphic design · theme one</p>
            <h2 id="foxfire-heading">Foxfire &amp; Steel</h2>
            <p className="rationale-lead">A speculative Hong Kong where fox-spirit folklore meets the hardware of an industrial city.</p>
            <div className="two-column-copy">
              <div><h3>Inspiration</h3><p><a href="https://www.netflix.com/sg/title/80174608" target="_blank" rel="noreferrer"><em>Good Hunting</em></a> is an episode of <em>Love, Death &amp; Robots</em>, adapted from <a href="https://strangehorizons.com/fiction/good-hunting-part-2-of-2/" target="_blank" rel="noreferrer">Ken Liu&apos;s story</a>. Its fox spirit enters an imagined Hong Kong in the first half of the twentieth century: Chinese folklore and steam-driven machinery coexist under British colonial rule. That collision inspired the theme&apos;s foxfire glow and mechanical fittings. The official <a href="https://ak.hypergryph.com/is/gardenofgrotesqueries" target="_blank" rel="noreferrer">Jieyuan visual world</a> inspired its continuous landscape. A nine-tailed-fox engraving and nineteenth-century printing ornaments add a finer graphic texture.</p></div>
              <div><h3>Visual grammar</h3><p>Ink-blue structures hold pink and cyan light. Film chapters behave like talisman slips; route choices and map controls take clipped metal edges, rivets, and gear-number markers. Literary serif typography gives the English film text a printed quality, while short Chinese marks act as decorative seals. Original-colour film stills stay at the centre of each chapter.</p></div>
            </div>
            <Palette colours={foxPalette} />
            <div className="schema-document documents-feature"><Route aria-hidden="true" /><div><h3>The mountain route index</h3><p>Three flowing bands bring the atmosphere of traditional Chinese landscape painting into the route index. Pale mist, teal hills, and deep ink-blue foreground form a continuous mountain range; numbered gear stops sit along its upper ridge. Alternating labels keep the journey compact and easy to scan.</p><figure className="documents-mountain-sample"><svg viewBox="0 0 720 170" preserveAspectRatio="none" role="img" aria-label="Three overlapping mountain curves in mist green, teal and ink blue, matching the route index"><defs><linearGradient id="documents-ridge-far" x1="0" y1="0" x2="1" y2=".2"><stop stopColor="#c4e8dd" /><stop offset=".4" stopColor="#dcebc5" /><stop offset=".75" stopColor="#abd9cf" /><stop offset="1" stopColor="#bde5dc" /></linearGradient><linearGradient id="documents-ridge-mid" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#86bdb8" /><stop offset="1" stopColor="#4a8294" /></linearGradient><linearGradient id="documents-ridge-front" x1="0" y1="0" x2="0" y2="1"><stop stopColor="#436e80" /><stop offset="1" stopColor="#183b55" /></linearGradient></defs><path d="M0 78 C90 76 139 55 222 69 S363 54 451 38 S610 35 720 20 L720 170 L0 170 Z" fill="url(#documents-ridge-far)" /><path d="M0 121 C100 103 170 137 258 110 S376 91 461 80 S616 68 720 79 L720 170 L0 170 Z" fill="url(#documents-ridge-mid)" opacity=".88" /><path d="M0 146 C116 117 219 149 301 130 S444 105 533 115 S650 96 720 104 L720 170 L0 170 Z" fill="url(#documents-ridge-front)" opacity=".94" /><path d="M0 78 C90 76 139 55 222 69 S363 54 451 38 S610 35 720 20" fill="none" stroke="#328a90" strokeWidth="1.5" /></svg></figure></div></div>
            <h3 className="documents-subheading">Visual references</h3>
            <ReferenceGallery items={references.fox} />
          </div>
        </section>

        <section className="rationale-section" aria-labelledby="cafe-heading">
          <div className="rationale-number">03</div>
          <div className="rationale-content">
            <p className="eyebrow">Graphic design · theme two</p>
            <h2 id="cafe-heading">Cha Chaan Teng</h2>
            <p className="rationale-lead">The route becomes a place of service: choose a set, read the order slip, and follow the signs.</p>
            <div className="two-column-copy">
              <div><h3>Inspiration</h3><p>Hong Kong cha chaan teng and bing sutt signs bring bold lettering into everyday street life. The photographed signs below show green grounds, warm red accents, framed lettering, and Chinese characters set in individual circles. Tiled walls, menu paper, and hanging order boards extend that visual language from the street into the restaurant.</p></div>
              <div><h3>Visual grammar</h3><p>Bottle-green window frames and cream reading panels suggest a café interior. Barlow Condensed gives English signs a compact shop-front voice; one Traditional Chinese character per circular badge sits above a ribbon of English. Red draws attention to the main choice and pairs with green across signs and controls.</p></div>
            </div>
            <Palette colours={cafePalette} />
            <div className="documents-route-pair documents-feature-pair">
              <article><span>Films &amp; scenes</span><h3>Receipt chapters</h3><p>The three film chapters read as order slips: compact when closed, then unfolding into film introductions, scene images, and the place associated with each frame. Film titles stay visible while the visitor scans the route.</p></article>
              <article><span>Route map</span><h3>Hanging order plaques</h3><p>The ordered index is split into two rows of pale, matte wooden tags. Each tall tag carries a vertical Traditional Chinese place name, a route number, and a horizontal English name below. It recalls a restaurant order board while keeping every stop selectable.</p></article>
            </div>
            <h3 className="documents-subheading">Visual references</h3>
            <ReferenceGallery items={references.cafe} />
          </div>
        </section>

        <section className="rationale-section rationale-final" aria-labelledby="schema-heading">
          <div className="rationale-number">04</div>
          <div className="rationale-content">
            <p className="eyebrow">Content schema</p>
            <h2 id="schema-heading">One record, several ways to read it</h2>
            <p className="rationale-lead">Film, scene, place, image, and route each have a distinct role in the content model.</p>
            <p>The location ID joins a filmed scene with its visitor information. A narrative stores an ordered list of those IDs, plus its own chapters and text. The same café or street can therefore appear in two itineraries, each with its own story and the same research record.</p>
            <div className="documents-data-flow" aria-label="Content relationship: film to scene and place to narrative and interface">
              <span>Film</span><b aria-hidden="true">→</b><span>Scene + place</span><b aria-hidden="true">→</b><span>Narrative order</span><b aria-hidden="true">→</b><span>Film chapter / map</span>
            </div>
            <div className="documents-schema-scroll">
              <table className="documents-schema-table">
                <caption>Metadata layers and what they do on the site</caption>
                <thead><tr><th scope="col">Layer</th><th scope="col">Connecting key</th><th scope="col">Stored information</th><th scope="col">Why it exists</th></tr></thead>
                <tbody>{schemaRows.map((row) => <tr key={row.layer}><th scope="row">{row.layer}</th><td><code>{row.key}</code></td><td>{row.contents}</td><td>{row.purpose}</td></tr>)}</tbody>
              </table>
            </div>
            <div className="schema-document">
              <div className="schema-document-heading"><FileJson aria-hidden="true" /><div><p className="eyebrow">Downloadable data rules</p><h3>The location record</h3></div></div>
              <p>The downloadable JSON Schema describes the information each location record contains: required fields, coordinate ranges, source URLs, and evidence statuses. It uses the <a href="https://json-schema.org/draft/2020-12" target="_blank" rel="noreferrer">2020-12 edition of the JSON Schema standard</a>. Camera orientation carries its own verification status, so a working direction remains clearly labelled.</p>
              <a className="schema-download" href={sitePath('/data/location-metadata.schema.json')} download>Download the location schema <ExternalLink aria-hidden="true" /></a>
            </div>
            <a className="back-link" href={sitePath('/')}><ArrowLeft aria-hidden="true" /> Return to the films</a>
          </div>
        </section>

        <aside className="image-credit documentation-provenance">
          <Database aria-hidden="true" />
          <div><strong>Images and sources</strong><p>Each reference image links to its source record, with creator and licence credited beside it. Film frames on the route also carry captions and source links. Both themes draw from the same scene records.</p></div>
        </aside>
        <PagePager current="documents" />
      </main>
      <footer className="site-footer"><span>Hong Kong Through Film</span><span>Documents · 2026</span></footer>
    </div>
  );
}
