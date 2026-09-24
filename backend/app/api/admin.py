import io
import csv
from datetime import datetime
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.database.session import get_db
from app.core.deps import require_admin
from app.models.models import User, Vendor, Customer, Product, Order, OrderItem, Category
from app.analytics.engine import get_admin_overview_metrics, get_revenue_trend
from app.analytics.rfm import calculate_customer_rfm

router = APIRouter(prefix="/admin", tags=["Admin Portal Management"])

@router.get("/dashboard")
def get_admin_dashboard(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Retrieve macro platform metrics for authorized administrator."""
    return get_admin_overview_metrics(db)

@router.get("/users")
def get_all_users(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Retrieve all platform registered users."""
    users = db.query(User).order_by(desc(User.created_at)).all()
    return [
        {
            "id": u.id,
            "email": u.email,
            "full_name": u.full_name,
            "role": u.role.value if hasattr(u.role, "value") else str(u.role),
            "is_active": u.is_active,
            "created_at": u.created_at
        }
        for u in users
    ]

@router.get("/vendors")
def get_all_vendors(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Retrieve all merchant vendors and audit details."""
    vendors = db.query(Vendor).all()
    return [
        {
            "id": v.id,
            "store_name": v.store_name,
            "slug": v.slug,
            "rating": v.rating,
            "total_sales": v.total_sales,
            "commission_rate": v.commission_rate,
            "is_verified": v.is_verified,
            "product_count": len(v.products),
            "created_at": v.created_at
        }
        for v in vendors
    ]

@router.get("/customers")
def get_all_customers(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Retrieve customer RFM intelligence across the entire marketplace."""
    return calculate_customer_rfm(db, None)

@router.get("/products")
def get_all_products(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Retrieve all catalog merchandise across all vendors."""
    products = db.query(Product).order_by(desc(Product.created_at)).limit(100).all()
    return [
        {
            "id": p.id,
            "name": p.name,
            "sku": p.sku,
            "price": p.price,
            "stock": p.stock,
            "vendor_name": p.vendor.store_name if p.vendor else "N/A",
            "category_name": p.category.name if p.category else "N/A",
            "is_active": p.is_active
        }
        for p in products
    ]

@router.get("/orders")
def get_all_orders(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Retrieve all marketplace transactions and orders."""
    orders = db.query(Order).order_by(desc(Order.created_at)).limit(100).all()
    res = []
    for o in orders:
        res.append({
            "id": o.id,
            "order_number": o.order_number,
            "customer_name": o.customer.user.full_name if o.customer and o.customer.user else "Customer",
            "total_amount": o.total_amount,
            "status": o.status.value if hasattr(o.status, "value") else str(o.status),
            "payment_status": o.payment_status.value if hasattr(o.payment_status, "value") else str(o.payment_status),
            "payment_method": o.payment_method,
            "created_at": o.created_at,
            "items_count": len(o.items)
        })
    return res

@router.get("/analytics")
def get_admin_analytics(
    days: int = Query(30, ge=7, le=90),
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Retrieve platform revenue and transaction trajectory."""
    overview = get_admin_overview_metrics(db)
    trend = get_revenue_trend(db, None, days)
    return {"overview": overview, "trend": trend}

@router.get("/reports")
def get_admin_reports(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """Retrieve executive report summary."""
    overview = get_admin_overview_metrics(db)
    return {"report": "Marketplace Overview", "timestamp": datetime.utcnow(), "data": overview}

@router.get("/orders/export/csv")
def export_marketplace_csv(
    db: Session = Depends(get_db),
    admin: User = Depends(require_admin)
):
    """
    Exports comprehensive marketplace report as CSV.
    Columns required:
    Order ID, Date, Vendor, Customer, Product, Category, Quantity, Revenue, Payment Method, Order Status
    Filename: shopsense_marketplace_report.csv
    """
    output = io.StringIO()
    writer = csv.writer(output)

    # Header
    writer.writerow([
        "Order ID",
        "Date",
        "Vendor",
        "Customer",
        "Product",
        "Category",
        "Quantity",
        "Revenue",
        "Payment Method",
        "Order Status"
    ])

    # Fetch order items with related orders
    order_items = db.query(OrderItem).join(Order).order_by(desc(Order.created_at)).all()

    for item in order_items:
        o = item.order
        if not o:
            continue
        vendor_name = item.vendor.store_name if item.vendor else "ShopSense Vendor"
        customer_name = o.customer.user.full_name if o.customer and o.customer.user else "Customer"
        cat_name = item.product.category.name if item.product and item.product.category else "Electronics"
        date_str = o.created_at.strftime("%Y-%m-%d %H:%M") if o.created_at else "N/A"
        status_str = o.status.value if hasattr(o.status, "value") else str(o.status)

        writer.writerow([
            o.order_number,
            date_str,
            vendor_name,
            customer_name,
            item.product_name,
            cat_name,
            item.quantity,
            f"{item.subtotal:.2f}",
            o.payment_method,
            status_str
        ])

    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={
            "Content-Disposition": 'attachment; filename="shopsense_marketplace_report.csv"'
        }
    )
