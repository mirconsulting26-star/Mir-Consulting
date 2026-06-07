"""Admin authentication helpers.

Single-admin model — kept intentionally simple:
- `admin_settings` doc holds the bcrypt password hash; seeded from ADMIN_PASSWORD on first boot.
- Static Bearer ADMIN_TOKEN remains the auth mechanism after login (already wired).
- `password_reset_tokens` collection stores SHA-256 hashes of one-time magic-link tokens
  with a 15-minute expiry.
"""
from __future__ import annotations

import hashlib
import os
import secrets
from datetime import datetime, timezone, timedelta
from typing import Optional

import bcrypt


# ---------------------------- password hashing ----------------------------
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except (ValueError, TypeError):
        return False


# ---------------------------- admin record --------------------------------
ADMIN_KEY = "admin"


async def ensure_admin_seeded(db) -> None:
    """Create the admin document on first boot using ADMIN_PASSWORD from env."""
    doc = await db.admin_settings.find_one({"key": ADMIN_KEY})
    if doc is not None:
        return
    bootstrap_pw = os.environ.get("ADMIN_PASSWORD")
    if not bootstrap_pw:
        return
    await db.admin_settings.insert_one(
        {
            "key": ADMIN_KEY,
            "password_hash": hash_password(bootstrap_pw),
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }
    )


async def get_admin(db) -> Optional[dict]:
    return await db.admin_settings.find_one({"key": ADMIN_KEY}, {"_id": 0})


async def set_admin_password(db, new_password: str) -> None:
    now_iso = datetime.now(timezone.utc).isoformat()
    await db.admin_settings.update_one(
        {"key": ADMIN_KEY},
        {
            "$set": {
                "password_hash": hash_password(new_password),
                "updated_at": now_iso,
            },
            "$setOnInsert": {"key": ADMIN_KEY, "created_at": now_iso},
        },
        upsert=True,
    )


async def verify_admin_password(db, password: str) -> bool:
    admin = await get_admin(db)
    if admin and admin.get("password_hash"):
        return verify_password(password, admin["password_hash"])
    # Bootstrap fallback: compare to env (one-shot before first ensure_admin_seeded)
    env_pw = os.environ.get("ADMIN_PASSWORD")
    return bool(env_pw) and secrets.compare_digest(password, env_pw)


# ---------------------------- reset tokens --------------------------------
RESET_TOKEN_TTL_MIN = 15


def _hash_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


async def create_reset_token(db) -> str:
    """Generate a one-time reset token, store its hash, return the plain token."""
    token = secrets.token_urlsafe(32)
    now = datetime.now(timezone.utc)
    expires = now + timedelta(minutes=RESET_TOKEN_TTL_MIN)
    await db.password_reset_tokens.insert_one(
        {
            "token_hash": _hash_token(token),
            "created_at": now.isoformat(),
            "expires_at": expires,  # native datetime for TTL index
            "used_at": None,
        }
    )
    return token


async def validate_reset_token(db, token: str) -> Optional[dict]:
    """Return the token record if valid (not used, not expired); else None."""
    if not token:
        return None
    rec = await db.password_reset_tokens.find_one({"token_hash": _hash_token(token)})
    if not rec or rec.get("used_at"):
        return None
    exp = rec.get("expires_at")
    if isinstance(exp, datetime):
        # exp may be naive (loaded from Mongo) — assume UTC
        if exp.tzinfo is None:
            exp = exp.replace(tzinfo=timezone.utc)
        if exp < datetime.now(timezone.utc):
            return None
    return rec


async def consume_reset_token(db, token: str) -> bool:
    res = await db.password_reset_tokens.update_one(
        {"token_hash": _hash_token(token), "used_at": None},
        {"$set": {"used_at": datetime.now(timezone.utc).isoformat()}},
    )
    return res.modified_count == 1


async def ensure_reset_indexes(db) -> None:
    # Auto-purge expired reset tokens
    await db.password_reset_tokens.create_index("expires_at", expireAfterSeconds=0)
    await db.password_reset_tokens.create_index("token_hash", unique=True)
