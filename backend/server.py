from fastapi import FastAPI, APIRouter, HTTPException, Depends, Header
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import List, Optional
import uuid
import secrets
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

ADMIN_PASSWORD = os.environ.get('ADMIN_PASSWORD', 'mir-admin-2025')
ADMIN_TOKEN = os.environ.get('ADMIN_TOKEN') or secrets.token_urlsafe(32)

app = FastAPI(title="MIR Consulting API")
api_router = APIRouter(prefix="/api")


# ====================== MODELS ======================
class LeadCreate(BaseModel):
    model_config = ConfigDict(extra="ignore")
    full_name: str = Field(min_length=2, max_length=120)
    email: EmailStr
    company: Optional[str] = Field(default=None, max_length=160)
    phone: Optional[str] = Field(default=None, max_length=40)
    industry: Optional[str] = Field(default=None, max_length=80)
    service_interest: Optional[str] = Field(default=None, max_length=160)
    message: str = Field(min_length=10, max_length=4000)


class Lead(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    full_name: str
    email: str
    company: Optional[str] = None
    phone: Optional[str] = None
    industry: Optional[str] = None
    service_interest: Optional[str] = None
    message: str
    status: str = "new"
    created_at: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())


class AdminLogin(BaseModel):
    password: str


class AdminLoginResponse(BaseModel):
    token: str


# ====================== AUTH DEP ======================
def require_admin(authorization: Optional[str] = Header(default=None)) -> bool:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing admin token")
    token = authorization.split(" ", 1)[1].strip()
    if token != ADMIN_TOKEN:
        raise HTTPException(status_code=401, detail="Invalid admin token")
    return True


# ====================== ROUTES ======================
@api_router.get("/")
async def root():
    return {"service": "MIR Consulting API", "status": "ok"}


@api_router.get("/health")
async def health():
    return {"status": "healthy", "timestamp": datetime.now(timezone.utc).isoformat()}


@api_router.post("/leads", response_model=Lead, status_code=201)
async def create_lead(payload: LeadCreate):
    lead = Lead(**payload.model_dump())
    doc = lead.model_dump()
    await db.leads.insert_one(doc)
    logger.info(f"New lead captured: {lead.email} ({lead.full_name})")
    return lead


@api_router.post("/admin/login", response_model=AdminLoginResponse)
async def admin_login(payload: AdminLogin):
    if not secrets.compare_digest(payload.password, ADMIN_PASSWORD):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return AdminLoginResponse(token=ADMIN_TOKEN)


@api_router.get("/admin/leads", response_model=List[Lead])
async def list_leads(_: bool = Depends(require_admin)):
    rows = await db.leads.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return rows


@api_router.get("/admin/stats")
async def admin_stats(_: bool = Depends(require_admin)):
    total = await db.leads.count_documents({})
    new_count = await db.leads.count_documents({"status": "new"})
    return {"total_leads": total, "new_leads": new_count}


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
