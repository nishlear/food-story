import os
import uuid
from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from auth import require_admin, require_authenticated
from config import MAPS_DIR
from database import get_db
from map_utils import generate_map_png
from models import FoodStreet, FoodVendor
from schemas import FoodStreetBase, FoodStreetCreate, FoodStreetResponse

router = APIRouter()

_maps_dir = MAPS_DIR


def _street_to_dict(street: FoodStreet, vendors_count: int) -> dict:
    return {
        "id": street.id,
        "name": street.name,
        "city": street.city,
        "description": street.description,
        "vendors_count": vendors_count,
        "lat_nw": street.lat_nw,
        "lon_nw": street.lon_nw,
        "lat_se": street.lat_se,
        "lon_se": street.lon_se,
        "map_zoom": street.map_zoom if street.map_zoom is not None else 19,
        "map_image_path": street.map_image_path,
        "map_updated_at": street.map_updated_at,
    }


def _try_generate_map(db_street: FoodStreet, db: Session):
    if not all([db_street.lat_nw, db_street.lon_nw, db_street.lat_se, db_street.lon_se]):
        return
    output_path = os.path.join(_maps_dir, f"{db_street.id}.png")
    zoom = db_street.map_zoom if db_street.map_zoom is not None else 19
    success = generate_map_png(
        db_street.lat_nw, db_street.lon_nw,
        db_street.lat_se, db_street.lon_se,
        zoom, output_path,
    )
    if success:
        db_street.map_image_path = f"maps/{db_street.id}.png"
        db_street.map_updated_at = datetime.utcnow().isoformat()
        db.commit()
        db.refresh(db_street)


@router.get("/streets", response_model=List[FoodStreetResponse])
def list_streets(
    current_user: dict = Depends(require_authenticated),
    db: Session = Depends(get_db),
):
    streets = db.query(FoodStreet).all()
    result = []
    for s in streets:
        v_count = db.query(FoodVendor).filter(FoodVendor.street_id == s.id).count()
        result.append(_street_to_dict(s, v_count))
    return result


@router.post("/streets", response_model=FoodStreetResponse, status_code=201)
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
    _try_generate_map(db_street, db)
    return _street_to_dict(db_street, 0)


@router.get("/streets/{street_id}", response_model=FoodStreetResponse)
def get_street(
    street_id: str,
    current_user: dict = Depends(require_authenticated),
    db: Session = Depends(get_db),
):
    db_street = db.query(FoodStreet).filter(FoodStreet.id == street_id).first()
    if not db_street:
        raise HTTPException(status_code=404, detail="Street not found")
    v_count = db.query(FoodVendor).filter(FoodVendor.street_id == street_id).count()
    return _street_to_dict(db_street, v_count)


@router.put("/streets/{street_id}", response_model=FoodStreetResponse)
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
    _try_generate_map(db_street, db)
    v_count = db.query(FoodVendor).filter(FoodVendor.street_id == street_id).count()
    return _street_to_dict(db_street, v_count)


@router.delete("/streets/{street_id}")
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
