# F-001: Single-file sitemap

## Status

Local implementation complete; deployed-response verification is pending deployment.

## Objective

Provide one Google-compatible URL set at `/sitemap.xml` containing all public
static and CMS-backed URLs, with an XML stylesheet that renders clickable links
in a readable table. Keep the Render Static Site deployment, canonical custom
domain, robots directive, and dynamic CMS content relationships intact.

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

- `/sitemap.xml`: one URL set with fixed public routes and the current public
  URLs from posts, case studies, videos, and team profiles.
- `/sitemap.xsl`: optional browser presentation stylesheet. Google consumes
  the XML URL set; the stylesheet only improves browser readability.
- `robots.txt` continues to point to `/sitemap.xml`.

No child sitemap XML files are needed; all URL entries appear in the same file.

## Slices

```text
Slice 1: Static routes and browser presentation — independent
Slice 2: Combine build-time CMS URLs into the single URL set — depends on Slice 1
Slice 3: End-to-end static output and deployed-response verification — depends on Slices 1 and 2
```

### Slice 1: Static pages and presentation

**Acceptance criterion:** The sitemap parses as a URL set and contains
registered public routes on the canonical hostname.

- [x] Add fixed routes and service/industry slugs to `frontend/public/sitemap.xml`.
- [x] Add `frontend/public/sitemap.xsl` so browsers display the URLs as a table
  without altering the underlying XML protocol.
- [x] Keep the sitemap directive in `frontend/public/robots.txt` unchanged.

### Slice 2: Dynamic content URLs

**Acceptance criterion:** A successful production build adds all current
public content URLs from the configured API into the single sitemap and fails
clearly rather than publishing an incomplete sitemap if a required request fails.

- Add a Node generator under `frontend/scripts/` to request the existing public
  API lists using `REACT_APP_BACKEND_URL`.
- Append posts, case studies, videos, and team URLs into the one URL set in
  `frontend/build/sitemap.xml` after CRA copies public assets.
- Wire the generator into the existing frontend build script without changing
  the Render publish directory or SPA rewrite.
- Escape XML text and validate item shape before writing URLs.

### Slice 3: Build and output verification

**Acceptance criterion:** The production build directory contains one valid
URL-set sitemap with static and dynamic URLs on the canonical host; the
stylesheet and robots directive are present.

- Run the Render-equivalent Yarn production build.
- Verify sitemap XML, all URL entries, XSL asset, and robots directive in the
  build output.
- Confirm generated files are served as static assets rather than `index.html`
  by Render's existing routing behavior.
- Recheck deployed HTTP status, XML content type, and live XML after the user
  deploys; local validation cannot verify a deployment that has not happened.

## Risks

| Risk | Impact | Likelihood | Mitigation |
|---|---|---|---|
| Backend is unavailable during static-site build | Build cannot produce fresh CMS URL maps | Medium | Fail the build with an endpoint-specific message rather than silently ship incomplete sitemaps. |
| Content list endpoints cap responses at 200 items | Sitemap could omit records if a collection grows beyond the endpoint limit | Low | Detect a full 200-item response and surface a build warning; revisit pagination/API only if needed. |
| Render SPA rewrite catches the sitemap path | Google receives app HTML instead of XML | Low | Emit the sitemap into the configured `build` publish directory and test built files and deployed content type. |
| Browser XSL changes visual presentation only | Browser display might differ by browser or crawler | Low | Keep all sitemap data valid without relying on XSL; Google reads the XML independently. |

## Checkpoint gates

- **Gate 0:** Route patterns, content APIs, Render build/publish settings, and
  existing robots behavior are understood.
- **Gate 1:** Static sitemap URL set validates before adding dynamic URLs.
- **Gate 2:** Combined sitemap validates with live public API data.
- **Gate Final:** Full static build output validates and deployed endpoints are
  rechecked after the user deploys.

## Anti-rationalization check

- Dynamic routes are not omitted just because static XML is easier.
- All public URLs are in one sitemap file; no separate child sitemap files are
  generated.
- The generated sitemap is validated as part of the build.
- No backend, database, publishing workflow, or SPA behavior changes are planned.

## Decisions

- User clarified the preferred format: one XML sitemap containing every URL,
  rather than an index and child sitemap files.
- Generated dynamic maps will be build-time assets because the frontend is a
  Render Static Site; no backend runtime endpoint is needed.
- Do not add estimated `lastmod`, `changefreq`, or `priority` values.
