from datetime import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, EmailStr, Field
from app.models.models import UserRole, CustomerSegment, OrderStatus, PaymentStatus, SentimentType, NotificationType


# ==========================================
# AUTH SCHEMAS
# ==========================================

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    role: UserRole = UserRole.CUSTOMER
    store_name: Optional[str] = None # required if role is VENDOR

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    role: UserRole
    avatar_url: Optional[str] = None
    is_active: bool
    vendor_id: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True


# ==========================================
# CATEGORY SCHEMAS
# ==========================================

class CategoryBase(BaseModel):
    name: str
    slug: str
    description: Optional[str] = None
    icon: Optional[str] = None
    image_url: Optional[str] = None

class CategoryCreate(CategoryBase):
    pass

class CategoryResponse(CategoryBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


# ==========================================
# PRODUCT SCHEMAS
# ==========================================

class ProductBase(BaseModel):
    name: str
    category_id: Optional[int] = None
    sku: str
    price: float
    compare_at_price: Optional[float] = None
    cost_price: Optional[float] = 0.0
    description: Optional[str] = None
    ai_description: Optional[str] = None
    seo_title: Optional[str] = None
    seo_keywords: Optional[str] = None
    tags: Optional[str] = None
    specs: Optional[Dict[str, Any]] = None
    stock: int = 50
    low_stock_threshold: int = 10
    image_url: Optional[str] = None
    images: Optional[List[str]] = None
    is_active: bool = True

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = None
    category_id: Optional[int] = None
    sku: Optional[str] = None
    price: Optional[float] = None
    compare_at_price: Optional[float] = None
    cost_price: Optional[float] = None
    description: Optional[str] = None
    ai_description: Optional[str] = None
    seo_title: Optional[str] = None
    seo_keywords: Optional[str] = None
    tags: Optional[str] = None
    specs: Optional[Dict[str, Any]] = None
    stock: Optional[int] = None
    low_stock_threshold: Optional[int] = None
    image_url: Optional[str] = None
    images: Optional[List[str]] = None
    is_active: Optional[bool] = None

class ProductResponse(ProductBase):
    id: int
    vendor_id: int
    slug: str
    reserved_stock: int
    rating: float
    review_count: int
    vendor_name: Optional[str] = None
    category_name: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class ProductListResponse(BaseModel):
    items: List[ProductResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


# ==========================================
# INVENTORY SCHEMAS
# ==========================================

class StockUpdateRequest(BaseModel):
    product_id: int
    quantity_change: int
    change_type: str = "RESTOCK"
    notes: Optional[str] = None

class InventoryItemResponse(BaseModel):
    product_id: int
    product_name: str
    sku: str
    category_name: Optional[str] = None
    current_stock: int
    reserved_stock: int
    available_stock: int
    low_stock_threshold: int
    is_low_stock: bool
    stock_value: float
    unit_cost: float
    price: float
    turnover_rate: float
    status: str # In Stock, Low Stock, Out of Stock


# ==========================================
# ORDER SCHEMAS
# ==========================================

class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int

class OrderCreate(BaseModel):
    items: List[OrderItemCreate]
    shipping_address: Dict[str, Any]
    payment_method: str = "Credit Card"
    notes: Optional[str] = None

class OrderItemResponse(BaseModel):
    id: int
    product_id: Optional[int]
    vendor_id: int
    product_name: str
    price: float
    quantity: int
    subtotal: float
    status: OrderStatus

    class Config:
        from_attributes = True

class OrderResponse(BaseModel):
    id: int
    order_number: str
    customer_id: Optional[int]
    total_amount: float
    discount_amount: float
    tax_amount: float
    shipping_amount: float
    status: OrderStatus
    payment_status: PaymentStatus
    payment_method: str
    shipping_address: Optional[Dict[str, Any]]
    created_at: datetime
    items: List[OrderItemResponse] = []

    class Config:
        from_attributes = True

class OrderStatusUpdate(BaseModel):
    status: OrderStatus


# ==========================================
# REVIEW & SENTIMENT SCHEMAS
# ==========================================

class ReviewCreate(BaseModel):
    product_id: int
    rating: int = Field(ge=1, le=5)
    title: Optional[str] = None
    comment: str

class ReviewResponse(BaseModel):
    id: int
    product_id: int
    customer_name: Optional[str] = None
    rating: int
    title: Optional[str] = None
    comment: str
    sentiment: SentimentType
    sentiment_score: float
    pros: Optional[List[str]] = None
    cons: Optional[List[str]] = None
    created_at: datetime

    class Config:
        from_attributes = True

class SentimentVoiceResponse(BaseModel):
    positive_percentage: float
    neutral_percentage: float
    negative_percentage: float
    average_score: float
    total_reviews: int
    common_positives: List[str]
    common_complaints: List[str]


# ==========================================
# ANALYTICS & BI SCHEMAS
# ==========================================

class MetricCard(BaseModel):
    title: str
    value: Any
    change_percentage: float
    trend: str # up, down, neutral
    subtitle: Optional[str] = None

class VendorOverviewMetrics(BaseModel):
    total_revenue: float
    total_orders: int
    total_products: int
    total_customers: int
    average_order_value: float
    conversion_rate: float
    low_stock_items: int
    growth_rate: float

class ChartDataPoint(BaseModel):
    name: str
    value: float
    secondary_value: Optional[float] = None
    date: Optional[str] = None

class BenchmarkComparison(BaseModel):
    metric: str
    vendor_value: float
    marketplace_avg: float
    diff_percentage: float
    status: str # above, below, equal
    insight: str


# ==========================================
# FORECASTING SCHEMAS
# ==========================================

class ForecastPoint(BaseModel):
    date: str
    actual: Optional[float] = None
    predicted: float
    lower_bound: Optional[float] = None
    upper_bound: Optional[float] = None

class ForecastResponse(BaseModel):
    horizon_days: int
    forecast_type: str
    points: List[ForecastPoint]
    total_projected: float
    trend: str
    confidence_score: float
    recommendations: List[str]


# ==========================================
# AI SCHEMAS
# ==========================================

class RAGChatRequest(BaseModel):
    query: str
    history: Optional[List[Dict[str, str]]] = None

class RAGChatResponse(BaseModel):
    answer: str
    suggested_questions: List[str]
    products: List[Dict[str, Any]]
    mode: str # "gemini_rag" or "local_rag"

class TextToSQLRequest(BaseModel):
    question: str

class TextToSQLResponse(BaseModel):
    question: str
    generated_sql: str
    is_safe: bool
    explanation: str
    columns: List[str]
    rows: List[Dict[str, Any]]
    chart_type: Optional[str] = "bar" # bar, line, pie, table
    chart_config: Optional[Dict[str, Any]] = None

class AIProductGenerateRequest(BaseModel):
    name: str
    category: Optional[str] = None
    rough_specs: Optional[str] = None
    tone: Optional[str] = "premium"

class AIProductGenerateResponse(BaseModel):
    seo_title: str
    short_description: str
    full_description: str
    tags: List[str]
    seo_keywords: List[str]
    category_suggestion: str
