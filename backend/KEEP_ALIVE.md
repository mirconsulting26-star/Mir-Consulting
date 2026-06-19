# Keep-Alive & Cold-Start — Render Free Tier

## TL;DR
A GitHub Action (`.github/workflows/keep-alive.yml`) pings the backend every
~10 minutes so Render's free tier never spins the container down. This removes
the ~50s cold-start that visitors to the Admin Portal, Blogs, Case Studies,
Videos and other API-driven pages were hitting.

---

## 1. Root-cause analysis — where do the ~50 seconds come from?

We profiled the backend boot and request path. The ~50s is **NOT** the FastAPI
app's own startup — it is **Render free-tier infrastructure cold-start**:

| Phase | Owner | Typical time | Fixable in code? |
|-------|-------|--------------|------------------|
| Render container spin-up (after 15 min idle) | Render infra | **~45–50s** | ❌ No (only avoidable by keeping it warm or paying) |
| MongoDB Atlas free-tier wake on first query | Atlas infra | ~1–4s | ❌ No (kept warm by periodic DB-backed requests) |
| FastAPI app startup (`on_startup`) | Our code | **< 1s** | ✅ Optimised (see §3) |
| `/health` response | Our code | **~2–3 ms** | ✅ Already trivial, no DB |

What the app does at boot (all idempotent, all sub-second on a warm DB):
- `auth_admin.ensure_admin_seeded` — 1 read, + 1 insert **only on the very first
  boot ever** (bcrypt hash once).
- `ensure_reset_indexes` + 3 `create_index` calls — no-ops once indexes exist.
- `_backfill_team_slugs` — a query that now matches **0 docs** (already backfilled).

What the app does **NOT** do at boot (confirmed by inspection):
- ❌ No GitHub API calls (`github_storage.py` only runs on upload/fetch, never at import or startup).
- ❌ No file loading / disk scans.
- ❌ No blocking synchronous network calls.
- ❌ No external API dependencies during boot.

**Conclusion:** the cold-start is Render infrastructure. The only production-safe
fix is to keep the container warm. Secondary win: keep the Mongo connection warm
too (periodic DB-backed requests), so the first real visitor never pays the Atlas
wake either.

---

## 2. The solution — GitHub Actions keep-alive (free, zero-maintenance)

`.github/workflows/keep-alive.yml`:
- Runs on a `*/10 * * * *` schedule (every 10 min — safely under Render's 15-min
  spin-down, with margin for GitHub's scheduler jitter). Also `workflow_dispatch`
  for manual runs.
- **Step 1 — liveness:** `GET {BACKEND_URL}/health` (falls back to `/api/health`
  for ingress-prefixed deployments). Generous 90s timeout + retries to absorb a
  cold boot. Fails the job (visible red ❌) if the backend is genuinely down.
- **Step 2 — warm critical routes (best-effort):** `GET /api/posts`,
  `/api/case-studies`, `/api/videos`, `/api/works`. These touch MongoDB, so they
  establish the connection pool and keep Atlas awake — which also speeds up the
  Admin Dashboard and every other API-driven page. Warm requests never fail the
  job (the container is already warm after `/health`).

### One-time setup
In the GitHub repo: **Settings → Secrets and variables → Actions → Variables tab
→ New repository variable**:
- **Name:** `BACKEND_URL`
- **Value:** your Render backend origin, e.g. `https://your-backend.onrender.com`
  (no trailing slash) — the same origin as the frontend's `REACT_APP_BACKEND_URL`.

That's it. The Action shows up under the repo's **Actions** tab; you can hit
**Run workflow** to test immediately and watch the logs.

> Note: GitHub disables scheduled workflows on repos with **60 days of no commit
> activity**. If the repo goes dormant, re-enable it from the Actions tab.

---

## 3. Optimisations applied (production-safe)

1. **Dependency-free `/health` probe.** Added a bare `GET /health → {"status":"ok"}`
   registered directly on the app (outside the `/api` router) in addition to the
   existing `/api/health`. It performs zero DB / I/O and returns in ~2–3 ms, so the
   keep-alive ping is as cheap and fast as possible and doubles as a Render health
   check path.
2. **Non-blocking startup.** `on_startup` now schedules the bootstrap work (index
   creation + admin seed + slug backfill) via `asyncio.create_task` instead of
   `await`-ing it inline. The server reports "startup complete" and starts serving
   immediately; `/health` and read endpoints respond without waiting on
   index-creation round-trips against a cold Atlas. Safe because every operation is
   idempotent and admin login has a bootstrap fallback until seeding lands.
3. **Frontend cold-start masking (already in place).** `src/lib/cache.js` uses an
   in-memory stale-while-revalidate cache so returning visitors see content
   instantly and fresh data swaps in silently.

---

## 4. Before vs After

| Scenario | Before | After |
|----------|--------|-------|
| First visit after 15 min idle (Admin/Blogs/Case Studies/Videos) | ~50s blank wait | **Instant** (container kept warm) |
| `/health` response time | n/a (no bare probe) | **~2–3 ms** |
| App "startup complete" → ready to serve | after awaiting DB bootstrap | **immediate** (bootstrap runs in background) |
| Monthly cost | $0 | **$0** |
| Render free hours used | ~750 (one always-on service fits the free quota) | ~750 |

Validation performed:
- `GET /health` → `{"status":"ok"}` `[200]`, ~2–3 ms.
- `GET /api/health` → `{"status":"healthy", ...}` `[200]`.
- Warm routes `/api/posts`, `/api/case-studies`, `/api/videos`, `/api/works` → all `[200]`.
- Admin login → `[200]` (seed + bootstrap fallback verified after backgrounding startup).
- Workflow YAML validated; curl logic (incl. `/health`→`/api/health` fallback) simulated green against the live backend.

> After deploying, confirm in **Render → Logs** that a request hits roughly every
> 10 minutes from GitHub's runners — that's the keep-alive working.

---

## When to upgrade to Render paid tier
If you start receiving consistent 24/7 traffic you'll approach the 750 free
hours. At that point Render **Starter ($7/mo)** removes spin-down entirely and is
the right move. Until then, this keep-alive is the free, zero-maintenance fix.
