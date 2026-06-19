"""Server-rendered Open Graph cards for content detail pages.

Social crawlers (WhatsApp, LinkedIn, Facebook, X, Slack, iMessage) do NOT execute
JavaScript, so the client-side react-helmet tags on detail pages are invisible to
them — a shared blog/case-study/video link would otherwise fall back to the generic
homepage card.

This route returns lightweight, crawler-ready HTML containing per-page OG / Twitter
meta (title, description, cover image) plus JSON-LD, and redirects human visitors to
the real SPA page. The site's Share buttons point here so shared links render a rich,
per-item preview card on every platform.
"""
import html
import os
import re

from fastapi import APIRouter, Response

from deps import db

router = APIRouter()

DEFAULT_OG_IMAGE_PATH = "/api/media/logos/og-cover-a62bc596.jpg"
SITE_NAME = "MIR Consulting"


def _base() -> str:
    return os.environ.get("PUBLIC_BASE_URL", "").rstrip("/")


def _abs(url: str | None, base: str) -> str | None:
    if not url:
        return None
    if url.startswith("http://") or url.startswith("https://"):
        return url
    return f"{base}{url if url.startswith('/') else '/' + url}"


def _esc(s: str | None) -> str:
    return html.escape(s or "", quote=True)


def _clean(text: str | None, limit: int = 200) -> str:
    """Strip HTML tags + collapse whitespace, truncated for meta descriptions."""
    if not text:
        return ""
    no_tags = re.sub(r"<[^>]+>", " ", text)
    collapsed = re.sub(r"\s+", " ", no_tags).strip()
    if len(collapsed) > limit:
        collapsed = collapsed[: limit - 1].rstrip() + "…"
    return collapsed


# kind -> (collection, human-path template, og type)
_KINDS = {
    "blog": (lambda: db.posts, "/blog/{slug}", "article"),
    "case-study": (lambda: db.case_studies, "/case-studies/{slug}", "article"),
    "video": (lambda: db.videos, "/our-work/video/{slug}", "video.other"),
}


def _extract_fields(kind: str, doc: dict, base: str) -> dict:
    title = doc.get("title") or SITE_NAME
    if kind == "case-study":
        desc = _clean(doc.get("summary") or doc.get("content"))
    elif kind == "video":
        desc = _clean(doc.get("description"))
    else:
        desc = _clean(doc.get("excerpt") or doc.get("content"))

    image = _abs(doc.get("cover_image"), base)
    if not image and kind == "video" and doc.get("youtube_id"):
        image = f"https://img.youtube.com/vi/{doc['youtube_id']}/maxresdefault.jpg"
    if not image:
        image = _abs(DEFAULT_OG_IMAGE_PATH, base)
    return {"title": title, "desc": desc, "image": image}


def _render_html(*, title, desc, image, url, og_type) -> str:
    full_title = f"{title} | {SITE_NAME}"
    schema_type = "VideoObject" if og_type == "video.other" else "Article"
    return f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>{_esc(full_title)}</title>
<meta name="description" content="{_esc(desc)}" />
<link rel="canonical" href="{_esc(url)}" />

<meta property="og:site_name" content="{SITE_NAME}" />
<meta property="og:type" content="{og_type}" />
<meta property="og:title" content="{_esc(full_title)}" />
<meta property="og:description" content="{_esc(desc)}" />
<meta property="og:url" content="{_esc(url)}" />
<meta property="og:image" content="{_esc(image)}" />
<meta property="og:image:secure_url" content="{_esc(image)}" />
<meta property="og:image:alt" content="{_esc(title)}" />

<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="{_esc(full_title)}" />
<meta name="twitter:description" content="{_esc(desc)}" />
<meta name="twitter:image" content="{_esc(image)}" />

<script type="application/ld+json">
{{"@context":"https://schema.org","@type":"{schema_type}","headline":{_json_str(title)},"description":{_json_str(desc)},"image":{_json_str(image)},"url":{_json_str(url)},"publisher":{{"@type":"Organization","name":"{SITE_NAME}"}}}}
</script>

<meta http-equiv="refresh" content="0; url={_esc(url)}" />
<script>window.location.replace({_json_str(url)});</script>
</head>
<body>
<p>Redirecting to <a href="{_esc(url)}">{_esc(full_title)}</a>…</p>
</body>
</html>"""


def _json_str(s: str | None) -> str:
    import json

    return json.dumps(s or "")


@router.get("/og/{kind}/{slug}")
async def og_card(kind: str, slug: str):
    base = _base()
    cfg = _KINDS.get(kind)
    if not cfg:
        # Unknown kind → bounce to homepage.
        return _redirect_response(base or "/")

    collection_fn, path_tmpl, og_type = cfg
    doc = await collection_fn().find_one(
        {"slug": slug, "status": "published"}, {"_id": 0}
    )
    human_url = f"{base}{path_tmpl.format(slug=slug)}"
    if not doc:
        return _redirect_response(human_url)

    fields = _extract_fields(kind, doc, base)
    html_doc = _render_html(
        title=fields["title"],
        desc=fields["desc"],
        image=fields["image"],
        url=human_url,
        og_type=og_type,
    )
    return Response(
        content=html_doc,
        media_type="text/html; charset=utf-8",
        headers={"Cache-Control": "public, max-age=300"},
    )


def _redirect_response(url: str) -> Response:
    safe = _esc(url)
    body = (
        f'<!doctype html><html><head><meta charset="utf-8"/>'
        f'<meta http-equiv="refresh" content="0; url={safe}"/>'
        f"<script>window.location.replace({_json_str(url)});</script></head>"
        f'<body><a href="{safe}">Continue</a></body></html>'
    )
    return Response(content=body, media_type="text/html; charset=utf-8")
