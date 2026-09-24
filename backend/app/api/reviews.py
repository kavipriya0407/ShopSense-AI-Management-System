from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.database.session import get_db
from app.core.deps import get_current_user, require_vendor
from app.models.models import Review, Product, Customer, Vendor, User
from app.schemas.schemas import ReviewCreate, ReviewResponse, SentimentVoiceResponse
from app.ml.sentiment import analyze_review_text, aggregate_customer_voice

router = APIRouter(prefix="/reviews", tags=["Reviews & Sentiment"])

@router.get("/product/{product_id}", response_model=List[ReviewResponse])
def get_product_reviews(product_id: int, db: Session = Depends(get_db)):
    reviews = db.query(Review).filter(Review.product_id == product_id).order_by(desc(Review.created_at)).all()
    output = []
    for r in reviews:
        c_name = r.customer.user.full_name if r.customer and r.customer.user else "Verified Buyer"
        output.append(ReviewResponse(
            id=r.id,
            product_id=r.product_id,
            customer_name=c_name,
            rating=r.rating,
            title=r.title,
            comment=r.comment,
            sentiment=r.sentiment,
            sentiment_score=r.sentiment_score,
            pros=r.pros,
            cons=r.cons,
            created_at=r.created_at
        ))
    return output

@router.post("", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
def submit_review(
    data: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    product = db.query(Product).filter(Product.id == data.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    customer = db.query(Customer).filter(Customer.user_id == current_user.id).first()
    if not customer:
        customer = Customer(user_id=current_user.id)
        db.add(customer)
        db.commit()
        db.refresh(customer)

    # ML Sentiment Analysis
    sentiment, score, pros, cons = analyze_review_text(data.comment, data.rating)

    review = Review(
        product_id=product.id,
        customer_id=customer.id,
        vendor_id=product.vendor_id,
        rating=data.rating,
        title=data.title or f"{sentiment.value.capitalize()} Review",
        comment=data.comment,
        sentiment=sentiment,
        sentiment_score=score,
        pros=pros,
        cons=cons
    )
    db.add(review)

    # Recalculate product rating
    all_ratings = [r.rating for r in product.reviews] + [data.rating]
    product.rating = round(sum(all_ratings) / len(all_ratings), 1)
    product.review_count = len(all_ratings)

    db.commit()
    db.refresh(review)

    return ReviewResponse(
        id=review.id,
        product_id=review.product_id,
        customer_name=current_user.full_name,
        rating=review.rating,
        title=review.title,
        comment=review.comment,
        sentiment=review.sentiment,
        sentiment_score=review.sentiment_score,
        pros=review.pros,
        cons=review.cons,
        created_at=review.created_at
    )

@router.get("/vendor/customer-voice", response_model=SentimentVoiceResponse)
def get_vendor_customer_voice(
    db: Session = Depends(get_db),
    vendor: Vendor = Depends(require_vendor)
):
    reviews = db.query(Review).filter(Review.vendor_id == vendor.id).all()
    voice = aggregate_customer_voice(reviews)
    return SentimentVoiceResponse(**voice)
