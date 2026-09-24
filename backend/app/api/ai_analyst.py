from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.core.deps import require_vendor
from app.models.models import Vendor
from app.schemas.schemas import TextToSQLRequest, TextToSQLResponse
from app.ai.text_to_sql import execute_nl_analyst_query

router = APIRouter(prefix="/ai", tags=["AI Data Analyst"])

@router.post("/data-analyst", response_model=TextToSQLResponse)
async def analyze_data(
    data: TextToSQLRequest,
    db: Session = Depends(get_db),
    vendor: Vendor = Depends(require_vendor)
):
    result = await execute_nl_analyst_query(db, data.question, vendor.id)
    return TextToSQLResponse(**result)
