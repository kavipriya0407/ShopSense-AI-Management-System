from typing import List, Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.core.deps import require_vendor
from app.models.models import Vendor
from app.schemas.schemas import AIProductGenerateRequest, AIProductGenerateResponse
from app.ai.generator import generate_product_ai_metadata
from app.ai.insights_generator import generate_business_insights

router = APIRouter(prefix="/ai", tags=["AI Generation & Insights"])

@router.post("/generate-product", response_model=AIProductGenerateResponse)
async def generate_product(data: AIProductGenerateRequest):
    result = await generate_product_ai_metadata(
        name=data.name,
        category=data.category,
        rough_specs=data.rough_specs,
        tone=data.tone
    )
    return AIProductGenerateResponse(**result)

@router.get("/insights")
def get_insights(
    db: Session = Depends(get_db),
    vendor: Vendor = Depends(require_vendor)
):
    insights = generate_business_insights(db, vendor.id)
    return insights
