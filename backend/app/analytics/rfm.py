from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.models import Customer, Order, CustomerSegment

def calculate_customer_rfm(db: Session, vendor_id: Optional[int] = None) -> List[Dict[str, Any]]:
    """Calculates RFM metrics and classifies customers into segments."""
    now = datetime.now(timezone.utc)
    customers = db.query(Customer).all()

    segmented_list = []
    for customer in customers:
        # Get customer orders
        orders_query = db.query(Order).filter(Order.customer_id == customer.id)
        orders = orders_query.all()

        order_count = len(orders)
        total_spend = sum(o.total_amount for o in orders)

        if order_count == 0:
            recency_days = 999
            segment = CustomerSegment.NEW
        else:
            latest_order = max(orders, key=lambda o: o.created_at)
            # Ensure aware or naive matching
            order_dt = latest_order.created_at
            if order_dt.tzinfo is None:
                order_dt = order_dt.replace(tzinfo=timezone.utc)
            recency_days = (now - order_dt).days

            # RFM scoring rules
            if total_spend >= 50000 and order_count >= 5 and recency_days <= 45:
                segment = CustomerSegment.VIP
            elif total_spend >= 25000:
                segment = CustomerSegment.HIGH_VALUE
            elif recency_days > 75 and order_count >= 2:
                segment = CustomerSegment.AT_RISK
            elif order_count >= 3 and recency_days <= 60:
                segment = CustomerSegment.REGULAR
            elif recency_days <= 30 and order_count == 1:
                segment = CustomerSegment.NEW
            else:
                segment = CustomerSegment.OCCASIONAL

        # Update customer in db if needed
        customer.segment = segment
        customer.total_spend = round(total_spend, 2)
        customer.order_count = order_count

        user_name = customer.user.full_name if customer.user else f"Customer #{customer.id}"
        user_email = customer.user.email if customer.user else "N/A"

        segmented_list.append({
            "customer_id": customer.id,
            "name": user_name,
            "email": user_email,
            "city": customer.city or "Bengaluru",
            "recency_days": recency_days if recency_days != 999 else 0,
            "frequency": order_count,
            "monetary": round(total_spend, 2),
            "segment": segment.value,
            "clv": round(total_spend * 1.35, 2) # estimated lifetime value
        })

    try:
        db.commit()
    except Exception:
        db.rollback()

    return segmented_list

def get_rfm_segment_summary(db: Session, vendor_id: Optional[int] = None) -> List[Dict[str, Any]]:
    customers = calculate_customer_rfm(db, vendor_id)
    summary: Dict[str, Dict[str, Any]] = {
        "VIP": {"count": 0, "total_spend": 0.0, "color": "#8B5CF6", "description": "High spending & active brand advocates"},
        "HIGH_VALUE": {"count": 0, "total_spend": 0.0, "color": "#3B82F6", "description": "Large order size with strong purchasing power"},
        "REGULAR": {"count": 0, "total_spend": 0.0, "color": "#10B981", "description": "Consistent repeat purchasers"},
        "OCCASIONAL": {"count": 0, "total_spend": 0.0, "color": "#F59E0B", "description": "Seasonal or periodic shoppers"},
        "NEW": {"count": 0, "total_spend": 0.0, "color": "#06B6D4", "description": "Recently placed their first order"},
        "AT_RISK": {"count": 0, "total_spend": 0.0, "color": "#EF4444", "description": "Haven't purchased recently, win-back required"}
    }

    for c in customers:
        seg = c["segment"]
        if seg in summary:
            summary[seg]["count"] += 1
            summary[seg]["total_spend"] += c["monetary"]

    result = []
    for seg, data in summary.items():
        avg_spend = round(data["total_spend"] / data["count"], 2) if data["count"] > 0 else 0.0
        result.append({
            "segment": seg,
            "label": seg.replace("_", " ").title(),
            "count": data["count"],
            "total_spend": round(data["total_spend"], 2),
            "average_spend": avg_spend,
            "color": data["color"],
            "description": data["description"]
        })
    return result
