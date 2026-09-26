const rawBase =
  import.meta.env.VITE_API_URL ||
  "https://shopsense-ai-management-system.onrender.com";

export const API_BASE_URL =
  rawBase.endsWith('/api')
    ? rawBase
    : `${rawBase.replace(/\/+$/, '')}/api`;

export function getAuthToken(): string | null {
  return localStorage.getItem('shopsense_token');
}

export function setAuthToken(token: string): void {
  localStorage.setItem('shopsense_token', token);
}

export function removeAuthToken(): void {
  localStorage.removeItem('shopsense_token');
}

export async function downloadCsv(endpoint: string, defaultFilename: string): Promise<void> {
  const token = getAuthToken();
  const headers: Record<string, string> = {};

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  let response: Response;
  try {
    response = await fetch(url, { headers });
  } catch (networkErr: any) {
    throw new Error('ShopSense server is unavailable. Please start the backend server.');
  }

  if (!response.ok) {
    let errorDetail = `CSV export failed with status ${response.status}`;
    try {
      const errorJson = await response.json();
      errorDetail = errorJson.detail || errorDetail;
    } catch {
      // fallback
    }
    throw new Error(errorDetail);
  }

  const blob = await response.blob();
  const disposition = response.headers.get('Content-Disposition');
  let filename = defaultFilename;
  if (disposition && disposition.includes('filename=')) {
    const matches = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/.exec(disposition);
    if (matches != null && matches[1]) {
      filename = matches[1].replace(/['"]/g, '');
    }
  }

  const downloadUrl = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = downloadUrl;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(downloadUrl);
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  let response: Response;
  try {
    response = await fetch(url, {
      ...options,
      headers,
    });
  } catch (networkErr: any) {
    const msg = networkErr?.message || '';
    if (msg.includes('Failed to fetch') || msg.includes('NetworkError') || msg.includes('fetch')) {
      throw new Error('ShopSense server is unavailable. Please start the backend server.');
    }
    throw networkErr;
  }

  if (!response.ok) {
    let errorDetail = `Request failed with status ${response.status}`;
    try {
      const errorJson = await response.json();
      errorDetail = errorJson.detail || errorDetail;
    } catch {
      // fallback
    }
    throw new Error(errorDetail);
  }

  if (response.status === 204) {
    return null as unknown as T;
  }

  return response.json();
}

export const api = {
  // Auth
  login: (data: any) => request<any>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  register: (data: any) => request<any>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  getMe: () => request<any>('/auth/me'),
  quickDemoLogin: (role: string) => request<any>(`/auth/quick-demo-login?role=${role}`, { method: 'POST' }),

  // Products
  getProducts: (params: Record<string, any> = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') query.append(k, String(v));
    });
    return request<any>(`/products?${query.toString()}`);
  },
  getProduct: (id: number) => request<any>(`/products/${id}`),
  getVendorProducts: () => request<any>('/products/vendor/my-products'),
  createProduct: (data: any) => request<any>('/products', { method: 'POST', body: JSON.stringify(data) }),
  updateProduct: (id: number, data: any) => request<any>(`/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProduct: (id: number) => request<any>(`/products/${id}`, { method: 'DELETE' }),

  // Categories
  getCategories: () => request<any>('/categories'),
  getCategory: (slug: string) => request<any>(`/categories/${slug}`),

  // Inventory
  getInventory: () => request<any>('/inventory'),
  getLowStockAlerts: () => request<any>('/inventory/alerts'),
  updateStock: (data: any) => request<any>('/inventory/update-stock', { method: 'POST', body: JSON.stringify(data) }),

  // Orders
  createOrder: (data: any) => request<any>('/orders', { method: 'POST', body: JSON.stringify(data) }),
  getMyOrders: () => request<any>('/orders/my-orders'),
  getVendorOrders: () => request<any>('/orders/vendor/orders'),
  updateOrderStatus: (id: number, status: string) => request<any>(`/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),

  // Reviews
  getProductReviews: (productId: number) => request<any>(`/reviews/product/${productId}`),
  submitReview: (data: any) => request<any>('/reviews', { method: 'POST', body: JSON.stringify(data) }),
  getVendorCustomerVoice: () => request<any>('/reviews/vendor/customer-voice'),

  // Analytics
  getVendorOverview: (dateRange = '30d') => request<any>(`/analytics/vendor/overview?date_range=${dateRange}`),
  getRevenueTrend: (days = 30) => request<any>(`/analytics/vendor/revenue-trend?days=${days}`),
  getCategorySales: () => request<any>('/analytics/vendor/category-sales'),
  getTopProducts: (limit = 5) => request<any>(`/analytics/vendor/top-products?limit=${limit}`),
  getBenchmarks: () => request<any>('/analytics/vendor/benchmarks'),
  getAdminOverview: () => request<any>('/analytics/admin/overview'),
  getAdminTrend: (days = 30) => request<any>(`/analytics/admin/platform-trend?days=${days}`),

  // Forecasting
  getForecast: (horizon = 30, type = 'SALES') => request<any>(`/forecast?horizon=${horizon}&forecast_type=${type}`),

  // Recommendations
  getPersonalizedRecommendations: (limit = 8) => request<any>(`/recommendations?limit=${limit}`),
  getSimilarProducts: (productId: number, limit = 4) => request<any>(`/recommendations/similar/${productId}?limit=${limit}`),

  // AI Features
  chatShoppingAssistant: (query: string, history: any[] = []) => request<any>('/ai/shopping-assistant', { method: 'POST', body: JSON.stringify({ query, history }) }),
  analyzeDataSQL: (question: string) => request<any>('/ai/data-analyst', { method: 'POST', body: JSON.stringify({ question }) }),
  generateProductAI: (data: any) => request<any>('/ai/generate-product', { method: 'POST', body: JSON.stringify(data) }),
  getBusinessInsights: () => request<any>('/ai/insights'),

  // Customer Analytics & Segmentation
  getCustomerSegments: () => request<any>('/customers/segments'),
  getVendorCustomers: () => request<any>('/customers/list'),
  getAdminCustomers: () => request<any>('/customers/admin/all'),

  // Vendors
  getVendors: () => request<any>('/vendors'),
  getVendor: (id: number) => request<any>(`/vendors/${id}`),
  toggleVendorVerify: (id: number) => request<any>(`/vendors/${id}/verify`, { method: 'PUT' }),

  // Reports
  getReportSummary: (reportType: string, dateRange = '30d') => request<any>(`/reports/summary?report_type=${reportType}&date_range=${dateRange}`),
  getExportCsvUrl: (reportType: string, dateRange = '30d') => `${API_BASE_URL}/reports/export-csv?report_type=${reportType}&date_range=${dateRange}`,

  // Notifications
  getNotifications: () => request<any>('/notifications'),
  markNotificationRead: (id: number) => request<any>(`/notifications/${id}/read`, { method: 'PUT' }),
  markAllNotificationsRead: () => request<any>('/notifications/read-all', { method: 'PUT' }),

  // System
  getSystemHealth: () => request<any>('/system/health'),
};
