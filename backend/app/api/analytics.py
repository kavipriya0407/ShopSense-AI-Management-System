from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.core.deps import require_vendor, require_admin
from app.models.models import Vendor, User
from app.analytics.engine import (
    get_vendor_overview_metrics,
    get_revenue_trend,
    get_sales_by_category,
    get_top_products,
    get_marketplace_benchmarks,
    get_admin_overview_metrics
)
from app.schemas.schemas import VendorOverviewMetrics, BenchmarkComparison

router = APIRouter(prefix="/analytics", tags=["Analytics & BI"])

@router.get("/vendor/overview", response_model=VendorOverviewMetrics)
def vendor_overview(
    date_range: str = Query("30d", pattern="^(today|7d|30d|90d)$"),
    db: Session = Depends(get_db),
    vendor: Vendor = Depends(require_vendor)
):
    metrics = get_vendor_overview_metrics(db, vendor.id, date_range)
    return VendorOverviewMetrics(**metrics)

@router.get("/vendor/revenue-trend")
def vendor_revenue_trend(
    days: int = Query(30, ge=7, le=90),
    db: Session = Depends(get_db),
    vendor: Vendor = Depends(require_vendor)
):
    trend = get_revenue_trend(db, vendor.id, days)
    return trend

@router.get("/vendor/category-sales")
def vendor_category_sales(
    db: Session = Depends(get_db),
    vendor: Vendor = Depends(require_vendor)
):
    cat_sales = get_sales_by_category(db, vendor.id)
    return cat_sales

@router.get("/vendor/top-products")
def vendor_top_products(
    limit: int = Query(5, ge=1, le=20),
    db: Session = Depends(get_db),
    vendor: Vendor = Depends(require_vendor)
):
    top = get_top_products(db, vendor.id, limit)
    return top

@router.get("/vendor/benchmarks", response_model=List[BenchmarkComparison])
def vendor_benchmarks(
    db: Session = Depends(get_db),
    vendor: Vendor = Depends(require_vendor)
):
    benchmarks = get_marketplace_benchmarks(db, vendor.id)
    return [BenchmarkComparison(**b) for b in benchmarks]

@router.get("/admin/overview")
def admin_overview(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    return get_admin_overview_metrics(db)

@router.get("/admin/platform-trend")
def admin_platform_trend(
    days: int = Query(30, ge=7, le=90),
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    return get_revenue_trend(db, None, days)
