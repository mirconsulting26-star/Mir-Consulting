# Deploying MIR Consulting to Render

This repo is preconfigured for Render. You have **two** services to create:

1. **Backend** — Web Service (Python / FastAPI)
2. **Frontend** — Static Site (React build)

You can either use the included `render.yaml` blueprint (recommended — creates both at once), or create the two services manually. Both routes are documented below.

---

## Option A — One-click via Blueprint (recommended)

1. Push this repo to GitHub.
2. Render Dashboard → **New → Blueprint** → connect your repo.
3. Render detects `/render.yaml` and proposes both services.
4. Fill in the `sync: false` env vars (see the **Environment variables** section below).
5. Click **Apply** — both services build and deploy.
6. The frontend API origin is `https://mir-consulting-back.onrender.com`; set it as `REACT_APP_BACKEND_URL` if you create the services manually.

That's it. Skip to **Post-deploy checklist** at the bottom.

---

## Option B — Manual setup (two separate services)

### B.1 — Backend (Web Service)

| Field | Value |
|---|---|
| Service type | **Web Service** |
| Environment | **Python 3** |
| Region | Pick the closest to your customers |
| Branch | `main` |
| **Root Directory** | `backend` |
| **Build Command** | `pip install --upgrade pip && pip install -r requirements.txt` |
| **Start Command** | `uvicorn server:app --host 0.0.0.0 --port $PORT` |
| Health Check Path | `/api/health` |
| Plan | Starter is enough for launch (free tier sleeps after inactivity — paid plan recommended for production) |

Set **Python version** by adding an env var:
- `PYTHON_VERSION` = `3.11.9`

Then add the **Environment variables** below.

---

### B.2 — Frontend (Static Site)

| Field | Value |
|---|---|
| Service type | **Static Site** |
| Branch | `main` |
| **Root Directory** | `frontend` |
| **Build Command** | `yarn install --frozen-lockfile && yarn build` |
| **Publish Directory** | `build` |
| Auto-Deploy | On |

Add a **rewrite rule** so React Router deep links work (Render UI → Redirects/Rewrites):

| Source | Destination | Action |
|---|---|---|
| `/*` | `/index.html` | Rewrite |

Set Node version with an env var:
- `NODE_VERSION` = `20.18.0`

Then add the frontend env vars below.

---

## Environment variables

### Backend env vars (set on the **Web Service**)

| Key | Required | Example / Notes |
|---|---|---|
| `MONGO_URL` | ✅ | MongoDB Atlas connection string, e.g. `mongodb+srv://user:pass@cluster0.xxxx.mongodb.net/?retryWrites=true&w=majority` |
| `DB_NAME` | ✅ | `mir_consulting` (or whatever you prefer) |
| `CORS_ORIGINS` | ✅ | Comma-separated frontend origins: `https://www.mirconsulting.publicvm.com,https://mir-consulting-front.onrender.com` |
| `ADMIN_PASSWORD` | ✅ | Bootstrap password — used only the very first time the backend boots to seed the admin account. After that you log in with this password and can change it from the Admin panel. |
| `ADMIN_TOKEN` | ✅ | Long random string (Render's "Generate" works). Used to sign admin JWTs. |
| `COMPANY_EMAIL` | ✅ | Email shown publicly and used as the "from" for leads, e.g. `mirconsulting26@gmail.com` |
| `SMTP_HOST` | ✅ | `smtp.gmail.com` |
| `SMTP_PORT` | ✅ | `587` |
| `SMTP_USER` | ✅ | Your Gmail address |
| `SMTP_APP_PASSWORD` | ✅ | Google [App Password](https://myaccount.google.com/apppasswords) (16-char), **not** your normal Gmail password. 2FA must be on. |
| `PUBLIC_BASE_URL` | ✅ | The **frontend** public URL: `https://www.mirconsulting.publicvm.com`. Used to build invoice and password-reset links in emails. |
| `GITHUB_TOKEN` | ⛔ optional | PAT with `Contents: Read & Write` scope on the media repo. Only needed if you want to upload logos/team photos/case-study covers through the admin UI. |
| `GITHUB_REPO` | ⛔ optional | `owner/repo` for the media repo (e.g. `your-username/mir-media`) |
| `GITHUB_BRANCH` | ⛔ optional | `main` |
| `EMERGENT_LLM_KEY` *or* `OPENAI_API_KEY` *or* `GEMINI_API_KEY` *or* `ANTHROPIC_API_KEY` | ⛔ optional | Only needed if you want the CMS auto-translate (EN ↔ DE ↔ ES) feature. Plain `OPENAI_API_KEY` works out of the box. |
| `PYTHON_VERSION` | ✅ | `3.11.9` |

### Frontend env vars (set on the **Static Site**)

| Key | Required | Example / Notes |
|---|---|---|
| `REACT_APP_BACKEND_URL` | ✅ | The **backend** service URL: `https://mir-consulting-back.onrender.com`. **No trailing slash.** All frontend API calls are made to `${REACT_APP_BACKEND_URL}/api/...`. |
| `REACT_APP_SITE_URL` | ✅ | Preferred public canonical URL: `https://www.mirconsulting.publicvm.com`. Drives canonical, hreflang, Open Graph, and social-sharing URLs. Set it to `https://mir-consulting-front.onrender.com` only for a Render-host fallback/test build. |
| `NODE_VERSION` | ✅ | `20.18.0` |
| `ENABLE_HEALTH_CHECK` | ⛔ optional | `false` |

> ⚠️ CRA bakes environment variables at build time. Keep `REACT_APP_BACKEND_URL` set to the backend address above; changing the public domain only requires updating `REACT_APP_SITE_URL` and the static sitemap/robots URLs. Redeploy the frontend after changing either setting.

---

## MongoDB

Render does not host MongoDB. Easiest production option:

1. Create a free **MongoDB Atlas** M0 cluster: <https://www.mongodb.com/cloud/atlas/register>
2. Network Access → Add IP → **Allow access from anywhere** (`0.0.0.0/0`) since Render IPs are dynamic on starter plans.
3. Database Access → create a user with read+write to `mir_consulting`.
4. Copy the connection string into `MONGO_URL`.

---

## Custom domain

1. On the Render frontend Static Site, open **Settings → Custom Domains** and add `www.mirconsulting.publicvm.com`; configure DNS as instructed by Render and your DNS provider.
2. Keep `https://mir-consulting-front.onrender.com` available for testing and troubleshooting. It is not a public sitemap host.
3. Keep the frontend and backend origins distinct:
   - Frontend canonical (`REACT_APP_SITE_URL` and `PUBLIC_BASE_URL`): `https://www.mirconsulting.publicvm.com`
   - Frontend API origin (`REACT_APP_BACKEND_URL`): `https://mir-consulting-back.onrender.com`
   - Backend `CORS_ORIGINS`: include both the canonical frontend and Render frontend origins.

---

## Post-deploy checklist

After both services are green:

- [ ] Open `https://<backend>.onrender.com/api/health` → expect `{"status":"ok"}`.
- [ ] Open the frontend URL → homepage loads, footer shows the company logo placeholder (`M`).
- [ ] Go to `/admin` → log in with `COMPANY_EMAIL` + `ADMIN_PASSWORD`.
- [ ] **Site Settings** → upload a logo, paste your LinkedIn URL, fill in Bank/PayPal/Revolut details → Save.
- [ ] Submit the public contact form → confirm an email arrives in `COMPANY_EMAIL`'s inbox.
- [ ] **Leads → New Invoice** → open the public invoice link → make sure your payment methods render correctly → confirm the PDF downloads.
- [ ] Change the admin password from inside the Admin → Profile (rotates away from the bootstrap value).

---

## Common gotchas

- **CORS error in browser** → `CORS_ORIGINS` doesn't include your frontend's exact origin (scheme + host, no trailing slash). Update it and redeploy backend.
- **Frontend shows blank API errors** → `REACT_APP_BACKEND_URL` not set, or you forgot to **clear build cache** after changing it.
- **SMTP fails** → you used your Gmail password instead of an [App Password](https://myaccount.google.com/apppasswords). 2FA must be on first.
- **Backend cold-start delays on free tier** → upgrade the backend Web Service to Starter+, or hit `/api/health` from an external uptime monitor every 10 min.
- **Static site 404 on refresh** → you forgot the SPA rewrite rule (`/*` → `/index.html`).
