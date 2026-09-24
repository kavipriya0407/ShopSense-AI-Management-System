from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.core.deps import require_admin, require_vendor, get_current_user
from app.models.models import Vendor, User, Product

router = APIRouter(prefix="/vendors", tags=["Vendors"])

@router.get("")
def list_vendors(db: Session = Depends(get_db)):
    vendors = db.query(Vendor).all()
    results = []
    for v in vendors:
        product_count = len(v.products)
        results.append({
            "id": v.id,
            "store_name": v.store_name,
            "slug": v.slug,
            "description": v.description,
            "logo_url": v.logo_url,
            "rating": v.rating,
            "total_sales": v.total_sales,
            "commission_rate": v.commission_rate,
            "is_verified": v.is_verified,
            "product_count": product_count,
            "created_at": v.created_at
        })
    return results

@router.get("/{vendor_id}")
def get_vendor(vendor_id: int, db: Session = Depends(get_db)):
    v = db.query(Vendor).filter(Vendor.id == vendor_id).first()
    if not v:
        raise HTTPException(status_code=404, detail="Vendor not found")
    return {
        "id": v.id,
        "store_name": v.store_name,
        "slug": v.slug,
        "description": v.description,
        "logo_url": v.logo_url,
        "banner_url": v.banner_url,
        "rating": v.rating,
        "total_sales": v.total_sales,
        "commission_rate": v.commission_rate,
        "is_verified": v.is_verified,
        "product_count": len(v.products),
        "created_at": v.created_at
    }

@router.put("/{vendor_id}/verify")
def toggle_vendor_verification(
    vendor_id: int,
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    v = db.query(Vendor).filter(Vendor.id == vendor_id).first()
    if not v:
        raise HTTPException(status_code=404, detail="Vendor not found")
    v.is_verified = not v.is_verified
    db.commit()
    return {"id": v.id, "is_verified": v.is_verified}

def generate_vendor_sales_csv(db: Session, vendor: Vendor) -> Response:
    import io
    import csv
    from app.models.models import OrderItem, Order
    from sqlalchemy import desc

    output = io.StringIO()
    writer = csv.writer(output)

    # Required columns:
    # Order ID, Date, Product, Category, Quantity, Unit Price, Revenue, Customer, Order Status
    writer.writerow([
        "Order ID",
        "Date",
        "Product",
        "Category",
        "Quantity",
        "Unit Price",
        "Revenue",
        "Customer",
        "Order Status"
    ])

    items = db.query(OrderItem).filter(
        OrderItem.vendor_id == vendor.id
    ).join(Order).order_by(desc(Order.created_at)).all()

    for item in items:
        o = item.order
        if not o:
            continue
        date_str = o.created_at.strftime("%Y-%m-%d %H:%M") if o.created_at else "N/A"
        cat_name = item.product.category.name if item.product and item.product.category else "Electronics"
        customer_name = o.customer.user.full_name if o.customer and o.customer.user else "Customer"
        status_str = item.status.value if hasattr(item.status, "value") else str(item.status)

        writer.writerow([
            o.order_number,
            date_str,
            item.product_name,
            cat_name,
            item.quantity,
            f"{item.price:.2f}",
            f"{item.subtotal:.2f}",
            customer_name,
            status_str
        ])

    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={
            "Content-Disposition": 'attachment; filename="shopsense_vendor_sales.csv"'
        }
    )

@router.get("/sales/export/csv")
def export_vendors_sales(
    db: Session = Depends(get_db),
    vendor: Vendor = Depends(require_vendor)
):
    """Exports vendor's own sales records as CSV."""
    return generate_vendor_sales_csv(db, vendor)

vendor_router = APIRouter(prefix="/vendor", tags=["Vendor Operations"])

@vendor_router.get("/sales/export/csv")
def export_vendor_sales(
    db: Session = Depends(get_db),
    vendor: Vendor = Depends(require_vendor)
):
    """Exports vendor's own sales records as CSV (GET /api/vendor/sales/export/csv)."""
    return generate_vendor_sales_csv(db, vendor)
