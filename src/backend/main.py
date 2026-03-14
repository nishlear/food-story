import base64
import json
import os
import uuid
from typing import List, Optional

from fastapi import Depends, FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import Column, Float, ForeignKey, Integer, String, Text, create_engine
from sqlalchemy.orm import Session, declarative_base, relationship, sessionmaker

# ==============================================================================
# Database Setup (SQLAlchemy)
# ==============================================================================

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./foodguide.db")

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

    street = relationship("FoodStreet", back_populates="vendors")


Base.metadata.create_all(bind=engine)

# ==============================================================================
# Pydantic Schemas
# ==============================================================================


class FoodVendorBase(BaseModel):
    name: str
    description: Optional[str] = None
    rating: float = 0.0
    reviews: int = 0
    x: float
    y: float
    type: str
    address: Optional[str] = None
    images: Optional[List[str]] = []


class FoodVendorCreate(FoodVendorBase):
    id: Optional[str] = None


class FoodVendorResponse(FoodVendorBase):
    id: str
    street_id: str

    class Config:
        from_attributes = True


class FoodStreetBase(BaseModel):
    name: str
    city: str
    description: Optional[str] = None


class FoodStreetCreate(FoodStreetBase):
    id: Optional[str] = None


class FoodStreetResponse(FoodStreetBase):
    id: str
    vendors_count: int = 0

    class Config:
        from_attributes = True


class LoginRequest(BaseModel):
    username: str
    password: str


# ==============================================================================
# Auth
# ==============================================================================

USERS: dict = {
    "user":       {"password": "123123", "role": "user"},
    "foodvendor": {"password": "123123", "role": "foodvendor"},
    "admin":      {"password": "123123", "role": "admin"},
}


def get_role_from_token(token: str) -> Optional[str]:
    try:
        decoded = base64.b64decode(token).decode("utf-8")
        role = decoded.split(":")[0]
        if role in ("user", "foodvendor", "admin"):
            return role
        return None
    except Exception:
        return None


def require_authenticated(x_role_token: Optional[str] = Header(default=None)) -> str:
    if not x_role_token:
        raise HTTPException(status_code=401, detail="Unauthorized")
    role = get_role_from_token(x_role_token)
    if not role:
        raise HTTPException(status_code=401, detail="Unauthorized")
    return role


def require_admin(x_role_token: Optional[str] = Header(default=None)) -> str:
    role = require_authenticated(x_role_token)
    if role != "admin":
        raise HTTPException(status_code=403, detail="Forbidden")
    return role


def require_vendor_or_admin(x_role_token: Optional[str] = Header(default=None)) -> str:
    role = require_authenticated(x_role_token)
    if role not in ("admin", "foodvendor"):
        raise HTTPException(status_code=403, detail="Forbidden")
    return role


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


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ==============================================================================
# Auth Endpoint
# ==============================================================================


@app.post("/auth/login")
def login(body: LoginRequest):
    entry = USERS.get(body.username)
    if not entry or entry["password"] != body.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = base64.b64encode(f"{entry['role']}:{body.username}".encode()).decode()
    return {"username": body.username, "role": entry["role"], "token": token}


# ==============================================================================
# API Endpoints (CRUD)
# ==============================================================================


@app.get("/streets", response_model=List[FoodStreetResponse], dependencies=[Depends(require_authenticated)])
def list_streets(db: Session = Depends(get_db)):
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
            }
        )
    return result


@app.post("/streets", response_model=FoodStreetResponse, status_code=201, dependencies=[Depends(require_admin)])
def create_street(street: FoodStreetCreate, db: Session = Depends(get_db)):
    street_id = street.id or str(uuid.uuid4())
    db_street = FoodStreet(
        id=street_id,
        name=street.name,
        city=street.city,
        description=street.description,
    )
    db.add(db_street)
    db.commit()
    db.refresh(db_street)
    return {**db_street.__dict__, "vendors_count": 0}


@app.get("/streets/{street_id}", response_model=FoodStreetResponse, dependencies=[Depends(require_authenticated)])
def get_street(street_id: str, db: Session = Depends(get_db)):
    db_street = db.query(FoodStreet).filter(FoodStreet.id == street_id).first()
    if not db_street:
        raise HTTPException(status_code=404, detail="Street not found")
    v_count = db.query(FoodVendor).filter(FoodVendor.street_id == street_id).count()
    return {**db_street.__dict__, "vendors_count": v_count}


@app.put("/streets/{street_id}", response_model=FoodStreetResponse, dependencies=[Depends(require_admin)])
def update_street(
    street_id: str, street: FoodStreetBase, db: Session = Depends(get_db)
):
    db_street = db.query(FoodStreet).filter(FoodStreet.id == street_id).first()
    if not db_street:
        raise HTTPException(status_code=404, detail="Street not found")
    for key, value in street.model_dump().items():
        setattr(db_street, key, value)
    db.commit()
    db.refresh(db_street)
    v_count = db.query(FoodVendor).filter(FoodVendor.street_id == street_id).count()
    return {**db_street.__dict__, "vendors_count": v_count}


@app.delete("/streets/{street_id}", dependencies=[Depends(require_admin)])
def delete_street(street_id: str, db: Session = Depends(get_db)):
    db_street = db.query(FoodStreet).filter(FoodStreet.id == street_id).first()
    if not db_street:
        raise HTTPException(status_code=404, detail="Street not found")
    db.delete(db_street)
    db.commit()
    return {"success": True, "message": "Street and associated vendors deleted"}


@app.get(
    "/streets/{street_id}/vendors", response_model=List[FoodVendorResponse], dependencies=[Depends(require_authenticated)]
)
def list_vendors(street_id: str, db: Session = Depends(get_db)):
    if not db.query(FoodStreet).filter(FoodStreet.id == street_id).first():
        raise HTTPException(status_code=404, detail="Street not found")
    vendors = db.query(FoodVendor).filter(FoodVendor.street_id == street_id).all()
    result = []
    for v in vendors:
        v_dict = {c.name: getattr(v, c.name) for c in v.__table__.columns}
        v_dict["images"] = json.loads(v.images) if v.images else []
        result.append(v_dict)
    return result


@app.post(
    "/streets/{street_id}/vendors",
    response_model=FoodVendorResponse,
    status_code=201,
    dependencies=[Depends(require_vendor_or_admin)],
)
def add_vendor(
    street_id: str, vendor: FoodVendorCreate, db: Session = Depends(get_db)
):
    if not db.query(FoodStreet).filter(FoodStreet.id == street_id).first():
        raise HTTPException(status_code=404, detail="Street not found")
    vendor_id = vendor.id or str(uuid.uuid4())
    vendor_data = vendor.model_dump(exclude={"id"})
    vendor_data["images"] = json.dumps(vendor_data.get("images") or [])
    db_vendor = FoodVendor(**vendor_data, id=vendor_id, street_id=street_id)
    db.add(db_vendor)
    db.commit()
    db.refresh(db_vendor)
    result = {c.name: getattr(db_vendor, c.name) for c in db_vendor.__table__.columns}
    result["images"] = json.loads(db_vendor.images) if db_vendor.images else []
    return result


@app.get(
    "/streets/{street_id}/vendors/{vendor_id}", response_model=FoodVendorResponse, dependencies=[Depends(require_authenticated)]
)
def get_vendor(street_id: str, vendor_id: str, db: Session = Depends(get_db)):
    v = (
        db.query(FoodVendor)
        .filter(FoodVendor.id == vendor_id, FoodVendor.street_id == street_id)
        .first()
    )
    if not v:
        raise HTTPException(status_code=404, detail="Vendor not found")
    result = {c.name: getattr(v, c.name) for c in v.__table__.columns}
    result["images"] = json.loads(v.images) if v.images else []
    return result


@app.put(
    "/streets/{street_id}/vendors/{vendor_id}", response_model=FoodVendorResponse, dependencies=[Depends(require_admin)]
)
def update_vendor(
    street_id: str,
    vendor_id: str,
    vendor: FoodVendorBase,
    db: Session = Depends(get_db),
):
    db_vendor = (
        db.query(FoodVendor)
        .filter(FoodVendor.id == vendor_id, FoodVendor.street_id == street_id)
        .first()
    )
    if not db_vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    data = vendor.model_dump()
    data["images"] = json.dumps(data.get("images") or [])
    for key, value in data.items():
        setattr(db_vendor, key, value)
    db.commit()
    db.refresh(db_vendor)
    result = {c.name: getattr(db_vendor, c.name) for c in db_vendor.__table__.columns}
    result["images"] = json.loads(db_vendor.images) if db_vendor.images else []
    return result


@app.delete("/streets/{street_id}/vendors/{vendor_id}", dependencies=[Depends(require_admin)])
def delete_vendor(street_id: str, vendor_id: str, db: Session = Depends(get_db)):
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
