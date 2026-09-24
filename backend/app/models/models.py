import enum
from datetime import datetime, timezone
from sqlalchemy import (
    Column, Integer, String, Float, Boolean, Text, ForeignKey,
    DateTime, Enum, JSON, Index
)
from sqlalchemy.orm import relationship
from app.database.session import Base

def utcnow():
    return datetime.now(timezone.utc)

class UserRole(str, enum.Enum):
    ADMIN = "ADMIN"
    VENDOR = "VENDOR"
    CUSTOMER = "CUSTOMER"

class CustomerSegment(str, enum.Enum):
    VIP = "VIP"
    HIGH_VALUE = "HIGH_VALUE"
    REGULAR = "REGULAR"
    OCCASIONAL = "OCCASIONAL"
    NEW = "NEW"
    AT_RISK = "AT_RISK"

class OrderStatus(str, enum.Enum):
    PENDING = "PENDING"
    CONFIRMED = "CONFIRMED"
    PROCESSING = "PROCESSING"
    SHIPPED = "SHIPPED"
    DELIVERED = "DELIVERED"
    CANCELLED = "CANCELLED"

class PaymentStatus(str, enum.Enum):
    PENDING = "PENDING"
    PAID = "PAID"
    FAILED = "FAILED"
    REFUNDED = "REFUNDED"

class SentimentType(str, enum.Enum):
    POSITIVE = "POSITIVE"
    NEUTRAL = "NEUTRAL"
    NEGATIVE = "NEGATIVE"

class NotificationType(str, enum.Enum):
    ORDER = "ORDER"
    LOW_STOCK = "LOW_STOCK"
    FORECAST = "FORECAST"
    INSIGHT = "INSIGHT"
    SYSTEM = "SYSTEM"


# ==========================================
# USER & PROFILE MODELS
# ==========================================

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.CUSTOMER, nullable=False)
    avatar_url = Column(String(500), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)

    # Relationships
    vendor_profile = relationship("Vendor", back_populates="user", uselist=False)
    customer_profile = relationship("Customer", back_populates="user", uselist=False)
    notifications = relationship("Notification", back_populates="user", cascade="all, delete-orphan")


class Vendor(Base):
    __tablename__ = "vendors"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    store_name = Column(String(255), index=True, nullable=False)
    slug = Column(String(255), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    logo_url = Column(String(500), nullable=True)
    banner_url = Column(String(500), nullable=True)
    rating = Column(Float, default=4.5)
    total_sales = Column(Float, default=0.0)
    commission_rate = Column(Float, default=0.10) # 10% platform fee
    is_verified = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)

    # Relationships
    user = relationship("User", back_populates="vendor_profile")
    products = relationship("Product", back_populates="vendor", cascade="all, delete-orphan")
    order_items = relationship("OrderItem", back_populates="vendor")
    reviews = relationship("Review", back_populates="vendor")


class Customer(Base):
    __tablename__ = "customers"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    phone = Column(String(50), nullable=True)
    address = Column(String(500), nullable=True)
    city = Column(String(100), nullable=True)
    country = Column(String(100), default="India")
    segment = Column(Enum(CustomerSegment), default=CustomerSegment.NEW)
    total_spend = Column(Float, default=0.0)
    order_count = Column(Integer, default=0)
    last_order_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=utcnow)

    # Relationships
    user = relationship("User", back_populates="customer_profile")
    orders = relationship("Order", back_populates="customer")
    reviews = relationship("Review", back_populates="customer")


# ==========================================
# CATALOG & INVENTORY
# ==========================================

class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False)
    slug = Column(String(100), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    icon = Column(String(50), nullable=True)
    image_url = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=utcnow)

    # Relationships
    products = relationship("Product", back_populates="category")


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    vendor_id = Column(Integer, ForeignKey("vendors.id", ondelete="CASCADE"), index=True, nullable=False)
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="SET NULL"), index=True, nullable=True)
    name = Column(String(255), index=True, nullable=False)
    slug = Column(String(255), index=True, nullable=False)
    sku = Column(String(100), unique=True, index=True, nullable=False)
    price = Column(Float, nullable=False)
    compare_at_price = Column(Float, nullable=True)
    cost_price = Column(Float, default=0.0)
    description = Column(Text, nullable=True)
    ai_description = Column(Text, nullable=True)
    seo_title = Column(String(255), nullable=True)
    seo_keywords = Column(String(500), nullable=True)
    tags = Column(String(500), nullable=True) # Comma separated
    specs = Column(JSON, nullable=True) # Dict of specifications
    stock = Column(Integer, default=50, nullable=False)
    reserved_stock = Column(Integer, default=0)
    low_stock_threshold = Column(Integer, default=10)
    rating = Column(Float, default=4.5)
    review_count = Column(Integer, default=0)
    image_url = Column(String(500), nullable=True)
    images = Column(JSON, nullable=True) # List of image URLs
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)

    # Relationships
    vendor = relationship("Vendor", back_populates="products")
    category = relationship("Category", back_populates="products")
    order_items = relationship("OrderItem", back_populates="product")
    reviews = relationship("Review", back_populates="product", cascade="all, delete-orphan")
    inventory_logs = relationship("InventoryLog", back_populates="product", cascade="all, delete-orphan")

    __table_args__ = (
        Index("ix_product_vendor_category", "vendor_id", "category_id"),
    )


class InventoryLog(Base):
    __tablename__ = "inventory_logs"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), index=True, nullable=False)
    vendor_id = Column(Integer, ForeignKey("vendors.id", ondelete="CASCADE"), index=True, nullable=False)
    change_type = Column(String(50), nullable=False) # RESTOCK, ORDER, ADJUSTMENT
    quantity = Column(Integer, nullable=False) # positive or negative
    remaining_stock = Column(Integer, nullable=False)
    notes = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=utcnow)

    product = relationship("Product", back_populates="inventory_logs")


# ==========================================
# ORDERS & TRANSACTIONS
# ==========================================

class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    order_number = Column(String(50), unique=True, index=True, nullable=False)
    customer_id = Column(Integer, ForeignKey("customers.id", ondelete="SET NULL"), index=True, nullable=True)
    total_amount = Column(Float, nullable=False)
    discount_amount = Column(Float, default=0.0)
    tax_amount = Column(Float, default=0.0)
    shipping_amount = Column(Float, default=0.0)
    status = Column(Enum(OrderStatus), default=OrderStatus.PENDING, index=True)
    payment_status = Column(Enum(PaymentStatus), default=PaymentStatus.PAID)
    payment_method = Column(String(50), default="Credit Card")
    shipping_address = Column(JSON, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=utcnow, index=True)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)

    # Relationships
    customer = relationship("Customer", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    transactions = relationship("Transaction", back_populates="order")


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), index=True, nullable=False)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="SET NULL"), index=True, nullable=True)
    vendor_id = Column(Integer, ForeignKey("vendors.id", ondelete="CASCADE"), index=True, nullable=False)
    product_name = Column(String(255), nullable=False)
    price = Column(Float, nullable=False)
    cost_price = Column(Float, default=0.0)
    quantity = Column(Integer, default=1, nullable=False)
    subtotal = Column(Float, nullable=False)
    status = Column(Enum(OrderStatus), default=OrderStatus.PENDING)
    created_at = Column(DateTime, default=utcnow)

    # Relationships
    order = relationship("Order", back_populates="items")
    product = relationship("Product", back_populates="order_items")
    vendor = relationship("Vendor", back_populates="order_items")


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    transaction_ref = Column(String(100), unique=True, index=True, nullable=False)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="SET NULL"), index=True, nullable=True)
    vendor_id = Column(Integer, ForeignKey("vendors.id", ondelete="CASCADE"), index=True, nullable=False)
    amount = Column(Float, nullable=False)
    platform_fee = Column(Float, default=0.0)
    vendor_net = Column(Float, nullable=False)
    payment_method = Column(String(50), default="CARD")
    status = Column(Enum(PaymentStatus), default=PaymentStatus.PAID)
    created_at = Column(DateTime, default=utcnow, index=True)

    order = relationship("Order", back_populates="transactions")


# ==========================================
# REVIEWS & SENTIMENT
# ==========================================

class Review(Base):
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id", ondelete="CASCADE"), index=True, nullable=False)
    customer_id = Column(Integer, ForeignKey("customers.id", ondelete="CASCADE"), index=True, nullable=False)
    vendor_id = Column(Integer, ForeignKey("vendors.id", ondelete="CASCADE"), index=True, nullable=False)
    rating = Column(Integer, nullable=False) # 1 to 5
    title = Column(String(255), nullable=True)
    comment = Column(Text, nullable=False)
    sentiment = Column(Enum(SentimentType), default=SentimentType.POSITIVE)
    sentiment_score = Column(Float, default=0.8) # -1.0 to 1.0
    pros = Column(JSON, nullable=True) # list of extracted pros
    cons = Column(JSON, nullable=True) # list of extracted cons
    created_at = Column(DateTime, default=utcnow)

    product = relationship("Product", back_populates="reviews")
    customer = relationship("Customer", back_populates="reviews")
    vendor = relationship("Vendor", back_populates="reviews")


# ==========================================
# AI & ML SNAPSHOTS & NOTIFICATIONS
# ==========================================

class ForecastSnapshot(Base):
    __tablename__ = "forecast_snapshots"

    id = Column(Integer, primary_key=True, index=True)
    vendor_id = Column(Integer, ForeignKey("vendors.id", ondelete="CASCADE"), index=True, nullable=False)
    forecast_type = Column(String(50), default="SALES") # SALES, DEMAND, INVENTORY
    horizon_days = Column(Integer, default=30)
    historical_points = Column(JSON, nullable=False)
    forecast_points = Column(JSON, nullable=False)
    metrics = Column(JSON, nullable=True) # MAE, RMSE, trend direction
    created_at = Column(DateTime, default=utcnow)


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    vendor_id = Column(Integer, nullable=True)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(Enum(NotificationType), default=NotificationType.ORDER)
    is_read = Column(Boolean, default=False)
    link = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=utcnow)

    user = relationship("User", back_populates="notifications")


class AIConversation(Base):
    __tablename__ = "ai_conversations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), index=True, nullable=False)
    session_type = Column(String(50), default="SHOPPING_ASSISTANT") # SHOPPING_ASSISTANT or DATA_ANALYST
    title = Column(String(255), nullable=True)
    messages = Column(JSON, default=list) # List of {"role": "user"|"assistant", "content": str, "metadata": dict}
    created_at = Column(DateTime, default=utcnow)
    updated_at = Column(DateTime, default=utcnow, onupdate=utcnow)
