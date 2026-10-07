# Hong Kong Through Film

A two-route Hong Kong film-location website, published as a static site at `https://delete4ever.github.io/ong_ong/`.

## Local build

Use Node.js 22.13 or later.

```sh
npm ci
npm run build
```

The static output is in `dist/client/ong_ong/`. The site works without a Google key; the scene comparison offers a link to Google Street View instead of an embedded panorama.

## GitHub Pages

The workflow in `.github/workflows/deploy-pages.yml` builds the site on pushes to `main` and publishes `dist/client/ong_ong/`. In the repository's **Settings → Pages**, set **Build and deployment → Source** to **GitHub Actions**. The site then appears at `https://delete4ever.github.io/ong_ong/`.

When a Google Maps Embed API key is ready, add it under **Settings → Secrets and variables → Actions** as `GOOGLE_MAPS_EMBED_API_KEY`, then rerun the Pages workflow. Restrict the key in Google Cloud to the Maps Embed API and this Pages origin. The embedded iframe URL exposes the key in the browser, so API and website restrictions are required even though the key is absent from Git.

## Image rights

Film stills and other third-party images are credited in the site's data and interface. Their underlying rights remain with their respective owners; this repository does not license those images for reuse.
