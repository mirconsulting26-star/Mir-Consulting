# MIR Consulting — Premium Consulting Website

A production-grade marketing site & CMS for MIR Consulting, built with **React + FastAPI + MongoDB**. Fully portable — no proprietary hosting libraries — and ready to deploy to any cloud or VPS.

## Highlights

- Marketing site (Home, About, Services, Industries, Our Work, Contact) with **i18n in English / German / Spanish**
- **Admin portal** with full CMS for Insights / Case Studies, Team, YouTube Videos, Site Settings, Custom Logo, and Leads
- **Invoice generation** with PDF + multi-currency + **manual payment confirmation** (Bank transfer / PayPal / Revolut / Contact-us). Customers submit a confirmation code after paying; admin verifies and marks paid in one click — no payment processor required.
- **Lead capture** with **Gmail SMTP** notifications (no third-party email API)
- **GitHub repository as media storage** (free CDN via raw.githubusercontent.com)
- **LLM-powered CMS translation** for one-click EN ↔ DE ↔ ES content
- SEO-optimized SPA with React Helmet, sitemap, structured data

## Tech Stack

| Layer | Stack |
| --- | --- |
| Frontend | React 19, React Router, Tailwind, shadcn/ui, react-i18next, lucide-react |
| Backend | FastAPI, Motor (async MongoDB), Pydantic v2, LiteLLM |
| Storage | MongoDB (data) + GitHub repo (media) |
| Email | Gmail SMTP via `smtplib` |
| Payments | Stripe Checkout |

## Repo Layout

```
backend/
  server.py              # FastAPI entry point
  deps.py                # DB + settings + auth dependencies
  models.py              # Pydantic schemas
  routes/                # Modular routers
    public.py
    admin_auth.py
    admin_leads.py
    admin_content.py
    admin_invoices.py
    admin_media.py
    admin_translate.py
  stripe_service.py      # Stripe checkout wrapper
  llm_service.py         # LiteLLM wrapper
  github_storage.py      # GitHub Contents API uploader
  email_service.py       # Gmail SMTP
  invoice_pdf.py         # PDF generator
  tests/                 # pytest regression suite
frontend/
  src/
    pages/               # Public pages + Admin shell
    pages/admin/         # Modular admin panels
    components/          # Layout, sections, ui (shadcn)
    lib/                 # api client, seo, i18n
docs/                    # API + ops notes
```

## Quick Start (Local)

```bash
# 1. Backend
cp backend/.env.example backend/.env       # fill in real secrets
cd backend
pip install -r requirements.txt
uvicorn server:app --host 0.0.0.0 --port 8001 --reload

# 2. Frontend (new terminal)
cp frontend/.env.example frontend/.env     # point REACT_APP_BACKEND_URL to your API
cd frontend
yarn install
yarn start                                 # http://localhost:3000
```

MongoDB must be reachable via `MONGO_URL`. The admin portal lives at `/admin` (login with `ADMIN_PASSWORD`).

## Required Third-Party Services

| Service | Why | How to get it |
| --- | --- | --- |
| **MongoDB** | Primary database | Self-host, Atlas free tier, or any provider |
| **Gmail App Password** | Lead notification emails | https://myaccount.google.com/apppasswords |
| **GitHub PAT (Classic, repo scope)** | Media uploads to your repo | https://github.com/settings/tokens |
| **LLM Provider Key** *(optional)* | Auto-translate CMS | OpenAI / Anthropic / Gemini key via LiteLLM |

## Environment Variables

See [`backend/.env.example`](backend/.env.example) and [`frontend/.env.example`](frontend/.env.example). Never commit your real `.env` files — they're git-ignored by default.

## Deployment

The app is fully portable. Pick the path that matches your host:

### Option A — Render.com (one-click via Blueprint)
1. Push this repo to GitHub.
2. In Render dashboard → **Blueprints** → "New Blueprint Instance" → select this repo.
3. Render reads [`render.yaml`](render.yaml) and provisions two services: `mir-consulting-api` (FastAPI) and `mir-consulting-web` (React static site).
4. Fill in the env vars marked `sync: false` in the dashboard (Mongo URL, Stripe key, Gmail App Password, GitHub PAT, etc.).
5. Hit Deploy. The frontend gets an SPA-rewrite rule so `/admin`, `/our-work/...` etc. all work.

### Option B — Heroku / Railway / Fly.io
- Backend: the repo ships a [`Procfile`](Procfile) that boots uvicorn on `$PORT`. Just point the platform at the repo root.
- Frontend: build with `cd frontend && yarn install --frozen-lockfile && yarn build`, then serve `frontend/build/` as a static site (Vercel, Netlify, Cloudflare Pages all work).

### Option C — Docker / VPS / AWS ECS / GCP Cloud Run
- Backend image:
  ```bash
  docker build -t mir-consulting-api -f backend/Dockerfile backend
  docker run -p 8001:8001 --env-file backend/.env mir-consulting-api
  ```
- Frontend: `cd frontend && yarn build`, then serve `frontend/build/` via nginx / Caddy / S3+CloudFront.

### Production checklist
- [ ] Set `CORS_ORIGINS` on the backend to the exact frontend origin (not `*`).
- [ ] Set `PUBLIC_BASE_URL` (backend) and `REACT_APP_SITE_URL` (frontend) to the live domain.
- [ ] If you use the AI translate feature, set one of `OPENAI_API_KEY` / `GEMINI_API_KEY` / `ANTHROPIC_API_KEY` (LiteLLM picks the first one available).
- [ ] In the Admin → **Site Settings** tab, fill in your bank / PayPal / Revolut / contact details so clients see them on every invoice.
- [ ] Regenerate `frontend/public/sitemap.xml` with your production domain.

## Tests

```bash
cd backend
pytest tests/                              # backend regression suite
```

## License

Proprietary — © MIR Consulting. All rights reserved.
