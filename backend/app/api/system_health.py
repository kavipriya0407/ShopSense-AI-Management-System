import time
import os
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database.session import get_db
from app.config import settings
from app.models.models import User, Product, Order, Transaction, Vendor

router = APIRouter(prefix="/system", tags=["System Health"])

@router.get("/health")
def check_health(db: Session = Depends(get_db)):
    t0 = time.time()
    db_status = "HEALTHY"
    try:
        db.execute(text("SELECT 1")).scalar()
    except Exception as e:
        db_status = f"ERROR: {str(e)}"
    latency_ms = round((time.time() - t0) * 1000, 2)

    user_count = db.query(User).count()
    vendor_count = db.query(Vendor).count()
    product_count = db.query(Product).count()
    order_count = db.query(Order).count()
    txn_count = db.query(Transaction).count()

    ai_provider = "Google Gemini" if settings.GEMINI_API_KEY else ("OpenAI" if settings.OPENAI_API_KEY else "ShopSense Local Deterministic AI Engine")

    return {
        "status": "OPERATIONAL" if db_status == "HEALTHY" else "DEGRADED",
        "app_name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "database": {
            "status": db_status,
            "latency_ms": latency_ms,
            "dialect": "SQLite" if settings.DATABASE_URL.startswith("sqlite") else "PostgreSQL"
        },
        "ai_engine": {
            "mode": "API_CLOUD" if settings.has_ai_key else "LOCAL_OFFLINE_READY",
            "provider": ai_provider
        },
        "metrics": {
            "total_users": user_count,
            "total_vendors": vendor_count,
            "total_products": product_count,
            "total_orders": order_count,
            "total_transactions": txn_count
        }
    }
