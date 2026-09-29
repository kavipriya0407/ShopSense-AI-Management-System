import math
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc, asc
from app.database.session import get_db
from app.core.deps import get_current_user, require_vendor, get_optional_current_user
from app.models.models import Product, Category, Vendor, InventoryLog, User
from app.schemas.schemas import (
    ProductCreate, ProductUpdate, ProductResponse, ProductListResponse
)

router = APIRouter(prefix="/products", tags=["Products"])

def format_product_response(p: Product) -> ProductResponse:
    return ProductResponse(
        id=p.id,
        vendor_id=p.vendor_id,
        category_id=p.category_id,
        name=p.name,
        slug=p.slug,
        sku=p.sku,
        price=p.price,
        compare_at_price=p.compare_at_price,
        cost_price=p.cost_price,
        description=p.description,
        ai_description=p.ai_description,
        seo_title=p.seo_title,
        seo_keywords=p.seo_keywords,
        tags=p.tags,
        specs=p.specs,
        stock=p.stock,
        reserved_stock=p.reserved_stock or 0,
        low_stock_threshold=p.low_stock_threshold,
        rating=p.rating,
        review_count=p.review_count,
        image_url=p.image_url,
        images=p.images,
        is_active=p.is_active,
        vendor_name=p.vendor.store_name if p.vendor else "ShopSense Vendor",
        category_name=p.category.name if p.category else "Uncategorized",
        created_at=p.created_at
    )

@router.get("", response_model=ProductListResponse)
def list_products(
    db: Session = Depends(get_db),
    search: Optional[str] = None,
    category_id: Optional[int] = None,
    vendor_id: Optional[int] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    min_rating: Optional[float] = None,
    in_stock_only: bool = False,
    sort_by: str = Query("featured", pattern="^(featured|price_low|price_high|rating|newest)$"),
    page: int = Query(1, ge=1),
    page_size: int = Query(12, ge=1, le=100)
):
    query = db.query(Product).filter(Product.is_active == True)
    query = query.outerjoin(Category, Product.category_id == Category.id)
    query = query.outerjoin(Vendor, Product.vendor_id == Vendor.id)

    if search and search.strip():
        raw = search.strip()
        variations = {raw}
        # Stemming and singular / plural variants (e.g. Laptops -> Laptop, Headphones -> Headphone)
        if raw.lower().endswith('ies') and len(raw) > 4:
            variations.add(raw[:-3] + 'y')
        elif raw.lower().endswith('es') and len(raw) > 4:
            variations.add(raw[:-2])
        elif raw.lower().endswith('s') and len(raw) > 3:
            variations.add(raw[:-1])
        else:
            variations.add(raw + 's')

        words = [w for w in raw.split() if len(w) > 2]
        all_terms = variations.union(words)

        conditions = []
        for term in all_terms:
            pattern = f"%{term}%"
            conditions.append(Product.name.ilike(pattern))
            conditions.append(Product.description.ilike(pattern))
            conditions.append(Product.tags.ilike(pattern))
            conditions.append(Product.sku.ilike(pattern))
            conditions.append(Product.ai_description.ilike(pattern))
            conditions.append(Product.seo_keywords.ilike(pattern))
            conditions.append(Category.name.ilike(pattern))
            conditions.append(Category.description.ilike(pattern))
            conditions.append(Category.slug.ilike(pattern))
            conditions.append(Vendor.store_name.ilike(pattern))

        query = query.filter(or_(*conditions))
    if category_id:
        query = query.filter(Product.category_id == category_id)
    if vendor_id:
        query = query.filter(Product.vendor_id == vendor_id)
    if min_price is not None:
        query = query.filter(Product.price >= min_price)
    if max_price is not None:
        query = query.filter(Product.price <= max_price)
    if min_rating is not None:
        query = query.filter(Product.rating >= min_rating)
    if in_stock_only:
        query = query.filter(Product.stock > 0)

    # Sorting
    if sort_by == "price_low":
        query = query.order_by(asc(Product.price))
    elif sort_by == "price_high":
        query = query.order_by(desc(Product.price))
    elif sort_by == "rating":
        query = query.order_by(desc(Product.rating), desc(Product.review_count))
    elif sort_by == "newest":
        query = query.order_by(desc(Product.created_at))
    else: # featured
        query = query.order_by(desc(Product.rating), desc(Product.stock))

    total = query.count()
    total_pages = math.ceil(total / page_size) if total > 0 else 1
    items = query.offset((page - 1) * page_size).limit(page_size).all()

    return {
        "items": [format_product_response(p) for p in items],
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages
    }

@router.get("/vendor/my-products", response_model=List[ProductResponse])
def get_vendor_products(
    db: Session = Depends(get_db),
    vendor: Vendor = Depends(require_vendor)
):
    products = db.query(Product).filter(Product.vendor_id == vendor.id).order_by(desc(Product.created_at)).all()
    return [format_product_response(p) for p in products]

@router.get("/{product_id}", response_model=ProductResponse)
def get_product(product_id: int, db: Session = Depends(get_db)):
    p = db.query(Product).filter(Product.id == product_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Product not found")
    return format_product_response(p)

@router.post("", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(
    data: ProductCreate,
    db: Session = Depends(get_db),
    vendor: Vendor = Depends(require_vendor)
):
    existing_sku = db.query(Product).filter(Product.sku == data.sku).first()
    if existing_sku:
        raise HTTPException(status_code=400, detail="A product with this SKU already exists")

    slug = data.name.lower().replace(" ", "-").replace("/", "-")[:80] + f"-{data.sku.lower()}"
    product = Product(
        vendor_id=vendor.id,
        category_id=data.category_id,
        name=data.name,
        slug=slug,
        sku=data.sku,
        price=data.price,
        compare_at_price=data.compare_at_price,
        cost_price=data.cost_price or (data.price * 0.6),
        description=data.description,
        ai_description=data.ai_description,
        seo_title=data.seo_title,
        seo_keywords=data.seo_keywords,
        tags=data.tags,
        specs=data.specs,
        stock=data.stock,
        low_stock_threshold=data.low_stock_threshold,
        image_url=data.image_url or "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80",
        images=data.images or [],
        is_active=data.is_active
    )
    db.add(product)
    db.commit()
    db.refresh(product)

    # Initial inventory log
    log = InventoryLog(
        product_id=product.id,
        vendor_id=vendor.id,
        change_type="INITIAL",
        quantity=product.stock,
        remaining_stock=product.stock,
        notes="Product initial listing"
    )
    db.add(log)
    db.commit()

    return format_product_response(product)

@router.put("/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: int,
    data: ProductUpdate,
    db: Session = Depends(get_db),
    vendor: Vendor = Depends(require_vendor)
):
    product = db.query(Product).filter(Product.id == product_id, Product.vendor_id == vendor.id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found or unauthorized")

    update_dict = data.dict(exclude_unset=True)
    for field, val in update_dict.items():
        setattr(product, field, val)

    db.commit()
    db.refresh(product)
    return format_product_response(product)

@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(
    product_id: int,
    db: Session = Depends(get_db),
    vendor: Vendor = Depends(require_vendor)
):
    product = db.query(Product).filter(Product.id == product_id, Product.vendor_id == vendor.id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found or unauthorized")

    db.delete(product)
    db.commit()
    return None
