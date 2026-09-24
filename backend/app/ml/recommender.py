import math
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.models import Product, Order, OrderItem, Customer

def get_product_feature_text(p: Product) -> str:
    tags = p.tags or ""
    cat = p.category.name if p.category else ""
    return f"{p.name} {cat} {tags} {p.description or ''}".lower()

def compute_jaccard_similarity(text1: str, text2: str) -> float:
    words1 = set(text1.split())
    words2 = set(text2.split())
    if not words1 or not words2:
        return 0.0
    intersection = len(words1.intersection(words2))
    union = len(words1.union(words2))
    return intersection / union

def get_similar_products(db: Session, product_id: int, limit: int = 4) -> List[Product]:
    target = db.query(Product).filter(Product.id == product_id).first()
    if not target:
        return []

    target_text = get_product_feature_text(target)
    candidates = db.query(Product).filter(Product.id != product_id, Product.is_active == True).all()

    scored = []
    for cand in candidates:
        cand_text = get_product_feature_text(cand)
        sim = compute_jaccard_similarity(target_text, cand_text)
        
        # Category match boost
        if cand.category_id == target.category_id:
            sim += 0.4
        
        # Price proximity boost
        if target.price > 0:
            price_ratio = min(cand.price, target.price) / max(cand.price, target.price)
            sim += 0.2 * price_ratio

        scored.append((sim, cand))

    scored.sort(key=lambda x: x[0], reverse=True)
    return [p for _, p in scored[:limit]]

def get_personalized_recommendations(
    db: Session,
    customer_id: Optional[int] = None,
    limit: int = 8
) -> List[Dict[str, Any]]:
    # If customer is logged in, find categories they frequently order
    preferred_category_ids = set()
    if customer_id:
        customer_orders = db.query(Order).filter(Order.customer_id == customer_id).all()
        for o in customer_orders:
            for item in o.items:
                if item.product and item.product.category_id:
                    preferred_category_ids.add(item.product.category_id)

    query = db.query(Product).filter(Product.is_active == True)
    all_products = query.all()

    scored = []
    for p in all_products:
        score = float(p.rating or 4.0) * 1.5 + float(min(100, p.review_count or 0)) * 0.05
        # Affinity boost
        if p.category_id in preferred_category_ids:
            score += 5.0
        # In-stock preference
        if p.stock > 0:
            score += 2.0
        scored.append((score, p))

    scored.sort(key=lambda x: x[0], reverse=True)

    result = []
    for score, p in scored[:limit]:
        result.append({
            "id": p.id,
            "name": p.name,
            "slug": p.slug,
            "sku": p.sku,
            "price": p.price,
            "compare_at_price": p.compare_at_price,
            "rating": p.rating,
            "review_count": p.review_count,
            "image_url": p.image_url,
            "category_name": p.category.name if p.category else "General",
            "vendor_name": p.vendor.store_name if p.vendor else "ShopSense Vendor",
            "recommendation_reason": "High Customer Rating" if p.category_id not in preferred_category_ids else "Based on your browsing & order history"
        })
    return result
