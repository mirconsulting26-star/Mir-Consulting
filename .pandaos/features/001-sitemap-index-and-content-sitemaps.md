# F-001: Sitemap index and content sitemaps

## Status

Local implementation complete; deployed-response verification is pending deployment.

## Objective

Provide a Google-compatible sitemap index at `/sitemap.xml` that points to
separate sitemap files grouped by URL/content type, with an XML stylesheet so
people viewing the XML in a browser see a readable table like the supplied
example. Keep the Render Static Site deployment, canonical custom domain,
robots directive, and dynamic CMS content relationships intact.

## Existing integration points

- `frontend/public/sitemap.xml` is copied into CRA's production output.
- Render publishes `frontend/build` and has a catch-all SPA rewrite; existing
  static files are served at the root before the SPA fallback.
- `frontend/public/robots.txt` already declares the canonical sitemap URL.
- `frontend/src/App.js` defines public route patterns.
- `frontend/src/lib/content.js` supplies service and industry detail slugs.
- `backend/routes/public.py` exposes published blog, case-study, and video
  lists, plus team profiles. The frontend build receives the backend origin in
  `REACT_APP_BACKEND_URL`.
- There is no existing sitemap generator or backend sitemap endpoint.

## Proposed structure

- `/sitemap.xml`: sitemap index, with links to the page sitemap and each
  non-empty public-content sitemap.
- `/sitemap-pages.xml`: fixed public routes and service/industry detail routes.
- `/sitemap-posts.xml`, `/sitemap-case-studies.xml`,
  `/sitemap-videos.xml`, `/sitemap-team.xml`: generated URL sets populated from
  the public backend endpoints during the frontend build when that collection
  has public URLs. Empty collections are omitted from the index.
- `/sitemap.xsl`: optional browser presentation stylesheet for the index and
  child files. Google consumes the XML; the stylesheet only improves browser
  readability.
- `robots.txt` continues to point to `/sitemap.xml`.

Each child sitemap groups many page URLs. A separate sitemap XML file per
individual webpage is not necessary and would create needless files.

## Slices

```text
Slice 1: Sitemap index, page group, and browser presentation — independent
Slice 2: Build-time CMS sitemap generation — depends on Slice 1
Slice 3: End-to-end static output and deployed-response verification — depends on Slices 1 and 2
```

### Slice 1: Index, static pages, and presentation

**Acceptance criterion:** The sitemap index parses as a sitemap index and
references existing child XML files; the page child parses as a URL set and
contains only registered public routes on the canonical hostname.

- [x] Replace the single URL set in `frontend/public/sitemap.xml` with an index.
- [x] Add `frontend/public/sitemap-pages.xml` for fixed routes and
  service/industry slugs.
- [x] Add `frontend/public/sitemap.xsl` and link it from the index and URL sets
  so browsers display a table without altering the underlying XML protocol.
- [x] Keep the sitemap directive in `frontend/public/robots.txt` unchanged.

### Slice 2: Dynamic content maps

**Acceptance criterion:** A successful production build emits non-empty XML
child sitemaps containing the current public content slugs from the configured
API, omits empty collections, and fails clearly rather than publishing an
incomplete index if a required content request fails.

- Add a Node generator under `frontend/scripts/` to request the existing public
  API lists using `REACT_APP_BACKEND_URL`.
- Generate posts, case-studies, videos, and team URL-set XML into
  `frontend/build` when those collections contain public URLs.
- Generate the index into `frontend/build` after CRA copies public assets.
- Wire the generator into the existing frontend build script without changing
  the Render publish directory or SPA rewrite.
- Escape XML text and validate item shape before writing URLs.

### Slice 3: Build and output verification

**Acceptance criterion:** The production build directory contains the index
and each non-empty child sitemap; each parses, uses the correct host, is
index-linked, and the public index/robots URLs match the expected output after
deployment.

- Run the Render-equivalent Yarn production build.
- Verify index references, XML structure, child URLs, XSL asset, and robots
  directive in the build output.
- Confirm generated files are served as static assets rather than `index.html`
  by Render's existing routing behavior.
- Recheck deployed HTTP status, XML content type, and live XML after the user
  deploys; local validation cannot verify a deployment that has not happened.

## Risks

| Risk | Impact | Likelihood | Mitigation |
|---|---|---|---|
| Backend is unavailable during static-site build | Build cannot produce fresh CMS URL maps | Medium | Fail the build with an endpoint-specific message rather than silently ship incomplete sitemaps. |
| Content list endpoints cap responses at 200 items | Sitemap could omit records if a collection grows beyond the endpoint limit | Low | Detect a full 200-item response and surface a build warning; revisit pagination/API only if needed. |
| Render SPA rewrite catches sitemap paths | Google receives app HTML instead of XML | Low | Emit each sitemap into the configured `build` publish directory and test built files and deployed content type. |
| Browser XSL changes visual presentation only | Browser display might differ by browser or crawler | Low | Keep all sitemap data valid without relying on XSL; Google reads the XML independently. |

## Checkpoint gates

- **Gate 0:** Route patterns, content APIs, Render build/publish settings, and
  existing robots behavior are understood.
- **Gate 1:** Sitemap index and static page child validate before adding dynamic
  generation.
- **Gate 2:** Generated CMS child maps validate with live public API data.
- **Gate Final:** Full static build output validates and deployed endpoints are
  rechecked after the user deploys.

## Anti-rationalization check

- Dynamic routes are not omitted just because static XML is easier.
- Sitemap files are grouped by content type, not created one per page.
- Each generated file and index reference is validated as part of the build.
- No backend, database, publishing workflow, or SPA behavior changes are planned.

## Decisions

- Recommended interpretation of the supplied screenshot: sitemap index plus
  grouped child sitemaps, not one XML file per webpage.
- Generated dynamic maps will be build-time assets because the frontend is a
  Render Static Site; no backend runtime endpoint is needed.
- Empty content collections are omitted from the index so crawlers do not
  receive child sitemap files with no URLs.
- Do not add estimated `lastmod`, `changefreq`, or `priority` values.
