from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.core.deps import get_optional_current_user
from app.models.models import User, Customer
from app.ml.recommender import get_personalized_recommendations, get_similar_products
from app.api.products import format_product_response

router = APIRouter(prefix="/recommendations", tags=["Recommendation Engine"])

@router.get("")
def get_recommendations(
    limit: int = Query(8, ge=1, le=20),
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    customer_id = None
    if current_user:
        customer = db.query(Customer).filter(Customer.user_id == current_user.id).first()
        if customer:
            customer_id = customer.id

    return get_personalized_recommendations(db, customer_id, limit)

@router.get("/similar/{product_id}")
def get_product_similar(
    product_id: int,
    limit: int = Query(4, ge=1, le=10),
    db: Session = Depends(get_db)
):
    similar = get_similar_products(db, product_id, limit)
    return [format_product_response(p) for p in similar]
