import React from 'react';
import {
  LayoutDashboard, Package, Boxes, ShoppingBag, Users,
  BarChart2, TrendingUp, MessageSquare, Database,
  Sparkles, FileText, UserCheck, ArrowLeft
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface VendorSidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const VendorSidebar: React.FC<VendorSidebarProps> = ({ currentPath, onNavigate }) => {
  const { user } = useAuth();

  const menuItems = [
    { name: 'Dashboard', path: '/vendor/dashboard', icon: LayoutDashboard },
    { name: 'Products', path: '/vendor/products', icon: Package },
    { name: 'Inventory Intelligence', path: '/vendor/inventory', icon: Boxes },
    { name: 'Orders', path: '/vendor/orders', icon: ShoppingBag },
    { name: 'Customer Analytics', path: '/vendor/customers', icon: Users },
    { name: 'BI Analytics', path: '/vendor/analytics', icon: BarChart2 },
    { name: 'ML Forecasting', path: '/vendor/forecasting', icon: TrendingUp },
    { name: 'Review Sentiment', path: '/vendor/reviews', icon: MessageSquare },
    { name: 'AI Data Analyst', path: '/vendor/ai-analyst', icon: Database, isAi: true },
    { name: 'AI Recommendations', path: '/vendor/ai-recommendations', icon: Sparkles, isAi: true },
    { name: 'Automated Reports', path: '/vendor/reports', icon: FileText },
    { name: 'Store Profile', path: '/vendor/profile', icon: UserCheck },
  ];

  return (
    <aside className="w-64 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md flex flex-col justify-between h-[calc(100vh-4rem)] sticky top-16 transition-colors">
      <div className="p-4 space-y-1 overflow-y-auto">
        <div className="px-3 py-2 mb-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            Vendor Control Center
          </span>
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
            {user?.full_name || 'Vendor Admin'}
          </p>
        </div>

        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path;
          return (
            <button
              key={item.path}
              onClick={() => onNavigate(item.path)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/80'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.isAi ? 'text-brand-500' : 'text-slate-500 dark:text-slate-400'}`} />
                <span>{item.name}</span>
              </div>
              {item.isAi && (
                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-brand-100 dark:bg-brand-950 text-brand-600 dark:text-brand-400'}`}>
                  AI
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Storefront Link */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        <button
          onClick={() => onNavigate('/')}
          className="w-full flex items-center space-x-2 px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 rounded-xl transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Switch to Customer Store</span>
        </button>
      </div>
    </aside>
  );
};
