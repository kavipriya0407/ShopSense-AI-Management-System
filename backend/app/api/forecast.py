from typing import Dict, Any
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.core.deps import require_vendor
from app.models.models import Vendor
from app.schemas.schemas import ForecastResponse
from app.ml.forecasting import generate_sales_forecast

router = APIRouter(prefix="/forecast", tags=["Machine Learning Forecasting"])

@router.get("", response_model=ForecastResponse)
def get_forecast(
    horizon: int = Query(30, ge=7, le=90),
    forecast_type: str = Query("SALES", pattern="^(SALES|DEMAND)$"),
    db: Session = Depends(get_db),
    vendor: Vendor = Depends(require_vendor)
):
    forecast_data = generate_sales_forecast(
        db=db,
        vendor_id=vendor.id,
        horizon_days=horizon,
        forecast_type=forecast_type
    )
    return ForecastResponse(**forecast_data)
