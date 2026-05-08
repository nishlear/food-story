import uuid
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from auth import require_admin, require_authenticated, require_vendor_or_admin, get_optional_user
from database import get_db
from models import FoodMenuItem, FoodVendor, FoodStreet
from schemas import FoodMenuItemCreate, FoodMenuItemResponse

router = APIRouter()


@router.get("/vendors/{vendor_id}/menu", response_model=List[FoodMenuItemResponse])
def list_menu_items(
    vendor_id: str,
    current_user: dict = Depends(get_optional_user),
    db: Session = Depends(get_db),
):
    if not db.query(FoodVendor).filter(FoodVendor.id == vendor_id).first():
        raise HTTPException(status_code=404, detail="Vendor not found")
    items = db.query(FoodMenuItem).filter(FoodMenuItem.vendor_id == vendor_id).all()
    return items


@router.post("/vendors/{vendor_id}/menu", response_model=FoodMenuItemResponse, status_code=201)
def create_menu_item(
    vendor_id: str,
    item: FoodMenuItemCreate,
    current_user: dict = Depends(require_vendor_or_admin),
    db: Session = Depends(get_db),
):
    vendor = db.query(FoodVendor).filter(FoodVendor.id == vendor_id).first()
    if not vendor:
        raise HTTPException(status_code=404, detail="Vendor not found")
    if current_user["role"] == "foodvendor" and vendor.owner_username != current_user["username"]:
        raise HTTPException(status_code=403, detail="Forbidden")
    menu_item = FoodMenuItem(
        id=str(uuid.uuid4()),
        vendor_id=vendor_id,
        name=item.name,
        price=item.price,
        description=item.description,
        image=item.image,
    )
    db.add(menu_item)
    db.commit()
    db.refresh(menu_item)
    return menu_item


@router.put("/vendors/{vendor_id}/menu/{item_id}", response_model=FoodMenuItemResponse)
def update_menu_item(
    vendor_id: str,
    item_id: str,
    item: FoodMenuItemCreate,
    current_user: dict = Depends(require_vendor_or_admin),
    db: Session = Depends(get_db),
):
    menu_item = db.query(FoodMenuItem).filter(
        FoodMenuItem.id == item_id, FoodMenuItem.vendor_id == vendor_id
    ).first()
    if not menu_item:
        raise HTTPException(status_code=404, detail="Menu item not found")
    vendor = db.query(FoodVendor).filter(FoodVendor.id == vendor_id).first()
    if current_user["role"] == "foodvendor" and vendor.owner_username != current_user["username"]:
        raise HTTPException(status_code=403, detail="Forbidden")
    menu_item.name = item.name
    menu_item.price = item.price
    menu_item.description = item.description
    menu_item.image = item.image
    db.commit()
    db.refresh(menu_item)
    return menu_item


@router.delete("/vendors/{vendor_id}/menu/{item_id}", status_code=204)
def delete_menu_item(
    vendor_id: str,
    item_id: str,
    current_user: dict = Depends(require_vendor_or_admin),
    db: Session = Depends(get_db),
):
    menu_item = db.query(FoodMenuItem).filter(
        FoodMenuItem.id == item_id, FoodMenuItem.vendor_id == vendor_id
    ).first()
    if not menu_item:
        raise HTTPException(status_code=404, detail="Menu item not found")
    vendor = db.query(FoodVendor).filter(FoodVendor.id == vendor_id).first()
    if current_user["role"] == "foodvendor" and vendor.owner_username != current_user["username"]:
        raise HTTPException(status_code=403, detail="Forbidden")
    db.delete(menu_item)
    db.commit()


@router.get("/admin/menu")
def admin_list_menu(
    current_user: dict = Depends(require_admin),
    db: Session = Depends(get_db),
):
    results = (
        db.query(FoodMenuItem, FoodVendor.name, FoodStreet.name)
        .join(FoodVendor, FoodMenuItem.vendor_id == FoodVendor.id)
        .join(FoodStreet, FoodVendor.street_id == FoodStreet.id)
        .order_by(FoodVendor.name, FoodMenuItem.name)
        .all()
    )
    vendors_map: dict = {}
    for item, vendor_name, street_name in results:
        vid = item.vendor_id
        if vid not in vendors_map:
            vendors_map[vid] = {
                "vendor_id": vid,
                "vendor_name": vendor_name,
                "street_name": street_name,
                "items": [],
            }
        vendors_map[vid]["items"].append({
            "id": item.id,
            "name": item.name,
            "price": item.price,
            "description": item.description,
            "image": item.image,
        })
    return list(vendors_map.values())
