import React from 'react';
import {
  Shield, Store, Users, Package, CreditCard,
  BarChart3, Activity, ArrowLeft
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface AdminSidebarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ currentPath, onNavigate }) => {
  const { user } = useAuth();

  const menuItems = [
    { name: 'Admin Overview', path: '/admin/dashboard', icon: Shield },
    { name: 'Vendor Directory', path: '/admin/vendors', icon: Store },
    { name: 'Platform Customers', path: '/admin/customers', icon: Users },
    { name: 'Product Catalog Hub', path: '/admin/products', icon: Package },
    { name: 'Transactions & Payouts', path: '/admin/transactions', icon: CreditCard },
    { name: 'Marketplace BI', path: '/admin/analytics', icon: BarChart3 },
    { name: 'System Health & Latency', path: '/admin/health', icon: Activity },
  ];

  return (
    <aside className="w-64 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md flex flex-col justify-between h-[calc(100vh-4rem)] sticky top-16 transition-colors">
      <div className="p-4 space-y-1 overflow-y-auto">
        <div className="px-3 py-2 mb-2">
          <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
            Superadmin Platform Hub
          </span>
          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
            {user?.full_name || 'Admin'}
          </p>
        </div>

        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path;
          return (
            <button
              key={item.path}
              onClick={() => onNavigate(item.path)}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/80'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-purple-500'}`} />
              <span>{item.name}</span>
            </button>
          );
        })}
      </div>

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
