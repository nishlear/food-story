from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from auth import require_admin
from database import get_db
from models import AppUser, FoodComment, FoodStreet, FoodVendor
from schemas import AdminUpdateUserRequest, UserResponse
from utils import normalize_vendor_response

router = APIRouter()


@router.get("/admin/stats")
def admin_stats(
    current_user: dict = Depends(require_admin),
    db: Session = Depends(get_db),
):
    streets = db.query(FoodStreet).count()
    vendors = db.query(FoodVendor).count()
    users = db.query(AppUser).count()
    comments = db.query(FoodComment).count()
    return {"streets": streets, "vendors": vendors, "users": users, "comments": comments}


@router.get("/admin/users", response_model=List[UserResponse])
def admin_list_users(
    current_user: dict = Depends(require_admin),
    db: Session = Depends(get_db),
):
    users = db.query(AppUser).all()
    return [{"id": u.id, "username": u.username, "role": u.role, "created_at": u.created_at} for u in users]


@router.put("/admin/users/{user_id}")
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


@router.delete("/admin/users/{user_id}")
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


@router.get("/admin/vendors")
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


@router.get("/admin/comments")
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
