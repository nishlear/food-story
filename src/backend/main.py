import asyncio
import base64
import json
import os
import uuid
from typing import Dict, List, Optional
from urllib import error as urllib_error
from urllib import request as urllib_request

import edge_tts
from fastapi import BackgroundTasks, Depends, FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from sqlalchemy import Column, Float, ForeignKey, Integer, String, Text, create_engine, text
from sqlalchemy.orm import Session, declarative_base, relationship, sessionmaker

# ==============================================================================
# Database Setup (SQLAlchemy)
# ==============================================================================

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./foodguide.db")
SUPPORTED_LANGUAGES = ["en", "vi", "ko", "ja", "zh-CN", "zh-TW", "es"]

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# ==============================================================================
# Database Models
# ==============================================================================


class FoodStreet(Base):
    __tablename__ = "food_streets"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, index=True)
    city = Column(String)
    description = Column(Text, nullable=True)
    lat_nw = Column(Float, nullable=True)
    lon_nw = Column(Float, nullable=True)
    lat_se = Column(Float, nullable=True)
    lon_se = Column(Float, nullable=True)
    map_image_path = Column(Text, nullable=True)
    map_zoom = Column(Integer, default=19)
    map_updated_at = Column(String, nullable=True)

    vendors = relationship(
        "FoodVendor", back_populates="street", cascade="all, delete-orphan"
    )


class FoodVendor(Base):
    __tablename__ = "food_vendors"

    id = Column(String, primary_key=True, index=True)
    street_id = Column(String, ForeignKey("food_streets.id", ondelete="CASCADE"))
    name = Column(String, index=True)
    description = Column(Text, nullable=True)
    rating = Column(Float, default=0.0)
    reviews = Column(Integer, default=0)
    x = Column(Float)
    y = Column(Float)
    type = Column(String)
    address = Column(String, nullable=True)
    images = Column(Text, nullable=True)  # Stored as JSON string
    owner_username = Column(String, nullable=True)
    lat = Column(Float, nullable=True)
    lon = Column(Float, nullable=True)

    street = relationship("FoodStreet", back_populates="vendors")
    comments = relationship("FoodComment", back_populates="vendor", cascade="all, delete-orphan")


class AppUser(Base):
    __tablename__ = "app_users"

    id = Column(String, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    password = Column(String)
    role = Column(String)
    created_at = Column(String)


class FoodComment(Base):
    __tablename__ = "food_comments"

    id = Column(String, primary_key=True, index=True)
    vendor_id = Column(String, ForeignKey("food_vendors.id", ondelete="CASCADE"))
    username = Column(String)
    rating = Column(Integer)
    body = Column(Text)
    created_at = Column(String)

    vendor = relationship("FoodVendor", back_populates="comments")


# Run migrations before create_all to handle columns added after initial deploy
with engine.connect() as _conn:
    _conn.execute(text(
        "ALTER TABLE food_vendors ADD COLUMN IF NOT EXISTS owner_username TEXT"
    ))
    for col_sql in [
        "ALTER TABLE food_streets ADD COLUMN IF NOT EXISTS lat_nw FLOAT",
        "ALTER TABLE food_streets ADD COLUMN IF NOT EXISTS lon_nw FLOAT",
        "ALTER TABLE food_streets ADD COLUMN IF NOT EXISTS lat_se FLOAT",
        "ALTER TABLE food_streets ADD COLUMN IF NOT EXISTS lon_se FLOAT",
        "ALTER TABLE food_streets ADD COLUMN IF NOT EXISTS map_image_path TEXT",
        "ALTER TABLE food_streets ADD COLUMN IF NOT EXISTS map_zoom INTEGER DEFAULT 19",
        "ALTER TABLE food_streets ADD COLUMN IF NOT EXISTS map_updated_at TEXT",
        "ALTER TABLE food_vendors ADD COLUMN IF NOT EXISTS lat FLOAT",
        "ALTER TABLE food_vendors ADD COLUMN IF NOT EXISTS lon FLOAT",
    ]:
        _conn.execute(text(col_sql))
    _conn.commit()

Base.metadata.create_all(bind=engine)

# ==============================================================================
# Pydantic Schemas
# ==============================================================================


class FoodVendorBase(BaseModel):
    name: str
    description: Optional[str] = None
    description_language: str = "en"
    description_translations: Optional[Dict[str, str]] = None
    rating: float = 0.0
    reviews: int = 0
    x: float
    y: float
    type: str
    address: Optional[str] = None
    images: Optional[List[str]] = []
    owner_username: Optional[str] = None
    lat: Optional[float] = None
    lon: Optional[float] = None


class FoodVendorCreate(FoodVendorBase):
    id: Optional[str] = None


class FoodVendorResponse(FoodVendorBase):
    id: str
    street_id: str
    description_translations: Dict[str, str] = {}

    class Config:
        from_attributes = True


class FoodStreetBase(BaseModel):
    name: str
    city: str
    description: Optional[str] = None
    lat_nw: Optional[float] = None
    lon_nw: Optional[float] = None
    lat_se: Optional[float] = None
    lon_se: Optional[float] = None
    map_zoom: int = 19


class FoodStreetCreate(FoodStreetBase):
    id: Optional[str] = None


class FoodStreetResponse(FoodStreetBase):
    id: str
    vendors_count: int = 0
    map_image_path: Optional[str] = None
    map_updated_at: Optional[str] = None

    class Config:
        from_attributes = True


class LoginRequest(BaseModel):
    username: str
    password: str


class RegisterRequest(BaseModel):
    username: str
    password: str


class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str
    confirm_password: str


class CommentCreate(BaseModel):
    rating: int
    body: str


class CommentResponse(BaseModel):
    id: str
    vendor_id: str
    username: str
    rating: int
    body: str
    created_at: str

    class Config:
        from_attributes = True


class UserResponse(BaseModel):
    id: str
    username: str
    role: str
    created_at: str

    class Config:
        from_attributes = True


class AdminUpdateUserRequest(BaseModel):
    role: str


class AdminUpdateVendorOwnerRequest(BaseModel):
    owner_username: Optional[str] = None


class VendorEditRequest(BaseModel):
    name: str
    description: Optional[str] = None
    description_language: str = "en"
    images: Optional[List[str]] = []


# ==============================================================================
# Auth
# ==============================================================================


def get_user_from_token(token: str) -> Optional[dict]:
    try:
        decoded = base64.b64decode(token).decode("utf-8")
        parts = decoded.split(":")
        role = parts[0]
        username = ":".join(parts[1:])
        if role in ("user", "foodvendor", "admin"):
            return {"role": role, "username": username}
        return None
    except Exception:
        return None


def get_role_from_token(token: str) -> Optional[str]:
    user = get_user_from_token(token)
    return user["role"] if user else None


def require_authenticated(x_role_token: Optional[str] = Header(default=None)) -> dict:
    if not x_role_token:
        raise HTTPException(status_code=401, detail="Unauthorized")
    user = get_user_from_token(x_role_token)
    if not user:
        raise HTTPException(status_code=401, detail="Unauthorized")
    return user


def require_admin(x_role_token: Optional[str] = Header(default=None)) -> dict:
    user = require_authenticated(x_role_token)
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Forbidden")
    return user


def require_vendor_or_admin(x_role_token: Optional[str] = Header(default=None)) -> dict:
    user = require_authenticated(x_role_token)
    if user["role"] not in ("admin", "foodvendor"):
        raise HTTPException(status_code=403, detail="Forbidden")
    return user


# ==============================================================================
# FastAPI App & Dependencies
# ==============================================================================

app = FastAPI(title="Street Food Audio Guide API", redirect_slashes=False)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static map file serving
_maps_dir = os.path.join(os.path.dirname(__file__), "..", "static", "maps")
os.makedirs(_maps_dir, exist_ok=True)
app.mount("/maps", StaticFiles(directory=_maps_dir), name="maps")

# Static audio file serving
_audio_dir = os.path.join(os.path.dirname(__file__), "..", "static", "audio")
os.makedirs(_audio_dir, exist_ok=True)
app.mount("/audio", StaticFiles(directory=_audio_dir), name="audio")

EDGE_TTS_VOICES = {
    "en": "en-US-GuyNeural",
    "vi": "vi-VN-HoaiMyNeural",
    "ko": "ko-KR-SunHiNeural",
    "ja": "ja-JP-NanamiNeural",
    "zh-CN": "zh-CN-XiaoxiaoNeural",
    "zh-TW": "zh-TW-HsiaoChenNeural",
    "es": "es-ES-ElviraNeural",
}


async def _generate_single_audio(vendor_id: str, lang: str, text: str):
    voice = EDGE_TTS_VOICES.get(lang)
    if not voice or not text:
        return
    out_path = os.path.join(_audio_dir, f"{vendor_id}_{lang}.mp3")
    try:
        communicate = edge_tts.Communicate(text, voice)
        await communicate.save(out_path)
        print(f"Generated audio: {out_path}")
    except Exception as e:
        print(f"TTS generation failed for {vendor_id}/{lang}: {e}")


def generate_vendor_audio(vendor_id: str, description_translations: dict):
    async def _run():
        tasks = [
            _generate_single_audio(vendor_id, lang, text)
            for lang, text in description_translations.items()
            if text
        ]
        await asyncio.gather(*tasks)

    asyncio.run(_run())


from map_utils import generate_map_png


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ==============================================================================
# Seed Users on Startup
# ==============================================================================


def seed_users(db: Session):
    from datetime import datetime
    if db.query(AppUser).count() == 0:
        now = datetime.utcnow().isoformat()
        for username, role in [("user", "user"), ("foodvendor", "foodvendor"), ("admin", "admin")]:
            db.add(AppUser(
                id=str(uuid.uuid4()),
                username=username,
                password="123123",
                role=role,
                created_at=now,
            ))
        db.commit()


with SessionLocal() as _seed_db:
    seed_users(_seed_db)


# ==============================================================================
# Helper: Recalculate Vendor Rating
# ==============================================================================


def recalc_vendor_rating(vendor_id: str, db: Session):
    comments = db.query(FoodComment).filter(FoodComment.vendor_id == vendor_id).all()
    count = len(comments)
    if count == 0:
        avg = 0.0
    else:
        avg = round(sum(c.rating for c in comments) / count, 1)
    vendor = db.query(FoodVendor).filter(FoodVendor.id == vendor_id).first()
    if vendor:
        vendor.rating = avg
        vendor.reviews = count
        db.commit()


def clean_text(value) -> Optional[str]:
    if not isinstance(value, str):
        return None
    trimmed = value.strip()
    return trimmed or None


def normalize_description_translations(value) -> Dict[str, str]:
    text_value = clean_text(value)
    if not text_value:
        return {}

    try:
        parsed = json.loads(text_value)
        if not isinstance(parsed, dict):
            return {"en": text_value}
        normalized: Dict[str, str] = {}
        for language in SUPPORTED_LANGUAGES:
            translated = clean_text(parsed.get(language))
            if translated:
                normalized[language] = translated
        return normalized
    except (TypeError, json.JSONDecodeError):
        return {"en": text_value}


def pick_display_description(descriptions: Dict[str, str]) -> Optional[str]:
    for language in ["vi", "en", "ko", "ja", "zh-CN", "zh-TW", "es"]:
        translated = clean_text(descriptions.get(language))
        if translated:
            return translated
    for translated in descriptions.values():
        cleaned = clean_text(translated)
        if cleaned:
            return cleaned
    return None


def serialize_description_translations(descriptions: Dict[str, str]) -> Optional[str]:
    normalized: Dict[str, str] = {}
    for language in SUPPORTED_LANGUAGES:
        translated = clean_text(descriptions.get(language))
        if translated:
            normalized[language] = translated
    return json.dumps(normalized) if normalized else None


def normalize_vendor_response(vendor: FoodVendor) -> dict:
    result = {c.name: getattr(vendor, c.name) for c in vendor.__table__.columns}
    description_translations = normalize_description_translations(vendor.description)
    result["description"] = pick_display_description(description_translations)
    result["description_translations"] = description_translations
    result["description_language"] = "en"
    result["images"] = json.loads(vendor.images) if vendor.images else []
    return result


def translate_vietnamese_description(description: str) -> Dict[str, str]:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY is not configured")

    target_languages = [language for language in SUPPORTED_LANGUAGES if language != "vi"]
    payload = {
        "model": "gpt-4o-mini",
        "temperature": 0,
        "response_format": {"type": "json_object"},
        "messages": [
            {
                "role": "system",
                "content": (
                    "You translate Vietnamese vendor descriptions into other languages. "
                    "Return JSON only. Preserve meaning, tone, and food-specific details. "
                    "Keys must exactly match the requested language codes."
                ),
            },
            {
                "role": "user",
                "content": json.dumps(
                    {
                        "source_language": "vi",
                        "source_text": description,
                        "target_languages": target_languages,
                    }
                ),
            },
        ],
    }
    req = urllib_request.Request(
        "https://api.openai.com/v1/chat/completions",
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}",
        },
        method="POST",
    )
    try:
        with urllib_request.urlopen(req, timeout=30) as response:
            data = json.loads(response.read().decode("utf-8"))
    except urllib_error.URLError as exc:
        raise RuntimeError("OpenAI translation request failed") from exc

    content = (
        data.get("choices", [{}])[0]
        .get("message", {})
        .get("content", "")
    )
    parsed = json.loads(content) if isinstance(content, str) and content else {}
    translations: Dict[str, str] = {}
    for language in target_languages:
        translated = clean_text(parsed.get(language)) if isinstance(parsed, dict) else None
        if translated:
            translations[language] = translated
    return translations


def build_description_translations(
    existing_value,
    description,
    description_language: Optional[str],
    provided_translations: Optional[dict] = None,
) -> Dict[str, str]:
    if isinstance(provided_translations, dict):
        normalized: Dict[str, str] = {}
        for language in SUPPORTED_LANGUAGES:
            translated = clean_text(provided_translations.get(language))
            if translated:
                normalized[language] = translated
        return normalized

    source_language = description_language if description_language in SUPPORTED_LANGUAGES else "en"
    next_value = normalize_description_translations(existing_value)
    source_text = clean_text(description)

    if not source_text:
        next_value.pop(source_language, None)
        return next_value

    next_value[source_language] = source_text

    if source_language != "vi":
        return next_value

    try:
        translations = translate_vietnamese_description(source_text)
        for language in SUPPORTED_LANGUAGES:
            if language == "vi":
                continue
            translated = clean_text(translations.get(language))
            if translated:
                next_value[language] = translated
            else:
                next_value.pop(language, None)
    except Exception as exc:
        print(f"Vendor description translation failed: {exc}")

    return next_value


# ==============================================================================
# Auth Endpoints
# ==============================================================================


@app.post("/auth/login")
def login(body: LoginRequest, db: Session = Depends(get_db)):
    entry = db.query(AppUser).filter(AppUser.username == body.username).first()
    if not entry or entry.password != body.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = base64.b64encode(f"{entry.role}:{body.username}".encode()).decode()
    return {"username": body.username, "role": entry.role, "token": token}


@app.post("/auth/register", status_code=201)
def register(body: RegisterRequest, db: Session = Depends(get_db)):
    if not body.username or not body.password:
        raise HTTPException(status_code=400, detail="Username and password required")
    existing = db.query(AppUser).filter(AppUser.username == body.username).first()
    if existing:
        raise HTTPException(status_code=409, detail="Username already taken")
    from datetime import datetime
    now = datetime.utcnow().isoformat()
    new_user = AppUser(
        id=str(uuid.uuid4()),
        username=body.username,
        password=body.password,
        role="user",
        created_at=now,
    )
    db.add(new_user)
    db.commit()
    token = base64.b64encode(f"user:{body.username}".encode()).decode()
    return {"username": body.username, "role": "user", "token": token}


@app.put("/auth/change-password")
def change_password(
    body: ChangePasswordRequest,
    current_user: dict = Depends(require_authenticated),
    db: Session = Depends(get_db),
):
    if body.new_password != body.confirm_password:
        raise HTTPException(status_code=400, detail="New passwords do not match")
    entry = db.query(AppUser).filter(AppUser.username == current_user["username"]).first()
    if not entry or entry.password != body.old_password:
        raise HTTPException(status_code=401, detail="Old password is incorrect")
    entry.password = body.new_password
    db.commit()
    return {"success": True}


# ==============================================================================
# API Endpoints (CRUD)
# ==============================================================================


@app.get("/streets", response_model=List[FoodStreetResponse])
def list_streets(
    current_user: dict = Depends(require_authenticated),
    db: Session = Depends(get_db),
):
    streets = db.query(FoodStreet).all()
    result = []
    for s in streets:
        v_count = (
            db.query(FoodVendor).filter(FoodVendor.street_id == s.id).count()
        )
        result.append(
            {
                "id": s.id,
                "name": s.name,
                "city": s.city,
                "description": s.description,
                "vendors_count": v_count,
                "lat_nw": s.lat_nw,
                "lon_nw": s.lon_nw,
                "lat_se": s.lat_se,
                "lon_se": s.lon_se,
                "map_zoom": s.map_zoom if s.map_zoom is not None else 19,
                "map_image_path": s.map_image_path,
                "map_updated_at": s.map_updated_at,
            }
        )
    return result


@app.post("/streets", response_model=FoodStreetResponse, status_code=201)
def create_street(
    street: FoodStreetCreate,
    current_user: dict = Depends(require_admin),
    db: Session = Depends(get_db),
):
    street_id = street.id or str(uuid.uuid4())
    db_street = FoodStreet(
        id=street_id,
        name=street.name,
        city=street.city,
        description=street.description,
        lat_nw=street.lat_nw,
        lon_nw=street.lon_nw,
        lat_se=street.lat_se,
        lon_se=street.lon_se,
        map_zoom=street.map_zoom,
    )
    db.add(db_street)
    db.commit()
    db.refresh(db_street)
    if db_street.lat_nw is not None and db_street.lon_nw is not None and db_street.lat_se is not None and db_street.lon_se is not None:
        output_path = os.path.join(_maps_dir, f"{street_id}.png")
        zoom = db_street.map_zoom if db_street.map_zoom is not None else 19
        success = generate_map_png(db_street.lat_nw, db_street.lon_nw, db_street.lat_se, db_street.lon_se, zoom, output_path)
        if success:
            from datetime import datetime
            db_street.map_image_path = f"maps/{street_id}.png"
            db_street.map_updated_at = datetime.utcnow().isoformat()
            db.commit()
            db.refresh(db_street)
    return {
        "id": db_street.id,
        "name": db_street.name,
        "city": db_street.city,
        "description": db_street.description,
        "vendors_count": 0,
        "lat_nw": db_street.lat_nw,
        "lon_nw": db_street.lon_nw,
        "lat_se": db_street.lat_se,
        "lon_se": db_street.lon_se,
        "map_zoom": db_street.map_zoom if db_street.map_zoom is not None else 19,
        "map_image_path": db_street.map_image_path,
        "map_updated_at": db_street.map_updated_at,
    }


@app.get("/streets/{street_id}", response_model=FoodStreetResponse)
def get_street(
    street_id: str,
    current_user: dict = Depends(require_authenticated),
    db: Session = Depends(get_db),
):
    db_street = db.query(FoodStreet).filter(FoodStreet.id == street_id).first()
    if not db_street:
        raise HTTPException(status_code=404, detail="Street not found")
    v_count = db.query(FoodVendor).filter(FoodVendor.street_id == street_id).count()
    return {
        "id": db_street.id,
        "name": db_street.name,
        "city": db_street.city,
        "description": db_street.description,
        "vendors_count": v_count,
        "lat_nw": db_street.lat_nw,
        "lon_nw": db_street.lon_nw,
        "lat_se": db_street.lat_se,
        "lon_se": db_street.lon_se,
        "map_zoom": db_street.map_zoom if db_street.map_zoom is not None else 19,
        "map_image_path": db_street.map_image_path,
        "map_updated_at": db_street.map_updated_at,
    }


@app.put("/streets/{street_id}", response_model=FoodStreetResponse)
def update_street(
    street_id: str,
    street: FoodStreetBase,
    current_user: dict = Depends(require_admin),
    db: Session = Depends(get_db),
):
    db_street = db.query(FoodStreet).filter(FoodStreet.id == street_id).first()
    if not db_street:
        raise HTTPException(status_code=404, detail="Street not found")
    for key, value in street.model_dump().items():
        setattr(db_street, key, value)
    db.commit()
    db.refresh(db_street)
    if db_street.lat_nw is not None and db_street.lon_nw is not None and db_street.lat_se is not None and db_street.lon_se is not None:
        output_path = os.path.join(_maps_dir, f"{street_id}.png")
        zoom = db_street.map_zoom if db_street.map_zoom is not None else 19
        success = generate_map_png(db_street.lat_nw, db_street.lon_nw, db_street.lat_se, db_street.lon_se, zoom, output_path)
        if success:
            from datetime import datetime
            db_street.map_image_path = f"maps/{street_id}.png"
            db_street.map_updated_at = datetime.utcnow().isoformat()
            db.commit()
            db.refresh(db_street)
    v_count = db.query(FoodVendor).filter(FoodVendor.street_id == street_id).count()
    return {
        "id": db_street.id,
        "name": db_street.name,
        "city": db_street.city,
        "description": db_street.description,
        "vendors_count": v_count,
        "lat_nw": db_street.lat_nw,
        "lon_nw": db_street.lon_nw,
        "lat_se": db_street.lat_se,
        "lon_se": db_street.lon_se,
        "map_zoom": db_street.map_zoom if db_street.map_zoom is not None else 19,
        "map_image_path": db_street.map_image_path,
        "map_updated_at": db_street.map_updated_at,
    }


@app.delete("/streets/{street_id}")
def delete_street(
    street_id: str,
    current_user: dict = Depends(require_admin),
    db: Session = Depends(get_db),
):
    db_street = db.query(FoodStreet).filter(FoodStreet.id == street_id).first()
    if not db_street:
        raise HTTPException(status_code=404, detail="Street not found")
    db.delete(db_street)
    db.commit()
    return {"success": True, "message": "Street and associated vendors deleted"}


@app.get(
    "/streets/{street_id}/vendors", response_model=List[FoodVendorResponse]
)
def list_vendors(
    street_id: str,
    current_user: dict = Depends(require_authenticated),
    db: Session = Depends(get_db),
):
    if not db.query(FoodStreet).filter(FoodStreet.id == street_id).first():
        raise HTTPException(status_code=404, detail="Street not found")
    vendors = db.query(FoodVendor).filter(FoodVendor.street_id == street_id).all()
    result = []
    for v in vendors:
        result.append(normalize_vendor_response(v))
    return result


@app.post(
    "/streets/{street_id}/vendors",
    response_model=FoodVendorResponse,
    status_code=201,
)
def add_vendor(
    street_id: str,
    vendor: FoodVendorCreate,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(require_vendor_or_admin),
    db: Session = Depends(get_db),
):
    if not db.query(FoodStreet).filter(FoodStreet.id == street_id).first():
        raise HTTPException(status_code=404, detail="Street not found")
    vendor_id = vendor.id or str(uuid.uuid4())
    vendor_data = vendor.model_dump(exclude={"id"})
    vendor_data.pop("description_language", None)
    vendor_data.pop("description_translations", None)
    description_translations = build_description_translations(
        None,
        vendor.description,
        vendor.description_language,
    )
    vendor_data["description"] = serialize_description_translations(description_translations)
    vendor_data["images"] = json.dumps(vendor_data.get("images") or [])
    # Set owner_username for foodvendor
    if current_user["role"] == "foodvendor":
        vendor_data["owner_username"] = current_user["username"]
    db_vendor = FoodVendor(**vendor_data, id=vendor_id, street_id=street_id)
    db.add(db_vendor)
    db.commit()
    db.refresh(db_vendor)
    translations = normalize_description_translations(db_vendor.description)
    background_tasks.add_task(generate_vendor_audio, str(vendor_id), translations)
    return normalize_vendor_response(db_vendor)


@app.get(
    "/streets/{street_id}/vendors/{vendor_id}", response_model=FoodVendorResponse
)
def get_vendor(
    street_id: str,
    vendor_id: str,
    current_user: dict = Depends(require_authenticated),
    db: Session = Depends(get_db),
):
    v = (
        db.query(FoodVendor)
        .filter(FoodVendor.id == vendor_id, FoodVendor.street_id == street_id)
        .first()
    )
    if not v:
        raise HTTPException(status_code=404, detail="Vendor not found")
    return normalize_vendor_response(v)


@app.get("/api/vendors/{vendor_id}/audio-status")
def get_vendor_audio_status(vendor_id: str):
    languages = [
        lang for lang in EDGE_TTS_VOICES
        if os.path.exists(os.path.join(_audio_dir, f"{vendor_id}_{lang}.mp3"))
    ]
    return {"languages": languages}


@app.put(
    "/streets/{street_id}/vendors/{vendor_id}", response_model=FoodVendorResponse
)
def update_vendor(
    street_id: str,
    vendor_id: str,
    vendor: FoodVendorBase,
    background_tasks: BackgroundTasks,
    current_user: dict = Depends(require_authenticated),
    db: Session = Depends(get_db),
):
    db_vendor = (
        db.query(FoodVendor)
        .filter(FoodVendor.id == vendor_id, FoodVendor.street_id == street_id)
        .first()
    )
    if not db_vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")

    if current_user["role"] == "admin":
        data = vendor.model_dump()
        description_language = data.pop("description_language", None)
        provided_translations = data.pop("description_translations", None)
        description_translations = build_description_translations(
            db_vendor.description,
            data.get("description"),
            description_language,
            provided_translations,
        )
        data["description"] = serialize_description_translations(description_translations)
        data["images"] = json.dumps(data.get("images") or [])
        for key, value in data.items():
            setattr(db_vendor, key, value)
    elif current_user["role"] == "foodvendor" and db_vendor.owner_username == current_user["username"]:
        # Foodvendor can only update name, description, images
        db_vendor.name = vendor.name
        description_translations = build_description_translations(
            db_vendor.description,
            vendor.description,
            vendor.description_language,
        )
        db_vendor.description = serialize_description_translations(description_translations)
        db_vendor.images = json.dumps(vendor.images or [])
    else:
        raise HTTPException(status_code=403, detail="Forbidden")

    db.commit()
    db.refresh(db_vendor)
    translations = normalize_description_translations(db_vendor.description)
    background_tasks.add_task(generate_vendor_audio, str(vendor_id), translations)
    return normalize_vendor_response(db_vendor)


@app.delete("/streets/{street_id}/vendors/{vendor_id}")
def delete_vendor(
    street_id: str,
    vendor_id: str,
    current_user: dict = Depends(require_admin),
    db: Session = Depends(get_db),
):
    db_vendor = (
        db.query(FoodVendor)
        .filter(FoodVendor.id == vendor_id, FoodVendor.street_id == street_id)
        .first()
    )
    if not db_vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    db.delete(db_vendor)
    db.commit()
    return {"success": True, "message": "Vendor deleted"}


# ==============================================================================
# Vendor Mine Endpoint
# ==============================================================================


@app.get("/vendors/mine", response_model=List[FoodVendorResponse])
def get_my_vendors(
    current_user: dict = Depends(require_authenticated),
    db: Session = Depends(get_db),
):
    if current_user["role"] != "foodvendor":
        raise HTTPException(status_code=403, detail="Forbidden")
    vendors = db.query(FoodVendor).filter(FoodVendor.owner_username == current_user["username"]).all()
    result = []
    for v in vendors:
        result.append(normalize_vendor_response(v))
    return result


# ==============================================================================
# Comments Endpoints
# ==============================================================================


@app.get("/vendors/{vendor_id}/comments", response_model=List[CommentResponse])
def list_comments(
    vendor_id: str,
    current_user: dict = Depends(require_authenticated),
    db: Session = Depends(get_db),
):
    comments = (
        db.query(FoodComment)
        .filter(FoodComment.vendor_id == vendor_id)
        .order_by(FoodComment.created_at.desc())
        .all()
    )
    return [
        {c.name: getattr(cmt, c.name) for c in cmt.__table__.columns}
        for cmt in comments
    ]


@app.post("/vendors/{vendor_id}/comments", status_code=201)
def add_comment(
    vendor_id: str,
    body: CommentCreate,
    current_user: dict = Depends(require_authenticated),
    db: Session = Depends(get_db),
):
    if body.rating < 1 or body.rating > 5:
        raise HTTPException(status_code=400, detail="Rating must be 1-5")
    if not db.query(FoodVendor).filter(FoodVendor.id == vendor_id).first():
        raise HTTPException(status_code=404, detail="Vendor not found")
    from datetime import datetime
    now = datetime.utcnow().isoformat()
    comment = FoodComment(
        id=str(uuid.uuid4()),
        vendor_id=vendor_id,
        username=current_user["username"],
        rating=body.rating,
        body=body.body,
        created_at=now,
    )
    db.add(comment)
    db.commit()
    recalc_vendor_rating(vendor_id, db)
    return {"success": True}


@app.delete("/vendors/{vendor_id}/comments/{comment_id}")
def delete_comment(
    vendor_id: str,
    comment_id: str,
    current_user: dict = Depends(require_admin),
    db: Session = Depends(get_db),
):
    comment = (
        db.query(FoodComment)
        .filter(FoodComment.id == comment_id, FoodComment.vendor_id == vendor_id)
        .first()
    )
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
    db.delete(comment)
    db.commit()
    recalc_vendor_rating(vendor_id, db)
    return {"success": True}


# ==============================================================================
# Admin Endpoints
# ==============================================================================


@app.get("/admin/stats")
def admin_stats(
    current_user: dict = Depends(require_admin),
    db: Session = Depends(get_db),
):
    streets = db.query(FoodStreet).count()
    vendors = db.query(FoodVendor).count()
    users = db.query(AppUser).count()
    comments = db.query(FoodComment).count()
    return {"streets": streets, "vendors": vendors, "users": users, "comments": comments}


@app.get("/admin/users", response_model=List[UserResponse])
def admin_list_users(
    current_user: dict = Depends(require_admin),
    db: Session = Depends(get_db),
):
    users = db.query(AppUser).all()
    return [{"id": u.id, "username": u.username, "role": u.role, "created_at": u.created_at} for u in users]


@app.put("/admin/users/{user_id}")
def admin_update_user(
    user_id: str,
    body: AdminUpdateUserRequest,
    current_user: dict = Depends(require_admin),
    db: Session = Depends(get_db),
):
    target = db.query(AppUser).filter(AppUser.id == user_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="User not found")
    if target.username == current_user["username"]:
        raise HTTPException(status_code=400, detail="Cannot change own role")
    if body.role not in ("user", "foodvendor", "admin"):
        raise HTTPException(status_code=400, detail="Invalid role")
    target.role = body.role
    db.commit()
    return {"success": True}


@app.delete("/admin/users/{user_id}")
def admin_delete_user(
    user_id: str,
    current_user: dict = Depends(require_admin),
    db: Session = Depends(get_db),
):
    target = db.query(AppUser).filter(AppUser.id == user_id).first()
    if not target:
        raise HTTPException(status_code=404, detail="User not found")
    if target.username == current_user["username"]:
        raise HTTPException(status_code=400, detail="Cannot delete self")
    db.delete(target)
    db.commit()
    return {"success": True}


@app.get("/admin/vendors")
def admin_list_vendors(
    current_user: dict = Depends(require_admin),
    db: Session = Depends(get_db),
):
    vendors = db.query(FoodVendor).all()
    result = []
    for v in vendors:
        v_dict = normalize_vendor_response(v)
        v_dict["street_name"] = v.street.name if v.street else None
        result.append(v_dict)
    return result


@app.get("/admin/comments")
def admin_list_comments(
    current_user: dict = Depends(require_admin),
    db: Session = Depends(get_db),
):
    comments = db.query(FoodComment).order_by(FoodComment.created_at.desc()).all()
    result = []
    for c in comments:
        c_dict = {col.name: getattr(c, col.name) for col in c.__table__.columns}
        c_dict["vendor_name"] = c.vendor.name if c.vendor else None
        result.append(c_dict)
    return result
