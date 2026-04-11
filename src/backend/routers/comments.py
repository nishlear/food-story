import uuid
from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from auth import require_admin, require_authenticated
from database import get_db
from models import FoodComment, FoodVendor
from schemas import CommentCreate, CommentResponse
from utils import recalc_vendor_rating

router = APIRouter()


@router.get("/vendors/{vendor_id}/comments", response_model=List[CommentResponse])
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


@router.post("/vendors/{vendor_id}/comments", status_code=201)
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


@router.delete("/vendors/{vendor_id}/comments/{comment_id}")
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
