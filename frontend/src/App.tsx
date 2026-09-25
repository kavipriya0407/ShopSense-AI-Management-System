import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { WebSocketProvider } from './contexts/WebSocketContext';

import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { CartDrawer } from './components/common/CartDrawer';
import { VendorSidebar } from './components/vendor/VendorSidebar';
import { AdminSidebar } from './components/admin/AdminSidebar';

// Customer Pages
import { HomePage } from './pages/customer/HomePage';
import { ProductsPage } from './pages/customer/ProductsPage';
import { ProductDetailPage } from './pages/customer/ProductDetailPage';
import { CategoriesPage } from './pages/customer/CategoriesPage';
import { CheckoutPage } from './pages/customer/CheckoutPage';
import { OrdersPage } from './pages/customer/OrdersPage';
import { RecommendationsPage } from './pages/customer/RecommendationsPage';
import { ShoppingAssistantPage } from './pages/customer/ShoppingAssistantPage';

// Vendor Pages
import { VendorDashboardPage } from './pages/vendor/VendorDashboardPage';
import { VendorProductsPage } from './pages/vendor/VendorProductsPage';
import { VendorInventoryPage } from './pages/vendor/VendorInventoryPage';
import { VendorOrdersPage } from './pages/vendor/VendorOrdersPage';
import { VendorCustomersPage } from './pages/vendor/VendorCustomersPage';
import { VendorAnalyticsPage } from './pages/vendor/VendorAnalyticsPage';
import { VendorForecastingPage } from './pages/vendor/VendorForecastingPage';
import { VendorReviewsPage } from './pages/vendor/VendorReviewsPage';
import { VendorAIAnalystPage } from './pages/vendor/VendorAIAnalystPage';
import { VendorAIRecommendationsPage } from './pages/vendor/VendorAIRecommendationsPage';
import { VendorReportsPage } from './pages/vendor/VendorReportsPage';
import { VendorProfilePage } from './pages/vendor/VendorProfilePage';

// Admin Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminVendorsPage } from './pages/admin/AdminVendorsPage';
import { AdminCustomersPage } from './pages/admin/AdminCustomersPage';
import { AdminProductsPage } from './pages/admin/AdminProductsPage';
import { AdminTransactionsPage } from './pages/admin/AdminTransactionsPage';
import { AdminAnalyticsPage } from './pages/admin/AdminAnalyticsPage';
import { AdminSystemHealthPage } from './pages/admin/AdminSystemHealthPage';

// Shared Pages
import { MilestonesPage } from './pages/MilestonesPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { Sparkles, ShieldAlert, ArrowRight } from 'lucide-react';

const MainApp: React.FC = () => {
  const { isAuthenticated, isVendor, isAdmin, quickDemoLogin } = useAuth();
  const [currentPath, setCurrentPath] = useState<string>('/');
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  // Sync with browser history API
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      setCurrentPath(path || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectProduct = (id: number) => {
    setSelectedProductId(id);
    navigate(`/products/${id}`);
  };

  const handleSelectCategory = (catId: number) => {
    setSelectedCategoryId(catId);
    navigate('/products');
  };

  // Determine Layout Structure
  const isVendorRoute = currentPath.startsWith('/vendor');
  const isAdminRoute = currentPath.startsWith('/admin');

  // RBAC Permission Guard
  const renderPermissionDenied = (requiredRole: string, demoTarget: string) => (
    <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
      <div className="w-16 h-16 rounded-3xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-lg">
        <ShieldAlert className="w-8 h-8" />
      </div>
      <h2 className="text-xl font-black text-slate-900 dark:text-white">
        {requiredRole} Authorization Required
      </h2>
      <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
        This section is restricted to authenticated {requiredRole.toLowerCase()} accounts. Please switch to a {requiredRole.toLowerCase()} demo session below.
      </p>
      <div className="pt-2 flex justify-center space-x-3">
        <button
          onClick={async () => {
            await quickDemoLogin(demoTarget);
            if (demoTarget === 'admin') navigate('/admin/dashboard');
            else if (demoTarget === 'vendor') navigate('/vendor/dashboard');
            else navigate('/');
          }}
          className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-md shadow-brand-500/20"
        >
          Quick Login as {requiredRole}
        </button>
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs"
        >
          Return Home
        </button>
      </div>
    </div>
  );

  // Render Page Content
  const renderContent = () => {
    // Auth Routes
    if (currentPath === '/login') {
      return (
        <LoginPage
          onNavigateRegister={() => navigate('/register')}
          onSuccess={(role?: string) => {
            if (role === 'ADMIN') {
              navigate('/admin/dashboard');
            } else if (role === 'VENDOR') {
              navigate('/vendor/dashboard');
            } else {
              navigate('/');
            }
          }}
        />
      );
    }
    if (currentPath === '/register') {
      return (
        <RegisterPage
          onNavigateLogin={() => navigate('/login')}
          onSuccess={() => navigate('/')}
        />
      );
    }

    // Milestones
    if (currentPath === '/milestones') {
      return <MilestonesPage />;
    }

    // Vendor Portal Routes
    if (isVendorRoute) {
      if (!isVendor && !isAdmin) {
        return renderPermissionDenied('Vendor', 'vendor');
      }
      switch (currentPath) {
        case '/vendor/dashboard':
          return <VendorDashboardPage onNavigate={navigate} />;
        case '/vendor/products':
          return <VendorProductsPage />;
        case '/vendor/inventory':
          return <VendorInventoryPage />;
        case '/vendor/orders':
          return <VendorOrdersPage />;
        case '/vendor/customers':
          return <VendorCustomersPage />;
        case '/vendor/analytics':
          return <VendorAnalyticsPage />;
        case '/vendor/forecasting':
          return <VendorForecastingPage />;
        case '/vendor/reviews':
          return <VendorReviewsPage />;
        case '/vendor/ai-analyst':
          return <VendorAIAnalystPage />;
        case '/vendor/ai-recommendations':
          return <VendorAIRecommendationsPage />;
        case '/vendor/reports':
          return <VendorReportsPage />;
        case '/vendor/profile':
          return <VendorProfilePage />;
        default:
          return <VendorDashboardPage onNavigate={navigate} />;
      }
    }

    // Admin Portal Routes
    if (isAdminRoute) {
      if (!isAdmin) {
        return renderPermissionDenied('Administrator', 'admin');
      }
      switch (currentPath) {
        case '/admin/dashboard':
          return <AdminDashboardPage onNavigate={navigate} />;
        case '/admin/vendors':
          return <AdminVendorsPage />;
        case '/admin/customers':
          return <AdminCustomersPage />;
        case '/admin/products':
          return <AdminProductsPage />;
        case '/admin/transactions':
          return <AdminTransactionsPage />;
        case '/admin/analytics':
          return <AdminAnalyticsPage />;
        case '/admin/health':
          return <AdminSystemHealthPage />;
        default:
          return <AdminDashboardPage onNavigate={navigate} />;
      }
    }

    // Customer Routes
    if (currentPath.startsWith('/products/') && selectedProductId) {
      return (
        <ProductDetailPage
          productId={selectedProductId}
          onBack={() => navigate('/products')}
          onSelectProduct={handleSelectProduct}
        />
      );
    }
    if (currentPath === '/products') {
      return (
        <ProductsPage
          initialCategory={selectedCategoryId || undefined}
          onSelectProduct={handleSelectProduct}
        />
      );
    }
    if (currentPath === '/categories') {
      return <CategoriesPage onSelectCategory={handleSelectCategory} />;
    }
    if (currentPath === '/checkout') {
      return (
        <CheckoutPage
          onNavigateOrders={() => navigate('/orders')}
          onNavigateStore={() => navigate('/products')}
        />
      );
    }
    if (currentPath === '/orders') {
      return <OrdersPage onNavigateStore={() => navigate('/products')} />;
    }
    if (currentPath === '/recommendations') {
      return <RecommendationsPage onSelectProduct={handleSelectProduct} />;
    }
    if (currentPath === '/assistant') {
      return <ShoppingAssistantPage onSelectProduct={handleSelectProduct} />;
    }

    // Default: Home Page
    return (
      <HomePage
        onNavigate={navigate}
        onSelectProduct={handleSelectProduct}
        onSelectCategory={handleSelectCategory}
      />
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar currentPath={currentPath} onNavigate={navigate} />

      <div className="flex-1 flex w-full">
        {/* Vendor Sidebar */}
        {isVendorRoute && isVendor && (
          <VendorSidebar currentPath={currentPath} onNavigate={navigate} />
        )}

        {/* Admin Sidebar */}
        {isAdminRoute && isAdmin && (
          <AdminSidebar currentPath={currentPath} onNavigate={navigate} />
        )}

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
          {renderContent()}
        </main>
      </div>

      {/* Floating RAG AI Shopping Assistant launcher on customer storefront */}
      {!isVendorRoute && !isAdminRoute && currentPath !== '/assistant' && (
        <button
          onClick={() => navigate('/assistant')}
          className="fixed bottom-6 right-6 z-40 px-4 py-3 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-cyan-500 text-white font-bold text-xs shadow-2xl shadow-brand-500/40 hover:scale-105 active:scale-95 flex items-center space-x-2 transition-all"
          title="Ask AI Shopping Assistant"
        >
          <Sparkles className="w-4 h-4 text-cyan-200 animate-spin" />
          <span>Ask AI Assistant</span>
        </button>
      )}

      <CartDrawer onNavigateCheckout={() => navigate('/checkout')} />
      <Footer onNavigate={navigate} />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <WebSocketProvider>
            <MainApp />
          </WebSocketProvider>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
