from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.core.deps import require_vendor, require_admin
from app.models.models import Vendor, User
from app.analytics.rfm import calculate_customer_rfm, get_rfm_segment_summary

router = APIRouter(prefix="/customers", tags=["Customer Analytics & Segmentation"])

@router.get("/segments")
def get_segments(
    db: Session = Depends(get_db),
    vendor: Vendor = Depends(require_vendor)
):
    return get_rfm_segment_summary(db, vendor.id)

@router.get("/list")
def get_customers(
    db: Session = Depends(get_db),
    vendor: Vendor = Depends(require_vendor)
):
    return calculate_customer_rfm(db, vendor.id)

@router.get("/admin/all")
def get_admin_customers(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    return calculate_customer_rfm(db, None)
