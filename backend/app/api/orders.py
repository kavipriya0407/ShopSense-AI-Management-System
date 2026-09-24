import io
import csv
import uuid
from datetime import datetime, timezone
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Response, Query
from sqlalchemy.orm import Session
from sqlalchemy import desc
from app.database.session import get_db
from app.core.deps import get_current_user, require_customer, require_vendor
from app.core.websocket_manager import manager
from app.models.models import (
    Order, OrderItem, Product, Customer, Vendor, Transaction,
    Notification, NotificationType, OrderStatus, PaymentStatus, User
)
from app.schemas.schemas import OrderCreate, OrderResponse, OrderStatusUpdate

router = APIRouter(prefix="/orders", tags=["Orders"])

def format_order_response(o: Order) -> Dict[str, Any]:
    return {
        "id": o.id,
        "order_number": o.order_number,
        "customer_id": o.customer_id,
        "customer_name": o.customer.user.full_name if o.customer and o.customer.user else "Customer",
        "customer_email": o.customer.user.email if o.customer and o.customer.user else "N/A",
        "total_amount": o.total_amount,
        "discount_amount": o.discount_amount,
        "tax_amount": o.tax_amount,
        "shipping_amount": o.shipping_amount,
        "status": o.status.value,
        "payment_status": o.payment_status.value,
        "payment_method": o.payment_method,
        "shipping_address": o.shipping_address,
        "created_at": o.created_at,
        "items": [
            {
                "id": item.id,
                "product_id": item.product_id,
                "vendor_id": item.vendor_id,
                "product_name": item.product_name,
                "price": item.price,
                "quantity": item.quantity,
                "subtotal": item.subtotal,
                "status": item.status.value
            }
            for item in o.items
        ]
    }

@router.post("", response_model=Dict[str, Any], status_code=status.HTTP_201_CREATED)
async def create_order(
    data: OrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    customer = db.query(Customer).filter(Customer.user_id == current_user.id).first()
    if not customer:
        customer = Customer(
            user_id=current_user.id,
            phone="9876543210",
            address=data.shipping_address.get("address", "123 Innovation Drive"),
            city=data.shipping_address.get("city", "Bengaluru"),
            country="India"
        )
        db.add(customer)
        db.commit()
        db.refresh(customer)

    if not data.items:
        raise HTTPException(status_code=400, detail="Cart is empty")

    order_number = f"SS-{datetime.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"
    total_amount = 0.0
    order_items_to_add = []
    affected_vendors = set()

    for item_data in data.items:
        product = db.query(Product).filter(Product.id == item_data.product_id).first()
        if not product or not product.is_active:
            raise HTTPException(status_code=400, detail=f"Product #{item_data.product_id} is unavailable")
        if product.stock < item_data.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock for '{product.name}'. Requested: {item_data.quantity}, Available: {product.stock}"
            )

        # Deduct stock
        product.stock -= item_data.quantity
        subtotal = round(product.price * item_data.quantity, 2)
        total_amount += subtotal
        affected_vendors.add(product.vendor_id)

        order_item = OrderItem(
            product_id=product.id,
            vendor_id=product.vendor_id,
            product_name=product.name,
            price=product.price,
            cost_price=product.cost_price or (product.price * 0.6),
            quantity=item_data.quantity,
            subtotal=subtotal,
            status=OrderStatus.CONFIRMED
        )
        order_items_to_add.append(order_item)

    order = Order(
        order_number=order_number,
        customer_id=customer.id,
        total_amount=round(total_amount, 2),
        discount_amount=0.0,
        tax_amount=round(total_amount * 0.05, 2), # 5% tax
        shipping_amount=0.0, # free shipping
        status=OrderStatus.CONFIRMED,
        payment_status=PaymentStatus.PAID,
        payment_method=data.payment_method,
        shipping_address=data.shipping_address,
        notes=data.notes
    )
    db.add(order)
    db.commit()
    db.refresh(order)

    for oi in order_items_to_add:
        oi.order_id = order.id
        db.add(oi)

    # Customer profile stats update
    customer.order_count += 1
    customer.total_spend = round(customer.total_spend + order.total_amount, 2)
    customer.last_order_date = datetime.now(timezone.utc)

    # Create transaction records per vendor
    for v_id in affected_vendors:
        v_subtotal = sum(i.subtotal for i in order_items_to_add if i.vendor_id == v_id)
        vendor = db.query(Vendor).filter(Vendor.id == v_id).first()
        platform_fee = round(v_subtotal * (vendor.commission_rate if vendor else 0.10), 2)
        vendor_net = round(v_subtotal - platform_fee, 2)

        trans = Transaction(
            transaction_ref=f"TXN-{uuid.uuid4().hex[:10].upper()}",
            order_id=order.id,
            vendor_id=v_id,
            amount=v_subtotal,
            platform_fee=platform_fee,
            vendor_net=vendor_net,
            payment_method="CARD",
            status=PaymentStatus.PAID
        )
        db.add(trans)

        if vendor:
            vendor.total_sales = round(vendor.total_sales + v_subtotal, 2)

            # In-app notification
            notif = Notification(
                user_id=vendor.user_id,
                vendor_id=vendor.id,
                title="New Order Received!",
                message=f"Order {order_number} for ₹{v_subtotal:,.2f} placed by {current_user.full_name}.",
                type=NotificationType.ORDER,
                link=f"/vendor/orders"
            )
            db.add(notif)

            # Real-time WebSocket dispatch
            await manager.send_to_vendor(vendor.id, {
                "type": "NEW_ORDER",
                "order_number": order_number,
                "amount": v_subtotal,
                "customer": current_user.full_name,
                "message": f"New order received: #{order_number} (₹{v_subtotal:,.2f})"
            })

    db.commit()
    db.refresh(order)

    # Broadcast to admin
    await manager.broadcast({
        "type": "MARKETPLACE_ORDER",
        "order_number": order_number,
        "amount": order.total_amount,
        "customer": current_user.full_name
    })

    return format_order_response(order)

@router.get("/my-orders")
def get_my_orders(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    customer = db.query(Customer).filter(Customer.user_id == current_user.id).first()
    if not customer:
        return []
    orders = db.query(Order).filter(Order.customer_id == customer.id).order_by(desc(Order.created_at)).all()
    return [format_order_response(o) for o in orders]

@router.get("/vendor/orders")
def get_vendor_orders(
    db: Session = Depends(get_db),
    vendor: Vendor = Depends(require_vendor)
):
    # Retrieve orders containing items from this vendor
    order_items = db.query(OrderItem).filter(OrderItem.vendor_id == vendor.id).order_by(desc(OrderItem.created_at)).all()
    distinct_order_ids = sorted(list(set(item.order_id for item in order_items)), reverse=True)

    orders = db.query(Order).filter(Order.id.in_(distinct_order_ids)).order_by(desc(Order.created_at)).all()
    
    # Filter order items to only show this vendor's items
    res = []
    for o in orders:
        formatted = format_order_response(o)
        formatted["items"] = [i for i in formatted["items"] if i["vendor_id"] == vendor.id]
        res.append(formatted)
    return res

@router.put("/{order_id}/status")
async def update_order_status(
    order_id: int,
    data: OrderStatusUpdate,
    db: Session = Depends(get_db),
    vendor: Vendor = Depends(require_vendor)
):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    order.status = data.status
    for item in order.items:
        if item.vendor_id == vendor.id:
            item.status = data.status

    db.commit()

    # Notify customer if online
    if order.customer and order.customer.user_id:
        await manager.send_to_user(order.customer.user_id, {
            "type": "ORDER_STATUS_UPDATE",
            "order_number": order.order_number,
            "new_status": data.status.value,
            "message": f"Your order #{order.order_number} status is now {data.status.value}"
        })

    return {"success": True, "order_id": order.id, "new_status": data.status.value}

@router.get("/export/csv")
def export_orders_csv(
    order_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Exports customer orders as CSV.
    If order_id is provided, exports that single order (must belong to this customer).
    Otherwise exports all orders for this customer.
    Columns:
    Order ID,Order Date,Customer Name,Product Name,Vendor,Quantity,Unit Price,Subtotal,Tax,Shipping,Total,Payment Method,Order Status
    Filename: shopsense_orders.csv
    """
    customer = db.query(Customer).filter(Customer.user_id == current_user.id).first()
    if not customer and current_user.role.value != "ADMIN":
        raise HTTPException(status_code=403, detail="Customer profile required for order history")

    query = db.query(Order)
    if current_user.role.value != "ADMIN" or customer:
        if customer:
            query = query.filter(Order.customer_id == customer.id)

    if order_id:
        query = query.filter(Order.id == order_id)

    orders = query.order_by(desc(Order.created_at)).all()

    output = io.StringIO()
    writer = csv.writer(output)

    writer.writerow([
        "Order ID",
        "Order Date",
        "Customer Name",
        "Product Name",
        "Vendor",
        "Quantity",
        "Unit Price",
        "Subtotal",
        "Tax",
        "Shipping",
        "Total",
        "Payment Method",
        "Order Status"
    ])

    for o in orders:
        c_name = o.customer.user.full_name if o.customer and o.customer.user else current_user.full_name
        date_str = o.created_at.strftime("%Y-%m-%d %H:%M") if o.created_at else "N/A"
        status_str = o.status.value if hasattr(o.status, "value") else str(o.status)

        for item in o.items:
            v_name = item.vendor.store_name if item.vendor else "ShopSense Vendor"
            writer.writerow([
                o.order_number,
                date_str,
                c_name,
                item.product_name,
                v_name,
                item.quantity,
                f"{item.price:.2f}",
                f"{item.subtotal:.2f}",
                f"{o.tax_amount:.2f}",
                f"{o.shipping_amount:.2f}",
                f"{o.total_amount:.2f}",
                o.payment_method,
                status_str
            ])

    return Response(
        content=output.getvalue(),
        media_type="text/csv",
        headers={
            "Content-Disposition": 'attachment; filename="shopsense_orders.csv"'
        }
    )
