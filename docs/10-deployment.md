# 10 · Deployment checklist

> Always update [11-changelog.md](./11-changelog.md) with a new entry when you deploy.

## Pre-flight

1. **Public domain decided** (currently `https://www.mirconsulting.publicvm.com`).
2. **DNS** points to your hosting provider (Emergent / Vercel / Railway / etc.). For Emergent, use the "Deploy" button — the platform handles the certs.
3. **Backend env**:
   - `PUBLIC_BASE_URL=https://www.mirconsulting.publicvm.com`
   - `STRIPE_API_KEY` swapped from `sk_test_emergent` to your live restricted key.
   - `JWT_SECRET` regenerated (32+ bytes).
   - `ADMIN_INITIAL_PASSWORD` only needed on the very first deploy — remove or rotate after first login.
   - `SMTP_*` set for the production mailbox.
   - `GITHUB_TOKEN` rotated and limited to read+write on the media repo only.
   - `EMERGENT_LLM_KEY` set with a healthy balance.
4. **Frontend env**:
   - `REACT_APP_BACKEND_URL=https://mir-consulting-back.onrender.com` ← backend API; keep separate from the website.
   - `REACT_APP_SITE_URL=https://www.mirconsulting.publicvm.com` ← drives canonical/hreflang. **Always set this.**
5. **Sitemap / robots**:
   - Keep `/app/frontend/public/sitemap.xml` and `robots.txt` on the canonical public domain only; do not list the Render frontend fallback.
   - `robots.txt` already disallows `/admin*` — verify.
6. **Stripe webhook**: if enabled, use the backend service URL (currently `https://mir-consulting-back.onrender.com`) for its webhook endpoint, not the public frontend domain.

## Deploy

If using Emergent:
1. Click **Deploy** in the chat.
2. Verify by visiting the production URL.
3. Re-run the testing-agent against the production URL by passing the new `REACT_APP_BACKEND_URL` in your test description.

## Post-deploy smoke

```bash
WEB=https://www.mirconsulting.publicvm.com
API=https://mir-consulting-back.onrender.com
curl -s "$API/api/health" | python3 -m json.tool                   # backend health
curl -s "$WEB/sitemap.xml" | head                                  # SEO
curl -s "$WEB/robots.txt" | head                                   # SEO
curl -s -X POST "$API/api/admin/login" -H "Content-Type: application/json" \
   -d '{"password":"<new prod password>"}' | python3 -m json.tool  # admin auth
```

Also:
- Submit a fake contact form → check the lead lands in the admin tab AND that you got the SMTP notification.
- Create a $1 test invoice, send it to your own email, click "Pay online" with a Stripe test card.
- Open `/admin/reset/<expired>` — should show "link is invalid or expired."

## Rollback

Use the Emergent **Rollback** feature — it restores both code and env safely.
Do NOT `git reset` manually inside the pod (it can desync the platform).
