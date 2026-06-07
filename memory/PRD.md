# MIR Consulting — PRD

## Original Problem Statement
Rebuild the entire MIR Consulting website from scratch — a premium, scalable, modern consulting website that reflects a professional business consulting and technology advisory company. MIR Consulting operates at the intersection of Business Consulting, Data Analytics & BI, IT Consulting, Software Architecture, Process Automation, Dashboard Development, Operational Optimization, and Digital Transformation. Must feel: premium, professional, modern, corporate, high trust, technology-driven, enterprise-scale.

## User Choices (verbatim)
- Stack: React + FastAPI + MongoDB (acknowledged Next.js not available).
- Contact handling: MongoDB + simple admin dashboard.
- Insights/CaseStudies: full CMS in admin (markdown textarea **with live preview**).
- Public pages: show **static placeholder fallback** when CMS DB is empty.
- Logo: text-based "MIR Consulting" wordmark.
- Design: brighter / white background main (light theme dominant, midnight navy + electric blue accents).
- Email integration: explicitly skipped.

## Architecture
- **Frontend**: React SPA with React Router. Tailwind CSS + shadcn/ui + Framer Motion + Lucide. react-helmet-async for SEO. react-markdown + remark-gfm for content. @tailwindcss/typography for prose styling.
- **Backend**: FastAPI (`/app/backend/server.py`) — all routes prefixed `/api`. Motor for MongoDB. slowapi for rate-limiting. python-slugify for unique slugs.
- **Auth**: Static admin token returned by /api/admin/login; Bearer header for /api/admin/*.
- **DB Collections**:
  - `leads` — full_name, email, company, phone, industry, service_interest, message, status (new|contacted|qualified|won|lost), notes, created_at, updated_at.
  - `posts` — slug, title, excerpt, content (markdown), category, cover_image, read_time, status (draft|published), timestamps, published_at.
  - `case_studies` — slug, title, sector, summary, content (markdown), client_name, outcomes[], cover_image, status, timestamps, published_at.

## Pages
- Public: `/` `/about` `/services` `/industries` `/insights` `/insights/:slug` `/case-studies` `/case-studies/:slug` `/contact` and `*` 404.
- Admin: `/admin` (no nav/footer) — tabbed dashboard:
  - **Leads** tab: stats cards, search, status filter, status dropdown per row, eye → drawer (full message + notes textarea + Save), trash → AlertDialog delete confirm.
  - **Insights** tab: list + New/Edit/Delete; PostEditor with two-column layout (form + live markdown preview).
  - **Case Studies** tab: same flow + sector, summary, client name, outcomes (one per line).

## API
- `GET /api/health`, `GET /api/company`
- `POST /api/leads` (public, rate-limited 5/min)
- `POST /api/admin/login` (rate-limited 5/min) → `{ token }`
- `GET /api/admin/leads?status=&q=`, `GET /api/admin/leads/{id}`, `PATCH /api/admin/leads/{id}`, `DELETE /api/admin/leads/{id}`
- `GET /api/admin/stats`
- `GET /api/posts`, `GET /api/posts/{slug}` (public, published only)
- `GET /api/admin/posts`, `POST /api/admin/posts`, `GET/PUT/DELETE /api/admin/posts/{id}`
- `GET /api/case-studies`, `GET /api/case-studies/{slug}` (public, published only)
- `GET /api/admin/case-studies`, `POST /api/admin/case-studies`, `GET/PUT/DELETE /api/admin/case-studies/{id}`

## SEO
- `Seo` component (react-helmet-async) wired into all major pages with unique title/description/OG/canonical.
- `/app/frontend/public/robots.txt` + `/app/frontend/public/sitemap.xml`.

## Verified Functionality
- **Iteration 1** (MVP): 100% backend / 100% frontend (`/app/test_reports/iteration_1.json`).
- **Iteration 2** (this round): All 27 backend pytest cases pass; full Playwright e2e — SEO, contact form, fallback placeholders, full CMS CRUD with markdown preview, lead status workflow + notes + delete, rate-limiting (429 on 6th call) (`/app/test_reports/iteration_2.json`). No bugs, no retests required.

## Credentials & Secrets
- `/app/memory/test_credentials.md` — admin password `mir-admin-2025`.
- Backend `.env`: `ADMIN_PASSWORD`, `ADMIN_TOKEN`, `MONGO_URL`, `DB_NAME`, `CORS_ORIGINS`, `COMPANY_EMAIL`.

## Changelog
- 2025-12 — MVP site (pages, contact form, basic admin).
- 2026-02 — Full CMS for Insights + Case Studies, lead status workflow + drawer + delete, rate-limiting on /leads and /admin/login, SEO basics (helmet + robots.txt + sitemap.xml), markdown live preview editor, tailwind typography plugin, CaseStudyDetail page.

## Backlog / Next Items
- **P1** — Email notifications on new lead (Resend/SendGrid) — *user previously deferred*.
- **P2** — Lead CSV export from admin.
- **P2** — Image upload (S3 / Cloudinary) instead of URL paste for cover images.
- **P2** — Global axios 401 interceptor for auto-logout across panels.
- **P3** — Public LinkedIn / contact integrations on Contact page.
- **P3** — Tag/category filtering on public Insights index.
