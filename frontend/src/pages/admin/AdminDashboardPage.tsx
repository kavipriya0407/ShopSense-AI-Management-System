import React, { useEffect, useState } from 'react';
import { Shield, DollarSign, Store, Users, ShoppingBag, Activity, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '../../services/api';

export const AdminDashboardPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const [metrics, setMetrics] = useState<any>(null);
  const [trend, setTrend] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      setLoading(true);
      try {
        const [mRes, tRes, vRes] = await Promise.all([
          api.getAdminOverview(),
          api.getAdminTrend(30),
          api.getVendors(),
        ]);
        setMetrics(mRes);
        setTrend(tRes || []);
        setVendors(vRes || []);
      } catch (err) {
        console.error('Failed to load admin data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAdminData();
  }, []);

  if (loading || !metrics) {
    return <div className="h-96 rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse" />;
  }

  const statCards = [
    { title: 'Gross Marketplace Value (GMV)', val: `₹${metrics.total_gmv?.toLocaleString('en-IN')}`, icon: DollarSign, color: 'text-brand-500' },
    { title: 'Platform Commission Earned', val: `₹${metrics.platform_commission?.toLocaleString('en-IN')}`, icon: Shield, color: 'text-purple-500' },
    { title: 'Active Registered Vendors', val: metrics.total_vendors, icon: Store, color: 'text-indigo-500' },
    { title: 'Platform Order Volume', val: metrics.total_orders, icon: ShoppingBag, color: 'text-emerald-500' },
  ];

  return (
    <div className="space-y-8 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span>Admin Platform Command Hub</span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
              Superadmin
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Macro marketplace metrics, vendor audit, platform revenue take-rate, and system diagnostics
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => onNavigate('/admin/health')}
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-500/20 flex items-center space-x-1.5"
          >
            <Activity className="w-4 h-4" />
            <span>Inspect System Health</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((c, i) => {
          const Icon = c.icon;
          return (
            <div key={i} className="p-5 rounded-2xl glass-card space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{c.title}</span>
                <Icon className={`w-4 h-4 ${c.color}`} />
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">{c.val}</p>
            </div>
          );
        })}
      </div>

      {/* Platform GMV Growth Chart */}
      <div className="p-6 rounded-3xl glass-panel space-y-4 border border-slate-200 dark:border-slate-800">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Platform GMV Velocity (30 Days)</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Total cross-vendor order gross transaction volume</p>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="adminGmv" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="display_date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', fontSize: '11px', color: '#fff' }}
                formatter={(v: any) => [`₹${Number(v).toLocaleString('en-IN')}`, 'GMV']}
              />
              <Area type="monotone" dataKey="revenue" stroke="#8B5CF6" strokeWidth={2.5} fill="url(#adminGmv)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Vendor Directory Preview */}
      <div className="p-6 rounded-3xl glass-panel space-y-4 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Active Merchant Directory</h3>
          <button
            onClick={() => onNavigate('/admin/vendors')}
            className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline"
          >
            Manage All Vendors →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          {vendors.slice(0, 6).map((v) => (
            <div key={v.id} className="p-4 rounded-2xl glass-card space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white truncate">{v.store_name}</span>
                <span className="text-[10px] font-bold text-emerald-500 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                  {v.is_verified ? 'Verified' : 'Pending'}
                </span>
              </div>
              <div className="flex justify-between text-slate-500 text-[11px]">
                <span>Rating: ⭐ {v.rating}</span>
                <span>{v.product_count} Products</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
