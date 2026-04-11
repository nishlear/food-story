import json
import os
import uuid
from typing import List

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from sqlalchemy.orm import Session

from audio import EDGE_TTS_VOICES, _audio_dir, generate_vendor_audio
from auth import require_admin, require_authenticated, require_vendor_or_admin
from database import get_db
from models import FoodStreet, FoodVendor
from schemas import FoodVendorBase, FoodVendorCreate, FoodVendorResponse
from utils import (
    build_description_translations,
    normalize_description_translations,
    normalize_vendor_response,
    serialize_description_translations,
)

router = APIRouter()


@router.get("/streets/{street_id}/vendors", response_model=List[FoodVendorResponse])
def list_vendors(
    street_id: str,
    current_user: dict = Depends(require_authenticated),
    db: Session = Depends(get_db),
):
    if not db.query(FoodStreet).filter(FoodStreet.id == street_id).first():
        raise HTTPException(status_code=404, detail="Street not found")
    vendors = db.query(FoodVendor).filter(FoodVendor.street_id == street_id).all()
    return [normalize_vendor_response(v) for v in vendors]


@router.post("/streets/{street_id}/vendors", response_model=FoodVendorResponse, status_code=201)
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
    if current_user["role"] == "foodvendor":
        vendor_data["owner_username"] = current_user["username"]
    db_vendor = FoodVendor(**vendor_data, id=vendor_id, street_id=street_id)
    db.add(db_vendor)
    db.commit()
    db.refresh(db_vendor)
    translations = normalize_description_translations(db_vendor.description)
    background_tasks.add_task(generate_vendor_audio, str(vendor_id), translations)
    return normalize_vendor_response(db_vendor)


@router.get("/streets/{street_id}/vendors/{vendor_id}", response_model=FoodVendorResponse)
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


@router.put("/streets/{street_id}/vendors/{vendor_id}", response_model=FoodVendorResponse)
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


@router.delete("/streets/{street_id}/vendors/{vendor_id}")
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


@router.get("/vendors/mine", response_model=List[FoodVendorResponse])
def get_my_vendors(
    current_user: dict = Depends(require_authenticated),
    db: Session = Depends(get_db),
):
    if current_user["role"] != "foodvendor":
        raise HTTPException(status_code=403, detail="Forbidden")
    vendors = db.query(FoodVendor).filter(FoodVendor.owner_username == current_user["username"]).all()
    return [normalize_vendor_response(v) for v in vendors]


@router.get("/api/vendors/{vendor_id}/audio-status")
def get_vendor_audio_status(vendor_id: str):
    languages = [
        lang for lang in EDGE_TTS_VOICES
        if os.path.exists(os.path.join(_audio_dir, f"{vendor_id}_{lang}.mp3"))
    ]
    return {"languages": languages}
