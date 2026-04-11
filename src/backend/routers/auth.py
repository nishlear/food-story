import base64
import uuid
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from auth import require_authenticated
from database import get_db
from models import AppUser
from schemas import ChangePasswordRequest, LoginRequest, RegisterRequest

router = APIRouter()


@router.post("/auth/login")
def login(body: LoginRequest, db: Session = Depends(get_db)):
    entry = db.query(AppUser).filter(AppUser.username == body.username).first()
    if not entry or entry.password != body.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = base64.b64encode(f"{entry.role}:{body.username}".encode()).decode()
    return {"username": body.username, "role": entry.role, "token": token}


@router.post("/auth/register", status_code=201)
def register(body: RegisterRequest, db: Session = Depends(get_db)):
    if not body.username or not body.password:
        raise HTTPException(status_code=400, detail="Username and password required")
    existing = db.query(AppUser).filter(AppUser.username == body.username).first()
    if existing:
        raise HTTPException(status_code=409, detail="Username already taken")
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


@router.put("/auth/change-password")
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
