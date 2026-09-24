from datetime import datetime, timedelta, timezone
from typing import Dict, List, Any, Optional
from sqlalchemy.orm import Session
from app.models.models import OrderItem, Product, Category, Vendor
from app.analytics.engine import get_vendor_overview_metrics, get_sales_by_category

def generate_business_insights(db: Session, vendor_id: Optional[int] = None) -> List[Dict[str, Any]]:
    insights = []
    
    # 1. Check overview metrics & growth
    metrics = get_vendor_overview_metrics(db, vendor_id or 1, "30d")
    growth = metrics["growth_rate"]

    if growth > 10:
        insights.append({
            "id": "growth-surge",
            "type": "POSITIVE",
            "title": f"Strong Top-Line Revenue Growth (+{growth}%)",
            "description": f"Your store revenue expanded by {growth}% compared to the prior 30-day period.",
            "data_support": f"Generated ₹{metrics['total_revenue']:,.2f} across {metrics['total_orders']} orders with an Average Order Value of ₹{metrics['average_order_value']}.",
            "action": "Consider scaling inventory buffers on fast-moving SKUs to prevent supply constraints."
        })
    elif growth < -5:
        insights.append({
            "id": "growth-dip",
            "type": "WARNING",
            "title": f"Revenue Contraction Detected ({growth}%)",
            "description": f"Revenue dipped by {abs(growth)}% versus previous period.",
            "data_support": "Lower conversion rate and reduced average order basket size.",
            "action": "Run limited-time weekend promotional flash sales and retarget cart-abandonment shoppers."
        })
    else:
        insights.append({
            "id": "growth-steady",
            "type": "INFO",
            "title": "Consistent Baseline Sales Performance",
            "description": "Store velocity remains steady with predictable repeat order patterns.",
            "data_support": f"Stable AOV at ₹{metrics['average_order_value']} with healthy customer retention.",
            "action": "Test category cross-selling bundles to elevate basket value."
        })

    # 2. Inventory & Stockout Analysis
    query = db.query(Product).filter(Product.is_active == True)
    if vendor_id:
        query = query.filter(Product.vendor_id == vendor_id)
    products = query.all()

    low_stock = [p for p in products if p.stock <= p.low_stock_threshold]
    if low_stock:
        sample_names = ", ".join([p.name for p in low_stock[:2]])
        insights.append({
            "id": "inventory-alert",
            "type": "ALERT",
            "title": f"Low Stock Risk on {len(low_stock)} Products",
            "description": f"Critical products like '{sample_names}' are near exhaustion.",
            "data_support": f"{len(low_stock)} SKUs have stock at or below their reorder threshold.",
            "action": "Initiate vendor replenishment purchase orders to avoid stockout revenue loss."
        })

    # 3. Category Opportunities
    cat_sales = get_sales_by_category(db, vendor_id)
    if cat_sales:
        top_cat = cat_sales[0]
        insights.append({
            "id": "top-category",
            "type": "OPPORTUNITY",
            "title": f"Dominant Category: {top_cat['name']}",
            "description": f"{top_cat['name']} drives the majority of your gross margin and turnover.",
            "data_support": f"Accounted for ₹{top_cat['value']:,.2f} across {top_cat['items']} purchased units.",
            "action": "Expand accessories and premium variants within this category to capture more market share."
        })

    # 4. Margin Optimization
    high_margin_items = [p for p in products if p.price > 0 and (p.price - p.cost_price) / p.price > 0.45]
    if high_margin_items:
        insights.append({
            "id": "margin-leader",
            "type": "POSITIVE",
            "title": "High Margin Catalog Advantage",
            "description": f"{len(high_margin_items)} products boast gross margins exceeding 45%.",
            "data_support": f"Items like '{high_margin_items[0].name}' contribute outsized net profit.",
            "action": "Feature these products on your homepage hero carousel and sponsored recommendations."
        })

    return insights
