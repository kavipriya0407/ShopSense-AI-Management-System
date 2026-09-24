import io
import csv
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, Query, Response
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.core.deps import require_vendor, get_current_user
from app.models.models import Vendor, Product, Order, OrderItem, Customer, User
from app.analytics.engine import parse_date_range

router = APIRouter(prefix="/reports", tags=["Reporting & Exports"])

@router.get("/summary")
def get_report_summary(
    report_type: str = Query("sales", pattern="^(sales|revenue|inventory|customers|products)$"),
    date_range: str = Query("30d", pattern="^(today|7d|30d|90d)$"),
    db: Session = Depends(get_db),
    vendor: Vendor = Depends(require_vendor)
):
    start_date, _, _ = parse_date_range(date_range)
    
    if report_type == "sales" or report_type == "revenue":
        items = db.query(OrderItem).filter(
            OrderItem.vendor_id == vendor.id,
            OrderItem.created_at >= start_date
        ).order_by(OrderItem.created_at.desc()).all()
        
        rows = [
            {
                "id": i.id,
                "date": i.created_at.strftime("%Y-%m-%d %H:%M"),
                "order_number": i.order.order_number if i.order else "N/A",
                "product_name": i.product_name,
                "quantity": i.quantity,
                "price": i.price,
                "revenue": i.subtotal,
                "profit": round(i.subtotal - (i.cost_price * i.quantity), 2),
                "status": i.status.value
            }
            for i in items
        ]
        total_rev = sum(r["revenue"] for r in rows)
        total_profit = sum(r["profit"] for r in rows)
        summary = {"total_records": len(rows), "total_revenue": round(total_rev, 2), "total_profit": round(total_profit, 2)}
        return {"report_type": report_type, "date_range": date_range, "summary": summary, "data": rows}

    elif report_type == "inventory":
        products = db.query(Product).filter(Product.vendor_id == vendor.id).all()
        rows = [
            {
                "product_id": p.id,
                "sku": p.sku,
                "name": p.name,
                "category": p.category.name if p.category else "N/A",
                "stock": p.stock,
                "threshold": p.low_stock_threshold,
                "cost_price": p.cost_price,
                "retail_price": p.price,
                "inventory_value": round(p.stock * p.cost_price, 2),
                "status": "Low Stock" if p.stock <= p.low_stock_threshold else "In Stock"
            }
            for p in products
        ]
        total_stock = sum(r["stock"] for r in rows)
        total_val = sum(r["inventory_value"] for r in rows)
        summary = {"total_products": len(rows), "total_units": total_stock, "total_valuation": round(total_val, 2)}
        return {"report_type": report_type, "date_range": date_range, "summary": summary, "data": rows}

    elif report_type == "customers":
        from app.analytics.rfm import calculate_customer_rfm
        customers = calculate_customer_rfm(db, vendor.id)
        total_clv = sum(c["clv"] for c in customers)
        summary = {"total_customers": len(customers), "total_clv": round(total_clv, 2)}
        return {"report_type": report_type, "date_range": date_range, "summary": summary, "data": customers}

    else: # products
        from app.analytics.engine import get_top_products
        products = get_top_products(db, vendor.id, limit=50)
        summary = {"total_products": len(products)}
        return {"report_type": report_type, "date_range": date_range, "summary": summary, "data": products}

@router.get("/export-csv")
def export_csv_report(
    report_type: str = Query("sales", pattern="^(sales|revenue|inventory|customers)$"),
    date_range: str = Query("30d", pattern="^(today|7d|30d|90d)$"),
    db: Session = Depends(get_db),
    vendor: Vendor = Depends(require_vendor)
):
    start_date, _, _ = parse_date_range(date_range)
    output = io.StringIO()
    writer = csv.writer(output)

    if report_type in ("sales", "revenue"):
        writer.writerow(["Order Number", "Date", "Product", "Quantity", "Unit Price", "Total Revenue", "Status"])
        items = db.query(OrderItem).filter(
            OrderItem.vendor_id == vendor.id,
            OrderItem.created_at >= start_date
        ).all()
        for i in items:
            writer.writerow([
                i.order.order_number if i.order else "N/A",
                i.created_at.strftime("%Y-%m-%d %H:%M"),
                i.product_name,
                i.quantity,
                i.price,
                i.subtotal,
                i.status.value
            ])
    elif report_type == "inventory":
        writer.writerow(["SKU", "Product Name", "Current Stock", "Reorder Threshold", "Unit Cost", "Retail Price", "Inventory Value"])
        products = db.query(Product).filter(Product.vendor_id == vendor.id).all()
        for p in products:
            writer.writerow([
                p.sku,
                p.name,
                p.stock,
                p.low_stock_threshold,
                p.cost_price,
                p.price,
                round(p.stock * p.cost_price, 2)
            ])
    elif report_type == "customers":
        from app.analytics.rfm import calculate_customer_rfm
        writer.writerow(["Customer Name", "Email", "City", "Orders", "Total Spent", "Segment", "CLV"])
        customers = calculate_customer_rfm(db, vendor.id)
        for c in customers:
            writer.writerow([c["name"], c["email"], c["city"], c["frequency"], c["monetary"], c["segment"], c["clv"]])

    filename = f"ShopSense_{report_type.capitalize()}_Report_{datetime.now().strftime('%Y%m%d')}.csv"
    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )
