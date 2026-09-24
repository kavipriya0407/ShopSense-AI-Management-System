from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import desc, func
from app.database.session import get_db
from app.core.deps import require_vendor
from app.models.models import Product, Vendor, InventoryLog, OrderItem
from app.schemas.schemas import StockUpdateRequest, InventoryItemResponse

router = APIRouter(prefix="/inventory", tags=["Inventory"])

@router.get("", response_model=List[InventoryItemResponse])
def get_inventory(
    db: Session = Depends(get_db),
    vendor: Vendor = Depends(require_vendor)
):
    products = db.query(Product).filter(Product.vendor_id == vendor.id).all()
    
    # Calculate sold quantities for turnover rate calculation
    sold_counts = db.query(
        OrderItem.product_id,
        func.sum(OrderItem.quantity).label("sold_qty")
    ).filter(OrderItem.vendor_id == vendor.id)\
     .group_by(OrderItem.product_id).all()
    sold_map = {row[0]: int(row[1] or 0) for row in sold_counts}

    result = []
    for p in products:
        reserved = p.reserved_stock or 0
        avail = max(0, p.stock - reserved)
        is_low = p.stock <= p.low_stock_threshold
        sold = sold_map.get(p.id, 0)
        # Turnover rate = Sold Units / (Average Inventory or current stock)
        turnover = round(sold / max(1, p.stock), 2)
        
        if p.stock <= 0:
            status_str = "Out of Stock"
        elif is_low:
            status_str = "Low Stock"
        else:
            status_str = "In Stock"

        result.append(InventoryItemResponse(
            product_id=p.id,
            product_name=p.name,
            sku=p.sku,
            category_name=p.category.name if p.category else "General",
            current_stock=p.stock,
            reserved_stock=reserved,
            available_stock=avail,
            low_stock_threshold=p.low_stock_threshold,
            is_low_stock=is_low,
            stock_value=round(p.stock * (p.cost_price or (p.price * 0.6)), 2),
            unit_cost=round(p.cost_price or (p.price * 0.6), 2),
            price=p.price,
            turnover_rate=turnover,
            status=status_str
        ))
    return result

@router.get("/alerts")
def get_low_stock_alerts(
    db: Session = Depends(get_db),
    vendor: Vendor = Depends(require_vendor)
):
    low_stock_products = db.query(Product).filter(
        Product.vendor_id == vendor.id,
        Product.stock <= Product.low_stock_threshold
    ).all()

    alerts = []
    for p in low_stock_products:
        alerts.append({
            "product_id": p.id,
            "product_name": p.name,
            "sku": p.sku,
            "stock": p.stock,
            "threshold": p.low_stock_threshold,
            "message": f"'{p.name}' has only {p.stock} units remaining (threshold: {p.low_stock_threshold}).",
            "urgency": "HIGH" if p.stock <= 3 else "MEDIUM"
        })
    return alerts

@router.post("/update-stock")
def update_stock(
    data: StockUpdateRequest,
    db: Session = Depends(get_db),
    vendor: Vendor = Depends(require_vendor)
):
    product = db.query(Product).filter(Product.id == data.product_id, Product.vendor_id == vendor.id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found or unauthorized")

    new_stock = max(0, product.stock + data.quantity_change)
    product.stock = new_stock
    db.commit()

    # Create log
    log = InventoryLog(
        product_id=product.id,
        vendor_id=vendor.id,
        change_type=data.change_type,
        quantity=data.quantity_change,
        remaining_stock=new_stock,
        notes=data.notes or f"Manual stock update ({'+' if data.quantity_change > 0 else ''}{data.quantity_change})"
    )
    db.add(log)
    db.commit()

    return {
        "success": True,
        "product_id": product.id,
        "new_stock": new_stock,
        "message": f"Stock for {product.name} updated to {new_stock} units."
    }
