export type UserRole = 'ADMIN' | 'VENDOR' | 'CUSTOMER';

export interface User {
  id: number;
  email: string;
  full_name: string;
  role: UserRole;
  avatar_url?: string;
  vendor_id?: number;
  is_active: boolean;
}

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  image_url?: string;
}

export interface Product {
  id: number;
  vendor_id: number;
  category_id?: number;
  name: string;
  slug: string;
  sku: string;
  price: number;
  compare_at_price?: number;
  cost_price?: number;
  description?: string;
  ai_description?: string;
  seo_title?: string;
  seo_keywords?: string;
  tags?: string;
  specs?: Record<string, any>;
  stock: number;
  reserved_stock?: number;
  low_stock_threshold: number;
  rating: number;
  review_count: number;
  image_url?: string;
  images?: string[];
  is_active: boolean;
  vendor_name?: string;
  category_name?: string;
  created_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  id: number;
  product_id?: number;
  vendor_id: number;
  product_name: string;
  price: number;
  quantity: number;
  subtotal: number;
  status: string;
}

export interface Order {
  id: number;
  order_number: string;
  customer_id?: number;
  customer_name?: string;
  customer_email?: string;
  total_amount: number;
  discount_amount: number;
  tax_amount: number;
  shipping_amount: number;
  status: string;
  payment_status: string;
  payment_method: string;
  shipping_address?: Record<string, any>;
  created_at: string;
  items: OrderItem[];
}

export interface Review {
  id: number;
  product_id: number;
  customer_name?: string;
  rating: number;
  title?: string;
  comment: string;
  sentiment: 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';
  sentiment_score: number;
  pros?: string[];
  cons?: string[];
  created_at: string;
}

export interface SentimentVoice {
  positive_percentage: number;
  neutral_percentage: number;
  negative_percentage: number;
  average_score: number;
  total_reviews: number;
  common_positives: string[];
  common_complaints: string[];
}

export interface InventoryItem {
  product_id: number;
  product_name: string;
  sku: string;
  category_name?: string;
  current_stock: number;
  reserved_stock: number;
  available_stock: number;
  low_stock_threshold: number;
  is_low_stock: boolean;
  stock_value: number;
  unit_cost: number;
  price: number;
  turnover_rate: number;
  status: string;
}

export interface VendorOverviewMetrics {
  total_revenue: number;
  total_orders: number;
  total_products: number;
  total_customers: number;
  average_order_value: number;
  conversion_rate: number;
  low_stock_items: number;
  growth_rate: number;
}

export interface BenchmarkComparison {
  metric: string;
  vendor_value: number;
  marketplace_avg: number;
  diff_percentage: number;
  status: 'above' | 'below' | 'equal';
  insight: string;
}

export interface ForecastPoint {
  date: string;
  display_date: string;
  actual?: number | null;
  predicted: number;
  lower_bound?: number | null;
  upper_bound?: number | null;
}

export interface ForecastResponse {
  horizon_days: number;
  forecast_type: string;
  points: ForecastPoint[];
  total_projected: number;
  trend: string;
  confidence_score: number;
  recommendations: string[];
}

export interface RAGChatResponse {
  answer: string;
  suggested_questions: string[];
  products: any[];
  mode: string;
}

export interface TextToSQLResponse {
  question: string;
  generated_sql: string;
  is_safe: boolean;
  explanation: string;
  columns: string[];
  rows: Record<string, any>[];
  chart_type?: string;
  chart_config?: {
    x_key: string;
    y_key: string;
  };
}

export interface AIInsight {
  id: string;
  type: 'POSITIVE' | 'WARNING' | 'ALERT' | 'OPPORTUNITY' | 'INFO';
  title: string;
  description: string;
  data_support: string;
  action: string;
}

export interface CustomerSegmentItem {
  segment: string;
  label: string;
  count: number;
  total_spend: number;
  average_spend: number;
  color: string;
  description: string;
}

export interface NotificationItem {
  id: number;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  link?: string;
  created_at: string;
}
