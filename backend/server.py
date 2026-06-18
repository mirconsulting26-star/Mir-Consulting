"""FastAPI entrypoint for MIR Consulting API.

Modular layout:
- deps.py            : env, DB client, shared helpers, admin guard, limiter
- models.py          : Pydantic request/response shapes
- routes/*.py        : one file per logical resource (public, auth, leads, content, invoices, media, translate)
- server.py (this)   : app construction, middleware, startup/shutdown, router wiring
"""
from __future__ import annotations

import logging
import os

from fastapi import APIRouter, FastAPI
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from starlette.middleware.cors import CORSMiddleware

import auth_admin
from deps import close_db_client, db, limiter
from routes import (
    admin_auth,
    admin_content,
    admin_invoices,
    admin_leads,
    admin_media,
    admin_translate,
    og,
    public,
)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)


# ====================== APP ======================
app = FastAPI(title="MIR Consulting API")
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


# Single /api parent router so every nested router auto-inherits the prefix.
api_router = APIRouter(prefix="/api")
api_router.include_router(public.router)
api_router.include_router(og.router)
api_router.include_router(admin_auth.router)
api_router.include_router(admin_leads.router)
api_router.include_router(admin_content.router)
api_router.include_router(admin_invoices.router)
api_router.include_router(admin_media.router)
api_router.include_router(admin_translate.router)
app.include_router(api_router)


# ====================== MIDDLEWARE ======================
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)


# Cache-Control for public GETs: browsers + CDNs can serve from cache for
# 60s, cutting Render origin hits during cold-start recovery. Admin and
# mutating routes are excluded so authenticated data is never cached.
_CACHEABLE_PREFIXES = (
    "/api/posts",
    "/api/case-studies",
    "/api/videos",
    "/api/team",
    "/api/works",
    "/api/site-settings",
    "/api/company",
    "/api/services",
    "/api/industries",
    "/api/subscribers/confirm",  # public confirmation page only
)


@app.middleware("http")
async def add_public_cache_headers(request, call_next):
    response = await call_next(request)
    if (
        request.method == "GET"
        and 200 <= response.status_code < 300
        and any(request.url.path.startswith(p) for p in _CACHEABLE_PREFIXES)
        and "/admin" not in request.url.path
    ):
        # public, browsers + CDNs cache for 60s; stale content allowed for
        # 5 min while server revalidates in background.
        response.headers.setdefault(
            "Cache-Control", "public, max-age=60, stale-while-revalidate=300"
        )
    return response


# ====================== LIFECYCLE ======================
@app.on_event("startup")
async def on_startup():
    try:
        await auth_admin.ensure_admin_seeded(db)
        await auth_admin.ensure_reset_indexes(db)
        await db.team_members.create_index([("order", 1), ("created_at", 1)])
        await db.videos.create_index("slug", unique=True)
        await db.subscribers.create_index("email", unique=True)
        await _backfill_team_slugs()
        logger.info("Admin auth bootstrapped (admin seeded, indexes ensured).")
    except Exception as e:  # noqa: BLE001
        logger.exception("Auth bootstrap failed: %s", e)


@app.on_event("shutdown")
async def on_shutdown():
    close_db_client()


async def _backfill_team_slugs():
    """Ensure every team member has a unique URL slug (Phase E)."""
    from slugify import slugify

    from deps import unique_slug

    cursor = db.team_members.find(
        {"$or": [{"slug": {"$exists": False}}, {"slug": None}, {"slug": ""}]},
        {"_id": 0, "id": 1, "name": 1},
    )
    async for doc in cursor:
        base = slugify(doc.get("name") or "member")
        slug = await unique_slug(db.team_members, base, exclude_id=doc["id"])
        await db.team_members.update_one({"id": doc["id"]}, {"$set": {"slug": slug}})
