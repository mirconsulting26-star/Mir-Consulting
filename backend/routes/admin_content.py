"""Admin CMS — posts (insights), case studies, team members, videos, site settings."""
import re
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException
from slugify import slugify

from deps import db, require_admin, unique_slug, utc_now_iso
from models import (
    CaseStudy,
    CaseStudyCreate,
    Post,
    PostCreate,
    SiteSettings,
    TeamMember,
    TeamMemberCreate,
    Video,
    VideoCreate,
)

router = APIRouter(prefix="/admin")
SITE_SETTINGS_KEY = "site"


# ====================== POSTS ======================
@router.get("/posts", response_model=List[Post])
async def admin_list_posts(_: bool = Depends(require_admin)):
    return await db.posts.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)


@router.post("/posts", response_model=Post, status_code=201)
async def admin_create_post(payload: PostCreate, _: bool = Depends(require_admin)):
    base = slugify(payload.slug or payload.title)
    slug = await unique_slug(db.posts, base)
    now = utc_now_iso()
    data = payload.model_dump(exclude={"slug"})
    post = Post(
        **data,
        slug=slug,
        published_at=now if payload.status == "published" else None,
    )
    await db.posts.insert_one(post.model_dump())
    return post


@router.get("/posts/{post_id}", response_model=Post)
async def admin_get_post(post_id: str, _: bool = Depends(require_admin)):
    doc = await db.posts.find_one({"id": post_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Post not found")
    return doc


@router.put("/posts/{post_id}", response_model=Post)
async def admin_update_post(
    post_id: str, payload: PostCreate, _: bool = Depends(require_admin)
):
    existing = await db.posts.find_one({"id": post_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Post not found")
    base = slugify(payload.slug or payload.title)
    slug = await unique_slug(db.posts, base, exclude_id=post_id)
    now = utc_now_iso()
    publish_now = payload.status == "published" and existing.get("status") != "published"
    updates = {
        **payload.model_dump(exclude={"slug"}),
        "slug": slug,
        "updated_at": now,
    }
    if publish_now:
        updates["published_at"] = now
    await db.posts.update_one({"id": post_id}, {"$set": updates})
    return await db.posts.find_one({"id": post_id}, {"_id": 0})


@router.delete("/posts/{post_id}")
async def admin_delete_post(post_id: str, _: bool = Depends(require_admin)):
    result = await db.posts.delete_one({"id": post_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Post not found")
    return {"deleted": True}


# ====================== CASE STUDIES ======================
@router.get("/case-studies", response_model=List[CaseStudy])
async def admin_list_case_studies(_: bool = Depends(require_admin)):
    return await (
        db.case_studies.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    )


@router.post("/case-studies", response_model=CaseStudy, status_code=201)
async def admin_create_case_study(payload: CaseStudyCreate, _: bool = Depends(require_admin)):
    base = slugify(payload.slug or payload.title)
    slug = await unique_slug(db.case_studies, base)
    now = utc_now_iso()
    data = payload.model_dump(exclude={"slug"})
    data["outcomes"] = data.get("outcomes") or []
    cs = CaseStudy(
        **data,
        slug=slug,
        published_at=now if payload.status == "published" else None,
    )
    await db.case_studies.insert_one(cs.model_dump())
    return cs


@router.get("/case-studies/{cs_id}", response_model=CaseStudy)
async def admin_get_case_study(cs_id: str, _: bool = Depends(require_admin)):
    doc = await db.case_studies.find_one({"id": cs_id}, {"_id": 0})
    if not doc:
        raise HTTPException(status_code=404, detail="Case study not found")
    return doc


@router.put("/case-studies/{cs_id}", response_model=CaseStudy)
async def admin_update_case_study(
    cs_id: str, payload: CaseStudyCreate, _: bool = Depends(require_admin)
):
    existing = await db.case_studies.find_one({"id": cs_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Case study not found")
    base = slugify(payload.slug or payload.title)
    slug = await unique_slug(db.case_studies, base, exclude_id=cs_id)
    now = utc_now_iso()
    publish_now = payload.status == "published" and existing.get("status") != "published"
    data = payload.model_dump(exclude={"slug"})
    data["outcomes"] = data.get("outcomes") or []
    updates = {**data, "slug": slug, "updated_at": now}
    if publish_now:
        updates["published_at"] = now
    await db.case_studies.update_one({"id": cs_id}, {"$set": updates})
    return await db.case_studies.find_one({"id": cs_id}, {"_id": 0})


@router.delete("/case-studies/{cs_id}")
async def admin_delete_case_study(cs_id: str, _: bool = Depends(require_admin)):
    result = await db.case_studies.delete_one({"id": cs_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Case study not found")
    return {"deleted": True}


# ====================== TEAM ======================
@router.get("/team", response_model=List[TeamMember])
async def list_team_admin(_: bool = Depends(require_admin)):
    return await (
        db.team_members.find({}, {"_id": 0})
        .sort([("order", 1), ("created_at", 1)])
        .to_list(500)
    )


@router.post("/team", response_model=TeamMember, status_code=201)
async def create_team_member(payload: TeamMemberCreate, _: bool = Depends(require_admin)):
    data = payload.model_dump()
    base = slugify(data.get("slug") or data.get("name"))
    data["slug"] = await unique_slug(db.team_members, base)
    member = TeamMember(**data)
    await db.team_members.insert_one(member.model_dump())
    return member


@router.put("/team/{member_id}", response_model=TeamMember)
async def update_team_member(
    member_id: str, payload: TeamMemberCreate, _: bool = Depends(require_admin)
):
    existing = await db.team_members.find_one({"id": member_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Team member not found")
    data = payload.model_dump()
    base = slugify(data.get("slug") or data.get("name"))
    data["slug"] = await unique_slug(db.team_members, base, exclude_id=member_id)
    updates = {**data, "updated_at": utc_now_iso()}
    result = await db.team_members.find_one_and_update(
        {"id": member_id}, {"$set": updates}, return_document=True, projection={"_id": 0}
    )
    return TeamMember(**result)


@router.delete("/team/{member_id}")
async def delete_team_member(member_id: str, _: bool = Depends(require_admin)):
    res = await db.team_members.delete_one({"id": member_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Team member not found")
    return {"deleted": True}


# ====================== VIDEOS ======================
_YT_PATTERNS = [
    r"(?:youtube\.com/watch\?v=)([A-Za-z0-9_-]{11})",
    r"(?:youtu\.be/)([A-Za-z0-9_-]{11})",
    r"(?:youtube\.com/embed/)([A-Za-z0-9_-]{11})",
    r"(?:youtube\.com/shorts/)([A-Za-z0-9_-]{11})",
]


def _extract_youtube_id(url: str) -> Optional[str]:
    if not url:
        return None
    for pat in _YT_PATTERNS:
        m = re.search(pat, url)
        if m:
            return m.group(1)
    return None


@router.get("/videos", response_model=List[Video])
async def list_videos_admin(_: bool = Depends(require_admin)):
    return await db.videos.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)


@router.post("/videos", response_model=Video, status_code=201)
async def create_video(payload: VideoCreate, _: bool = Depends(require_admin)):
    base = slugify(payload.slug or payload.title)
    slug = await unique_slug(db.videos, base)
    now = utc_now_iso()
    yt_id = _extract_youtube_id(payload.youtube_url)
    if not yt_id:
        raise HTTPException(status_code=400, detail="Could not extract YouTube video id from the URL")
    data = payload.model_dump(exclude={"slug"})
    data["category"] = data.get("category") or "Video"
    video = Video(
        **data,
        slug=slug,
        youtube_id=yt_id,
        published_at=now if payload.status == "published" else None,
    )
    await db.videos.insert_one(video.model_dump())
    return video


@router.put("/videos/{video_id}", response_model=Video)
async def update_video(
    video_id: str, payload: VideoCreate, _: bool = Depends(require_admin)
):
    existing = await db.videos.find_one({"id": video_id}, {"_id": 0})
    if not existing:
        raise HTTPException(status_code=404, detail="Video not found")
    yt_id = _extract_youtube_id(payload.youtube_url)
    if not yt_id:
        raise HTTPException(status_code=400, detail="Could not extract YouTube video id from the URL")
    base = slugify(payload.slug or payload.title)
    slug = await unique_slug(db.videos, base, exclude_id=video_id)
    now = utc_now_iso()
    publish_now = payload.status == "published" and existing.get("status") != "published"
    data = payload.model_dump(exclude={"slug"})
    data["category"] = data.get("category") or "Video"
    updates = {**data, "slug": slug, "youtube_id": yt_id, "updated_at": now}
    if publish_now:
        updates["published_at"] = now
    await db.videos.update_one({"id": video_id}, {"$set": updates})
    return await db.videos.find_one({"id": video_id}, {"_id": 0})


@router.delete("/videos/{video_id}")
async def delete_video(video_id: str, _: bool = Depends(require_admin)):
    res = await db.videos.delete_one({"id": video_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Video not found")
    return {"deleted": True}


# ====================== SITE SETTINGS ======================
@router.put("/site-settings", response_model=SiteSettings)
async def update_site_settings(payload: SiteSettings, _: bool = Depends(require_admin)):
    data = payload.model_dump()
    await db.site_settings.update_one(
        {"key": SITE_SETTINGS_KEY},
        {
            "$set": {**data, "updated_at": utc_now_iso()},
            "$setOnInsert": {"key": SITE_SETTINGS_KEY, "created_at": utc_now_iso()},
        },
        upsert=True,
    )
    return SiteSettings(**data)
