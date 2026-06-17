# Keep-Alive Setup — Render Free Tier Cold-Start Workaround

## The problem
Render's free tier spins down the backend after **~15 minutes of no traffic**.
The next request then takes **~50 seconds** while the container cold-boots.
Combined with MongoDB Atlas (also free tier) which can take a few seconds to
respond after sleep, a real user lands on a 50-second blank screen.

## The fix (free)
Hit the backend's `/api/health` endpoint every **14 minutes** from an external
service. Render only counts external HTTP traffic against the spin-down timer,
so the container stays warm 24/7.

## What to set up — 5 minutes, free, no card required

1. Go to **https://cron-job.org** and create a free account.
2. Click **Create cronjob**.
3. Fill in:
   - **Title**: `MIR Consulting keep-alive`
   - **URL**: `https://YOUR-RENDER-URL/api/health`
     (replace with your actual Render URL — the one in your frontend's
     `REACT_APP_BACKEND_URL` env var).
   - **Schedule**: Every **14 minutes** (the Render spin-down is 15 min, so
     14 gives a safety margin). In cron syntax: `*/14 * * * *`.
   - **Treat redirects as success**: ✅ checked.
   - **Notify on failure**: optional but recommended — get an email if the
     backend ever stops responding.
4. Click **Create**.
5. Done. Click the new job's **Test run** button to confirm it returns
   `{"status":"healthy"}`. The cron will fire every 14 min from then on.

## Alternative cron services (in case cron-job.org is down)
- **UptimeRobot** (free, 5-min minimum interval — set to 5 min)
- **EasyCron** (free tier 1 job)
- **GitHub Actions** (free; cron via `.github/workflows/keep-alive.yml`)

## What this changes
- ⏱ First visitor in any 14-min window: **instant** (was 50s)
- 💸 Cost: **$0/month**
- 🪫 Render free-tier monthly hours used: ~750 (the free quota is 750 — exactly
  enough for one always-on service. You won't go over.)

## When to upgrade to Render paid tier
- If you start receiving consistent traffic 24/7 you'll burn the 750 free
  hours and Render will spin you down anyway. At that point the **Starter
  plan ($7/mo)** removes the spin-down entirely and is the right move.
- For now the keep-alive cron is the free, zero-maintenance solution.

## Frontend layer (already done in code)
The app also uses **stale-while-revalidate caching** (`/src/lib/cache.js`)
so that even when a cold start happens, returning visitors see cached
content immediately and the new data swaps in silently when the network
catches up. Combined with the cron, perceived cold-start pain is
essentially eliminated.
