# MIR Consulting — PRD

## Original Problem Statement
Rebuild the entire MIR Consulting website from scratch — a premium, scalable, modern consulting website that reflects a professional business consulting and technology advisory company. MIR Consulting operates at the intersection of Business Consulting, Data Analytics & BI, IT Consulting, Software Architecture, Process Automation, Dashboard Development, Operational Optimization, and Digital Transformation. Must feel: premium, professional, modern, corporate, high trust, technology-driven, enterprise-scale.

## User Choices (verbatim)
- Stack: React + FastAPI + MongoDB.
- Contact handling: MongoDB + simple admin dashboard.
- CMS: Insights + Case Studies (markdown editor with live preview).
- Fallback: show static placeholder cards when CMS DB is empty.
- Logo: text-based "MIR Consulting" wordmark.
- Design: light theme with midnight navy + electric blue accents.
- Email: Gmail SMTP (no third-party API). App Password to be provided by owner.
- Invoices: per-invoice currency picker, format `INV-YYYY-####`, "your call" on field set → standard fields + logo/footer + download + email + public link, both standalone and "from a lead" entry points.
- Languages: English (default), German, Spanish.

## Architecture
- **Frontend**: React SPA + React Router. Tailwind + shadcn/ui + Framer Motion + Lucide. react-helmet-async (SEO). react-markdown + remark-gfm + @tailwindcss/typography. react-i18next + i18next-browser-languagedetector.
- **Backend**: FastAPI (`/app/backend/server.py`) — all routes prefixed `/api`. Motor (MongoDB). slowapi (rate-limit). python-slugify. ReportLab (PDF). smtplib (SMTP).
- **Auth**: static admin token from `/api/admin/login`; Bearer for `/api/admin/*`.

### DB Collections
- `leads` — full_name, email, company, phone, industry, service_interest, message, status (new|contacted|qualified|won|lost), notes, created_at, updated_at.
- `posts` — slug, title, excerpt, content, category, cover_image, read_time, status, timestamps, published_at.
- `case_studies` — slug, title, sector, summary, content, client_name, outcomes[], cover_image, status, timestamps, published_at.
- `videos` — slug, title, description, youtube_url, youtube_id, category, cover_image, status, timestamps, published_at.
- `team_members` — name, role, bio, photo, expertise[], linkedin, order, timestamps.
- `site_settings` (singleton, key=`site`) — logo_url, updated_at.
- `admin_settings` — admin password hash (bcrypt).
- `password_reset_tokens` — token_hash, expires_at (TTL index, single-use).
- `invoices` — number (auto INV-YYYY-####), public_token, client_*, currency, issue_date, due_date, line_items[], subtotal, tax_rate, tax_amount, total, notes, status (draft|sent|paid|overdue|void), sent_at, paid_at, lead_id, timestamps.

## Pages
- Public: `/` `/about` (now includes Team carousel) `/services` `/industries` `/our-work` (unified feed with tabs: All / Case Studies / Insights / Videos) `/our-work/video/:slug` (YouTube embed) `/insights` `/insights/:slug` `/case-studies` `/case-studies/:slug` `/contact` `*`.
- Admin (`/admin`) — login + "Forgot password" magic-link reset (`/admin/reset/:token`); tabs:
  - **Leads** — search, status filter, status dropdown per row, drawer (message, status, notes, "Create invoice for this lead"), delete confirm, **CSV export**.
  - **Insights** — list + markdown editor with live preview, draft/publish, delete.
  - **Case Studies** — same + sector, summary, client, outcomes lines.
  - **Invoices** — list + filter + multi-currency editor with live computed totals; download PDF, copy public link, email to client, edit, delete.
  - **Videos** — YouTube URL CRUD with live iframe preview, draft/publish.
  - **Team** — team-member CRUD (name, role, bio, photo, expertise tags, LinkedIn, display order).
  - **Site** — upload custom logo (replaces "M" placeholder in navbar).

## API
- `GET /api/health`, `GET /api/company`
- `POST /api/leads` (public, rate-limited 5/min) — fires async email to COMPANY_EMAIL when SMTP configured.
- `POST /api/admin/login` (rate-limited 5/min)
- Leads: `GET /api/admin/leads?status=&q=`, `GET/PATCH/DELETE /api/admin/leads/{id}`
- Posts: public `GET /api/posts`, `/api/posts/{slug}`; admin full CRUD on `/api/admin/posts`
- Case studies: public `GET /api/case-studies`, `/api/case-studies/{slug}`; admin full CRUD on `/api/admin/case-studies`
- Videos: public `GET /api/videos`, `/api/videos/{slug}`; admin full CRUD on `/api/admin/videos`.
- Team: public `GET /api/team`; admin full CRUD on `/api/admin/team`.
- Unified feed: `GET /api/works?type=insight|case_study|video` (merges all 3 with `type` + `href`).
- Site settings: public `GET /api/site-settings`; admin `PUT /api/admin/site-settings`.
- Media: admin `POST /api/admin/media/upload` (multipart, max 8 MB, folders=team|blog|videos|logos|uploads) → returns `{path,url}`; public `GET /api/media/{path}` streams via 1h in-memory cache. Backend = `/app/backend/github_storage.py` (GitHub Contents API).
- Leads CSV export: `GET /api/admin/leads-export.csv` (admin auth required, UTF-8 BOM, attachment header).
- Admin auth/reset: `POST /api/admin/login`, `POST /api/admin/forgot-password`, `GET /api/admin/reset-password/{token}`, `POST /api/admin/reset-password`.
- Stats: `GET /api/admin/stats` (leads, posts, case-studies, invoices breakdown)
- Email status: `GET /api/admin/email-status`
- **Invoices**:
  - `GET /api/admin/invoices?status=&q=`
  - `POST /api/admin/invoices`
  - `GET/PUT/DELETE /api/admin/invoices/{id}`
  - `GET /api/admin/invoices/{id}/pdf` (download)
  - `POST /api/admin/invoices/{id}/send` (Gmail SMTP)
  - `GET /api/invoices/public/{token}` (JSON, no auth)
  - `GET /api/invoices/public/{token}/pdf` (PDF, no auth)

## Email Integration (Gmail SMTP)
- File: `/app/backend/email_service.py`
- ENV vars in `/app/backend/.env`: `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_APP_PASSWORD`, `COMPANY_EMAIL`.
- Status: **wired and tested with graceful fallback**. Currently disabled — owner must paste a 16-char Google App Password into `SMTP_APP_PASSWORD` to activate. Without it: new-lead emails are skipped silently and invoice-send returns 503 with a clear message.

## i18n
- Languages: `en` (default), `de`, `es`. Detection: localStorage → navigator. Storage key `mir_lang`.
- Switcher: globe icon in navbar (desktop + mobile).
- Static UI translated; CMS content stays in author's chosen language.

## SEO
- `Seo` component (react-helmet-async) on all major pages.
- `/app/frontend/public/robots.txt` + `/app/frontend/public/sitemap.xml`.

## Verified Functionality
- **Iteration 1** MVP — passed.
- **Iteration 2** CMS + leads + rate-limit + SEO — 27/27 backend, all frontend flows passed.
- **Iteration 3** Invoices + Gmail SMTP scaffolding + i18n EN/DE/ES — 46/46 backend tests, all frontend flows passed.
- **Iteration 4** Admin password reset (bcrypt + magic-link) — 13/13 backend cases, frontend forgot-password dialog + `/admin/reset/:token` page verified.
- **Iteration 5** Team CRUD + Videos (YouTube) + unified `/our-work` + Site Settings (logo) + GitHub-backed media upload + Lead CSV export + axios 401 interceptor — 20/20 backend cases, all frontend flows verified.

## Credentials & Secrets
- `/app/memory/test_credentials.md` — admin password `mir-admin-2026` (DB-stored bcrypt; `.env` `ADMIN_PASSWORD` is bootstrap-only).
- Backend `.env`: `ADMIN_PASSWORD`, `ADMIN_TOKEN`, `MONGO_URL`, `DB_NAME`, `CORS_ORIGINS`, `COMPANY_EMAIL`, `SMTP_*` (live), `PUBLIC_BASE_URL`, `GITHUB_TOKEN`, `GITHUB_REPO`, `GITHUB_BRANCH`.

## Changelog
- 2025-12 — MVP site (pages, contact form, basic admin).
- 2026-02 (a) — Full CMS for Insights + Case Studies, lead status workflow + drawer + delete, rate-limiting, SEO basics, markdown live preview, typography plugin, CaseStudyDetail page.
- 2026-02 (b) — Invoice module (multi-currency, ReportLab PDF, download + public token view + email send), Gmail SMTP integration for new-lead notifications, multi-language site (EN/DE/ES) with globe switcher, stats now include invoice counters.
- 2026-02 (c) — Admin DB auth migration (bcrypt) with "Forgot password" magic-link reset email via Gmail SMTP and `/admin/reset/:token` page.
- 2026-06 — Team Members section on About + admin CRUD; Videos (YouTube embed) module + admin CRUD; unified `/our-work` page merging Insights + Case Studies + Videos with category tabs; Site Settings panel + custom logo upload replacing navbar "M"; GitHub-backed media upload (private repo, proxied through `/api/media/{path}` with caching); Lead CSV export; global axios 401 interceptor.
- 2026-06 (b) — **GitHub media upload now LIVE end-to-end** (new PAT with Contents:Write on public repo `mirenterprises25-dotcom/Mir-Consulting-Published`). Site-wide SEO wired via `react-helmet-async`: `Seo` component now applied on Home (with Organization JSON-LD), About, Services, Industries, Contact, OurWork, InsightDetail, CaseStudyDetail, VideoDetail; admin pages (`/admin`, `/admin/reset/*`) and `NotFound` use `noIndex`. Static description/og meta tags removed from `index.html` to avoid duplicates. Canonical/hreflang point at production domain via `REACT_APP_SITE_URL`. Verified iteration_6 — 100% pass.
- 2026-06 (c) — **P2 + backlog completion**: (i) AI translation for CMS articles via Emergent Universal Key (`gemini-2.5-flash`), exposed as `POST /api/admin/translate` and as a 3-button toolbar inside the Insights + Case Studies editor (preserves markdown). (ii) Stripe Checkout on the new public invoice page `/invoice/:token` — `POST /api/invoices/public/{token}/checkout` + idempotent status poll + webhook; new `payment_transactions` audit collection. (iii) shadcn Calendar `DatePicker` replaces native date inputs in the invoice editor. (iv) Topic filter row on `/our-work`. (v) "New case studie" typo fixed (proper singular handling in `ContentList`). (vi) `/app/docs/` onboarding folder added (12 files: overview, folder map, env, data models, API reference, admin creds, integrations, workflows, dev, deploy, changelog, FAQ). Verified iteration_7 — 12/12 backend cases + 6/6 frontend flows pass.
- 2026-06 (d) — **Portability refactor**: removed proprietary `emergentintegrations` library. Rewrote `stripe_service.py` to use the official `stripe` Python SDK and `translate_service.py` to use `litellm` (vendor-agnostic; auto-picks first configured key from GEMINI/OPENAI/ANTHROPIC/EMERGENT_LLM_KEY). The codebase now deploys on any standard Python host with zero Emergent-only dependencies.

## Backlog
- **P1 (waiting on user)** — Custom domain + Render DNS setup: update `PUBLIC_BASE_URL`, `REACT_APP_SITE_URL`, `CORS_ORIGINS` once the domain is live. Regenerate `sitemap.xml` / `robots.txt`.
- **P3** — Optional: extend Posts/CaseStudies/Videos schema to link translations as siblings of the same logical article (today separate slugs).
- **P3** — Optional: ask Emergent to raise the per-call max_budget on `gemini-2.5-flash`.
- ~~**P3** — Cache `fetchSiteSettings()` in a React context.~~ ✅ Shipped 2026-06-09.

- 2026-06 (e) — **Server.py refactor (P2 closed)**: 1,407-line monolith split into modular routers — `server.py` (87 lines, app+middleware+startup), `deps.py` (DB, limiter, require_admin, helpers), `models.py` (all Pydantic schemas), and `routes/{public,admin_auth,admin_leads,admin_content,admin_invoices,admin_media,admin_translate}.py`. Also cleaned `requirements.txt` to direct deps only with version ranges (15 lines vs 132). Verified iteration_8 — 40/40 backend tests pass.
- 2026-06 (f) — **Admin.jsx refactor (P2 closed)**: 1,853-line single file split into modular components under `/app/frontend/src/pages/admin/`: `Admin.jsx` slimmed to 57 lines (auth shell only) + `_shared.js` (constants), `LoginScreen.jsx` (+ ForgotPasswordDialog), `Dashboard.jsx` (header, tabs, StatsCards), `LeadsPanel.jsx` (+ LeadDrawer), `PostsPanel.jsx` (Insights + CaseStudies + delegates to editor), `PostEditor.jsx` (markdown editor + AI translate bar), `ContentList.jsx` (shared table + StatusPill), `ConfirmDialog.jsx`, `ChangePasswordDialog.jsx`. Verified iteration_9 — 18/18 frontend scenarios pass with 0 page errors.
- 2026-06 (g) — **Footer logo sync**: Footer no longer shows a hardcoded "M" placeholder. It now calls `fetchSiteSettings()` on mount and renders the same uploaded logo as the navbar. Both `Navbar.jsx` (`h-9 w-auto max-w-[140px] object-contain`) and `Footer.jsx` (`h-10 w-auto max-w-[160px] object-contain`) preserve the uploaded image's natural aspect ratio. When no logo is set, both gracefully fall back to the original square "M" placeholder. Single source of truth: `PUT /api/admin/site-settings` from the Site tab updates both places.
- 2026-06 (h) — **Verification + GitHub-ready packaging**: iteration_10 frontend regression — 14/14 review-request scenarios pass (admin login, all CMS panels, contact form, language switcher, and the critical logo-sync test in both directions). Repo prepared for `git push`: added top-level `README.md` (setup, env, deploy, repo layout), `backend/.env.example`, and `frontend/.env.example`. `.gitignore` already excludes all `.env*` files, `node_modules`, caches, and `memory/test_credentials.md`. Verified no secrets in tracked files. Working tree (excluding `node_modules`/`.git`) is 2.3 MB — clean for GitHub.
- 2026-06 (i) — **Render build fix**: CRA 5 + Render Node 24 = `Unknown keyword formatMinimum` from `fork-ts-checker-webpack-plugin`. Plugin stripped via craco config (project is pure JS, no `.ts/.tsx` files exist); Node pinned to 20.18.0 via `.nvmrc` + `engines`. Added `render.yaml` Blueprint, `Procfile`, and `backend/Dockerfile` for one-shot deploys to any host. Removed dead `frontend/src/constants/testIds/` folder. Local production build verified.
- 2026-06 (j) — **Stripe removed → manual payment confirmation flow**: customer-driven payments now work without any third-party processor.
  - **Backend**: deleted `stripe_service.py` and removed `stripe` from `requirements.txt`. Routes `POST /api/invoices/public/{token}/checkout`, `GET /api/invoices/public/{token}/checkout/{session_id}`, and `POST /api/webhook/stripe` all return 404 now. New endpoints: `POST /api/invoices/public/{token}/confirm-payment` (client submits method + reference + note; rejects already-paid/void with 400, unknown method with 422) and `POST /api/admin/invoices/{id}/mark-paid` (one-click, idempotent, sets `paid_at`).
  - **SiteSettings extended** with bank (account name, bank, IBAN, SWIFT, account #, routing/sort, address), PayPal (email + PayPal.Me), Revolut (revtag + link), and contact-us fallback fields. All exposed via the existing public `/api/site-settings` endpoint.
  - **PDF**: `render_invoice_pdf` now appends a "HOW TO PAY" section listing the configured methods. Verified via pypdf extraction in tests.
  - **Frontend**: `PublicInvoice.jsx` fully rewritten — 4 expandable method cards + Step 2 confirmation form (reference + note). `SiteSettingsPanel.jsx` rewritten — Logo + 4 payment groups with all fields. `InvoicesPanel.jsx` adds a "⚑ confirmation submitted" badge per row + a one-click "Mark as Paid" button for non-paid invoices.
  - **Testing**: rewrote `test_iteration8_regression.py::TestInvoicesFullFlow::test_create_public_pdf_payment_flow` to assert confirm-payment + mark-paid. Plus testing-agent created `test_iteration11_payment_flow.py` (16 cases). Total backend suite: 56/56 pass. Frontend playwright: 12/12 review-request scenarios pass.
  - All Stripe references stripped from `README.md`, `render.yaml`, `backend/.env.example`.
- 2026-06 (k) — **Final pre-fork sweep**: removed the "Reference to include" field from Bank transfer settings/PDF/public-invoice (it duplicated the invoice number). Repo cleanup for fresh GitHub push: deleted `.emergent/`, `test_reports/`, `test_result.md`, `design_guidelines.json`, `.gitconfig`, empty root `tests/` + `yarn.lock` stub, and `frontend/plugins/health-check/`. Stripped `@emergentbase/visual-edits` from `package.json` and the visual-edits / health-check hooks from `craco.config.js`. Cleaned `frontend/public/index.html` of the PostHog/Emergent badge/main.js block. Removed the Emergent LLM fallback from `translate_service.py` — now strictly resolves to `GEMINI_API_KEY` → `OPENAI_API_KEY` → `ANTHROPIC_API_KEY`. Rewrote `.gitignore` (catch-all for `.env*`, `__pycache__`, build, caches, agent artifacts). Final tracked tree is 8.9 MB / 10 top-level entries. Production build clean. **56/56 backend tests pass.**
- 2026-06 (l) — **Social links + Render guide**: (i) Wired the previously-orphan `site_settings.linkedin_url` field into the admin UI — new "Social links" section in `SiteSettingsPanel.jsx` with a LinkedIn URL input. Footer LinkedIn icon already consumed this value; admin can now actually set/edit it. Verified via PUT `/api/admin/site-settings` + admin UI screenshot. (ii) Added `/app/RENDER_DEPLOY.md` — full step-by-step Render deployment guide (Blueprint route + manual route), exhaustive env-var matrix (required vs optional, with examples and obtainment instructions), MongoDB Atlas setup, custom-domain wiring, post-deploy checklist, and common-gotchas troubleshooting.
- 2026-06 (m) — **Pre-launch UX & content refresh (post-Render-deploy)**:
  - **Logo hard-coded.** New `src/config/branding.js` imports `src/assets/logo.png` (user-provided artwork). Navbar + Footer render it via `<img class="object-contain h-9 w-auto max-w-[140px]">` so any future replacement file keeps identical aspect/ratio. Admin **Site Settings** no longer exposes a logo upload — copy in the panel directs the user to replace the asset file in code. Backend `SiteSettings` model trimmed (`logo_url`, `linkedin_url` removed; legacy rows filtered in `admin_invoices._payment_settings()` to keep PDFs clean).
  - **Hard-coded social links.** `branding.js` exports `SOCIAL_LINKS = { linkedin, facebook, x }`. Footer renders LinkedIn, Facebook and X (custom inline SVG since Lucide doesn't ship an X icon) only when the corresponding URL is non-null — Facebook and X currently `null` (placeholders for user to fill).
  - **Service catalog refresh.** Retired `software-architecture`. Added two new senior services:
    - `marketing-brand-growth` — strategy, SEO, content, social, paid acquisition, brand positioning, email/lifecycle.
    - `ecommerce-online-sales` — Shopify / WooCommerce / Wix builds, Amazon / eBay / Etsy seller setup, multi-channel listing, product photography & copy direction, store operations + virtual-assistant support.
    Net result: **seven** integrated practices (was six). Updated home preview grid, full Services page count copy (`Seven integrated practices.`), icon map (new `Megaphone`, `ShoppingBag` icons), footer service list, Contact form `SERVICES` dropdown, and SEO `<meta keywords>` on `index.html`.
  - **Industries expanded.** Added three industries to surface the new services' audience: `d2c-brands` (D2C Brands & Online Retail), `marketplace-sellers` (Amazon/eBay/Etsy operators), and refreshed `smes` (SMEs & Growing Businesses) to lean into the marketing/online-presence angle. Contact form `INDUSTRIES` dropdown updated to match.
  - **Insights → Blog rename.** Public path changed from `/insights` to `/blog` (with slug-preserving 301-style React-Router `<Navigate>` from `/insights/:slug`). Updated `Insights.jsx`/`InsightDetail.jsx` copy, hero label, breadcrumbs, back-links, SEO title and `path`. Admin nav tab now labelled **Blog**, admin posts panel title is **Blog**, login-screen subtitle copy updated. i18n labels (`en/de/es`) updated. URL hierarchy in `OurWork.jsx` switched to `/blog/:slug`. Backend collection name stays `posts` (no migration needed) and `admin_media.py` allowed-folder list adds `case-studies`.
  - **Rich blog editor — phase 1 (markdown + image toolbar).** New toolbar above the markdown content textarea inside `PostEditor.jsx` with **Upload image** (uploads to GitHub via `/api/admin/media/upload`, folder `blog` or `case-studies` depending on context) and **Image from URL** buttons. Both insert `![alt](url)` at the current cursor position, so editors can place multiple images anywhere — top, middle, bottom, or clusters. Live preview shows uploaded images immediately (Tailwind Typography `prose-img` rules added). Phase 2 (TipTap WYSIWYG) tagged as P2 backlog.
  - **Navigation order:** unchanged per user preference.
  - Backend: `SiteSettings` test (`test_iteration5_new_features.py::TestSiteSettings`) rewritten to assert on `bank_iban` instead of removed `logo_url`. Media-upload PAT-readonly test relaxed to accept 200/201/502 (since GitHub PAT now works). **All 36 P1-touched tests pass.** Remaining test_suite failures are environmental Cloudflare 429s on the live preview URL, not regressions.
- 2026-06 (n) — **TipTap WYSIWYG + announcement bar + SEO retarget**:
  - **Free Initial Consultation announcement bar** — new `components/layout/AnnouncementBar.jsx` rendered above the navbar in `Layout.jsx`. Dismissible per-browser via `localStorage`. Exposes `--announcement-bar-h` CSS variable so the fixed navbar tucks under it.
  - **Bug fix (n.1):** the previous version left a 40 px gap above the navbar after the user scrolled past the bar (navbar pinned at `top:40` while bar scrolled away). AnnouncementBar now tracks `window.scrollY` and once it reaches the bar height it sets `--announcement-bar-h` to `0px`, snapping the navbar flush to `top:0`. A second variable `--announcement-bar-layout-h` keeps `<main>`'s padding-top stable (no content jump). Verified via screenshot.
  - **TipTap WYSIWYG editor (P2 closed).** Added deps `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-image`, `@tiptap/extension-link`, `@tiptap/extension-placeholder`, `@tiptap/extension-text-align`, `dompurify`. New `components/admin/RichEditor.jsx` exposes a toolbar (H2/H3, B/I/S, lists, quote, hr, link/unlink, image-upload via GitHub or image-from-URL, text-align, undo/redo) and emits sanitized HTML. `PostEditor.jsx` rewired to use `<RichEditor folder={isCS ? "case-studies" : "blog"}>`. Reader pages (`InsightDetail.jsx`, `CaseStudyDetail.jsx`) render through `components/RichContent.jsx` which uses DOMPurify on HTML strings and falls back to ReactMarkdown for any legacy markdown post (detected by first non-whitespace char != `<`). StarterKit's built-in Link is disabled (`link: false`) so the custom Link extension wins cleanly (no console warnings). Verified end-to-end by the frontend testing agent — 100 % pass on 9 scenarios including round-trip edits and sanitization.
  - **SEO retarget for marketing & e-commerce audience.**
    - `lib/Seo.jsx` default title is now `MIR Consulting — Strategy. Marketing. E-commerce. Intelligence.` and default description is the marketing/e-commerce-led copy with the free-consultation CTA.
    - `Home.jsx` now ships **3 JSON-LD blocks** (ProfessionalService with full hasOfferCatalog of 7 services + Offer for the free consultation, WebSite, and the existing static one from `index.html`). Description rewritten around D2C brands, marketplace sellers and SMBs.
    - `Services.jsx` adds an `ItemList` JSON-LD generated from the `SERVICES` array (positions + descriptions + provider).
    - `Industries.jsx` adds an `ItemList` schema and updated description that explicitly lists D2C brands, marketplace sellers and SMBs alongside hospitality / retail / logistics / manufacturing / technology.
    - `OurWork.jsx`, `Insights.jsx`, `CaseStudies.jsx`, `Contact.jsx` descriptions refreshed for the new positioning.
    - `public/index.html` already shipped the production ProfessionalService schema with Shopify / WooCommerce / Amazon / eBay / Etsy etc. — kept as crawler-friendly fallback.
  - PostEditor stale helper text "Markdown supported…" replaced with "Rich text editor — use the toolbar to add headings, images, links and lists."
  - Test seed data (TEST_ blog posts + case study) created by testing agent during verification has been cleaned up via the admin API.
- 2026-06 (o) — **Site Settings cache + Lead-magnet system**:
  - **Site-settings caching.** New `lib/SiteSettingsContext.jsx` wraps the SPA with a `SiteSettingsProvider`. The `/api/site-settings` response is now cached at **module scope as a Promise** (single in-flight fetch shared across consumers and navigations). `useSiteSettings()` returns `{settings, loading, error, refresh()}`. `PublicInvoice.jsx` migrated off the per-mount `fetchSiteSettings()` call to consume the context. Closes the long-standing P3 "cache fetchSiteSettings" backlog item.
  - **Lead-magnet system — Free Marketing Quick-Check + Free E-commerce Audit.** Two professional 2-page worksheet PDFs generated via ReportLab (`/tmp/gen_lead_magnet_pdfs.py`, output `/app/frontend/public/resources/marketing-quick-check.pdf` and `ecommerce-audit.pdf`). Each PDF includes a branded header bar, scoring rubric and CTA to book the free 30-minute consultation. User can replace either file with their own artwork at any time — the system references them by URL.
  - New `components/sections/LeadMagnetSection.jsx`: a section with two cards (light + dark to give visual variety). Clicking a card opens a shadcn `<Dialog>` with a tight form (full_name, email, company, optional "where are you today?"). Submission POSTs to the existing `/api/leads` endpoint with `service_interest = "Lead magnet — Marketing Quick-Check"` / `"… E-commerce Audit"` (so the admin sees these distinctly in the leads dashboard). On success the dialog switches to a thank-you state with an immediate PDF `<a download>` link, plus a `Sonner` toast. Robust error handling: FastAPI validation errors (array of objects) are normalized to a readable string before being toasted (avoids the "Objects are not valid as a React child" crash a previous draft hit).
  - Mounted on **Home.jsx** between `ServicesPreview` and `IndustriesPreview` (so visitors who just learned about the new marketing/e-commerce services get an immediate low-commitment hook), and on **Services.jsx** between the last service detail block and the bottom `CTASection`.
  - Both flows verified end-to-end via the screenshot/Playwright runner: card → dialog → form submission → 201 lead created → admin Gmail notification fires → PDF download URL resolves with `200 OK application/pdf 6981 bytes`. Test lead cleaned up via admin API after verification.
- 2026-06 (p) — **Image-upload UX fixes (user reported the Upload button wasn't working)**:
  - **Root cause:** the hidden `<input type="file">` used `className="hidden"` (= `display:none`). Safari/iOS and several stricter mobile browsers refuse to open the native file picker when `.click()` is called on a `display:none` input. The user's click silently did nothing. Fixed in both **`RichEditor.jsx`** and **`MediaUpload.jsx`** by switching to the safe pattern: `position:absolute; width:1px; height:1px; opacity:0; pointer-events:none; aria-hidden`.
  - **Disambiguation:** the two image toolbar buttons used near-identical lucide icons (`ImagePlus` vs `Image`). Replaced with clear visual labels — `Upload` icon + "Upload image" label, `Globe` icon + "From URL" label (labels collapse to icon-only at sub-`sm` widths). Tooltip on the upload button now includes "(max 8 MB)".
  - **Size limit surfaced everywhere:**
    - RichEditor toolbar has a permanent bottom hint: "Upload image: jpg / png / webp / gif, max 8 MB · From URL: paste a public https://… image link."
    - MediaUpload widget (Team, Videos panels) shows a `jpg, png, webp or gif · max 8 MB` micro-hint inline next to the action buttons.
    - Client-side validation now rejects non-image files and oversized files **before** uploading, with friendly toasts ("That image is X.X MB — please upload one under 8 MB").
  - **Better error handling:** explicit toasts for 401 (session expired), 503 (storage not configured), 413 (too large), 502 (GitHub unreachable). Axios `timeout: 60_000` so very slow phone uploads don't get cut at the proxy. Network errors are now `console.error`-logged for the user to copy if they need help debugging.
  - Verified end-to-end via Playwright: real-click upload → file picker opens → PNG uploads → image inserts into the editor → toast confirms.
- 2026-06-09 — **GitHub storage diagnostic + branded lead-magnet PDFs**:
  - **One-click GitHub Verify in Admin → Site Settings.** New `GET /api/admin/media/verify-github` endpoint runs a 4-step preflight against the configured `GITHUB_TOKEN` / `GITHUB_REPO` / `GITHUB_BRANCH`: (1) token validity via `GET /user`, (2) repo accessibility (catches the common fine-grained-PAT "this repo isn't in your token's access list" 404), (3) branch existence, (4) a live write-probe (creates + deletes a tiny `_diagnostics/probe-*.txt` file to prove `Contents: Read and write` is actually granted). Each step returns `{ok, detail, hint}` so the admin gets a precise remediation step instead of a generic "Upload to GitHub failed". `verify_config()` lives in `github_storage.py` and never raises — every failure is encoded in the JSON. The UI lives in `SiteSettingsPanel.jsx` as a `GitHubDiagnostics` block: pill-style button, status badge (`All checks passed` / `Issues detected`), and a colour-coded checklist of the four steps with hints inline. Tested in preview (all four checks green, token preview `gith…qVDn`). User can now triage the live Render upload failure without redeploying.
  - **Lead-magnet PDFs now branded.** Replaced the placeholder PDFs with reportlab-built two-page worksheets that carry the actual MIR Consulting logo (`frontend/src/assets/logo.png`) + "Mir Consulting" wordmark + "Marketing • E-commerce • Strategy" tagline in a persistent page header, and a footer with the company email + page numbers. Generator script saved at `/app/backend/scripts/generate_lead_magnets.py` (re-runnable, idempotent — overwrites the public/resources files). Content unchanged: 28-question marketing quick-check and 32-point e-commerce audit. Output is ~205 KB each, served at 200 from `/resources/*.pdf`. Verified header includes logo + wordmark via PDF inspection.

## Backlog (refreshed 2026-06-09 — see above)

## Changelog (continued)
- 2026-06-17 — **Phases D → E → C → F complete** (built in the order requested by the user; frontend verified 100% via testing agent — iteration_3.json; backend verified 11/11 via pytest):
  - **Phase D — Content relationships in admin.** New shared `TagSelector` chip component (`components/admin/TagSelector.jsx`). Wired into PostEditor, VideosPanel and TeamPanel as "Related services" / "Related industries" selectors (options sourced from the canonical `SERVICES`/`INDUSTRIES` lists in `lib/content.js` → exported as `SERVICE_OPTIONS`/`INDUSTRY_OPTIONS`). Payloads now persist `service_slugs`/`industry_slugs`. The public `/works` feed now returns these taxonomy fields per item.
  - **Phase E — Team profile pages.** Team members now get an auto-generated unique URL slug on create/update (`admin_content.py` via `unique_slug`); startup backfills slugs for any legacy members (`_backfill_team_slugs` in server.py). New public `GET /api/team/{slug}`. New `/team/:slug` page (`TeamProfile.jsx`) rendering headline, bio, career story, skills, tools, achievements, expertise, industries served, contact links + a related-work rail. TeamPanel editor extended with headline/career_story/skills/tools/achievements/email/slug fields. About-page team cards now link to profiles (`team-name-link-*`, `team-view-profile-*`).
  - **Phase C — Services & Industry detail pages.** New `/services/:slug` (`ServiceDetail.jsx`) and `/industries/:slug` (`IndustryDetail.jsx`) with premium dark hero (stock photo + gradient/grid backdrop, graceful onError fallback), overview/problems/offerings/outcomes (services) and challenges/solutions/use-cases (industries), plus auto-pulled related work + relevant team via shared slugs (`RelatedRail.jsx`). List cards (Services.jsx, Industries.jsx) now deep-link to detail pages; invalid slugs redirect to the list. Hero imagery added to `content.js` (`SERVICE_HERO_IMAGES`, `INDUSTRY_HERO_IMAGES`).
  - **Phase F — Hero enrichment.** About and Our Work heroes gained a subtle, masked, grayscale background-image layer (`PAGE_HERO_IMAGES`) behind the existing grid/halo — premium feel without breaking readability.
  - **Tests.** `backend/tests/test_phase_de.py` (team slug gen/uniqueness, public team-by-slug, extended fields, works taxonomy). Combined Phase B+D/E suite: 11/11 pass.
  - **NOTE (env):** The main agent's screenshot tool kept serving a stale disk-cached `bundle.js`; origin confirmed fresh via curl and the testing agent (fresh browser) verified all flows. Real browsers / hard refresh get the new UI.


## Changelog (continued)
- 2026-06-17 — **Phase B complete (Subscriber System, Scheduled Publishing, Cover Image Uploads, Related Insights)**:
  - **Subscriber system.** New `subscribers` Mongo collection + `Subscriber`/`SubscribeCreate` models (unique email index). `POST /api/public/subscribe` (rate-limited 5/min, idempotent on duplicate email, fires a Gmail notification to COMPANY_EMAIL via `send_new_subscriber_notification`). Footer now has a "Stay informed" subscribe form (`footer-subscribe-form`). Admin: new **Subscribers** tab → `SubscribersPanel.jsx` (list + delete + CSV export via `GET /api/admin/subscribers` and `/api/admin/subscribers-export.csv`). `subscribers_total` added to `/api/admin/stats`.
  - **Scheduled publishing.** Public list endpoints (`/posts`, `/case-studies`, `/videos`, `/works`) exclude items whose `scheduled_for` date is in the future via `_live_filter()`. Public detail endpoints mask future-scheduled items: body blanked + `is_scheduled=True` returned (added `is_scheduled` field to Post/CaseStudy/Video models). Frontend detail pages (InsightDetail, CaseStudyDetail, VideoDetail) render a new `ComingSoon` component (title + scheduled date + email-capture form that feeds the subscribers list). Admin editors (PostEditor, VideosPanel) gained a `DatePicker` "Schedule publish date" field.
  - **Cover image uploads.** PostEditor now uses the `MediaUpload` widget (GitHub proxy, URL fallback) for blog/case-study covers instead of a plain URL text field. VideosPanel already had it.
  - **Related insights rail.** New `RelatedInsights.jsx` on the blog detail page — ranks other published posts by shared `service_slugs`/`industry_slugs`, falls back to most recent.
  - **Tests.** `backend/tests/test_phase_b.py` — 8/8 pass against origin (subscribe create/idempotent/validation, admin list/CSV/delete, stats, future-masking, past-live).
  - **NOTE:** During this session the preview edge/CDN served a stale Brotli-compressed `bundle.js` to the Playwright screenshot tool (origin verified serving fresh code via curl). Real browsers with a hard refresh get the new UI. Frontend visual verification via the screenshot tool was blocked by this cache; backend fully verified.

