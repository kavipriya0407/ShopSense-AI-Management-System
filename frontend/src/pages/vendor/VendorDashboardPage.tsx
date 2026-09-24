import React, { useEffect, useState } from 'react';
import {
  DollarSign, ShoppingCart, Package, Users, TrendingUp,
  Percent, AlertTriangle, ArrowUpRight, ArrowDownRight, Layers
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import { api } from '../../services/api';
import { VendorOverviewMetrics, BenchmarkComparison } from '../../types';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';

const PIE_COLORS = ['#6366F1', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#64748B'];

export const VendorDashboardPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const [dateRange, setDateRange] = useState('30d');
  const [metrics, setMetrics] = useState<VendorOverviewMetrics | null>(null);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [benchmarks, setBenchmarks] = useState<BenchmarkComparison[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [mRes, tRes, cRes, pRes, bRes] = await Promise.all([
          api.getVendorOverview(dateRange),
          api.getRevenueTrend(dateRange === '7d' ? 7 : dateRange === '90d' ? 90 : 30),
          api.getCategorySales(),
          api.getTopProducts(5),
          api.getBenchmarks(),
        ]);
        setMetrics(mRes);
        setTrendData(tRes || []);
        setCategoryData(cRes || []);
        setTopProducts(pRes || []);
        setBenchmarks(bRes || []);
      } catch (err) {
        console.error('Failed to load vendor dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [dateRange]);

  if (loading || !metrics) {
    return (
      <div className="space-y-8 animate-pulse p-6">
        <div className="h-8 w-60 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          ))}
        </div>
        <div className="h-80 bg-slate-200 dark:bg-slate-800 rounded-3xl" />
      </div>
    );
  }

  const metricCards = [
    {
      title: 'Gross Revenue',
      value: `₹${metrics.total_revenue.toLocaleString('en-IN')}`,
      change: `${metrics.growth_rate}%`,
      trend: metrics.growth_rate >= 0 ? 'up' : 'down',
      icon: DollarSign,
      color: 'brand',
    },
    {
      title: 'Total Orders',
      value: metrics.total_orders,
      change: '+8.4%',
      trend: 'up',
      icon: ShoppingCart,
      color: 'indigo',
    },
    {
      title: 'Average Order Value',
      value: `₹${metrics.average_order_value.toLocaleString('en-IN')}`,
      change: '+4.2%',
      trend: 'up',
      icon: TrendingUp,
      color: 'emerald',
    },
    {
      title: 'Conversion Rate',
      value: `${metrics.conversion_rate}%`,
      change: '+0.4%',
      trend: 'up',
      icon: Percent,
      color: 'cyan',
    },
  ];

  return (
    <div className="space-y-8 pb-16">
      {/* Header & Date Range Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Vendor Business Intelligence
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time analytics, revenue trajectory, and marketplace benchmarking
          </p>
        </div>

        {/* Date Filter Buttons */}
        <div className="flex items-center space-x-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold">
          {[
            { id: 'today', label: 'Today' },
            { id: '7d', label: '7 Days' },
            { id: '30d', label: '30 Days' },
            { id: '90d', label: '90 Days' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setDateRange(tab.id)}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                dateRange === tab.id
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm font-bold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Low Stock Alert Banner */}
      {metrics.low_stock_items > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 flex items-center justify-between">
          <div className="flex items-center space-x-3 text-xs">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
            <div>
              <span className="font-bold">Inventory Notice: </span>
              <span>
                You have {metrics.low_stock_items} products below their minimum safety reorder threshold.
              </span>
            </div>
          </div>
          <button
            onClick={() => onNavigate('/vendor/inventory')}
            className="px-3 py-1 text-xs font-bold bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors shadow-sm shrink-0 ml-4"
          >
            Review Inventory
          </button>
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="p-5 rounded-2xl glass-card space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {card.title}
                </span>
                <div className="w-8 h-8 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center">
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {card.value}
                </span>
                <div
                  className={`flex items-center text-xs font-bold ${
                    card.trend === 'up' ? 'text-emerald-500' : 'text-rose-500'
                  }`}
                >
                  {card.trend === 'up' ? (
                    <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                  ) : (
                    <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
                  )}
                  <span>{card.change}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* BI Charts: Revenue Trend & Sales by Category */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Trend Area Chart */}
        <div className="lg:col-span-2 p-6 rounded-3xl glass-panel space-y-4 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Revenue & Profit Trend</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Daily gross turnover and net profit trajectory</p>
            </div>
            <span className="text-xs font-semibold text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950 px-2.5 py-1 rounded-lg">
              {dateRange.toUpperCase()}
            </span>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="display_date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#1E293B',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                  formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, '']}
                />
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#6366F1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" />
                <Area type="monotone" dataKey="profit" name="Net Margin" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorProfit)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sales by Category Donut */}
        <div className="p-6 rounded-3xl glass-panel space-y-4 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Sales by Category</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Merchandise revenue distribution</p>
          </div>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={3}
                >
                  {categoryData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#1E293B',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '11px',
                  }}
                  formatter={(val: any) => [`₹${Number(val).toLocaleString('en-IN')}`, 'Sales']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 text-xs">
            {categoryData.slice(0, 4).map((cat, idx) => (
              <div key={idx} className="flex justify-between items-center text-slate-600 dark:text-slate-300">
                <span className="flex items-center gap-1.5 truncate">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: PIE_COLORS[idx] }} />
                  <span className="truncate">{cat.name}</span>
                </span>
                <span className="font-bold shrink-0">₹{cat.value.toLocaleString('en-IN')}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Products & Marketplace Benchmarks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Selling Products Table */}
        <div className="lg:col-span-2 p-6 rounded-3xl glass-panel space-y-4 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Top Performing Products</h3>
            <button
              onClick={() => onNavigate('/vendor/products')}
              className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
            >
              View Full Catalog →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider">
                  <th className="pb-3">Product</th>
                  <th className="pb-3">Stock</th>
                  <th className="pb-3 text-right">Units Sold</th>
                  <th className="pb-3 text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                {topProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                    <td className="py-3 font-semibold text-slate-900 dark:text-white max-w-[220px] truncate">
                      {p.name}
                    </td>
                    <td className="py-3">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        p.stock <= 10
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      }`}>
                        {p.stock} units
                      </span>
                    </td>
                    <td className="py-3 text-right text-slate-600 dark:text-slate-300 font-semibold">
                      {p.units_sold}
                    </td>
                    <td className="py-3 text-right font-extrabold text-slate-900 dark:text-white">
                      ₹{p.revenue.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Marketplace Benchmarking Card */}
        <div className="p-6 rounded-3xl glass-panel space-y-4 border border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Marketplace Benchmarks</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Calculated vs all other active platform vendors</p>
          </div>

          <div className="space-y-3 text-xs">
            {benchmarks.map((b, i) => (
              <div key={i} className="p-3 rounded-2xl glass-card space-y-1">
                <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200">
                  <span>{b.metric}</span>
                  <span className={b.status === 'above' ? 'text-emerald-500' : 'text-rose-500'}>
                    {b.status === 'above' ? '+' : '-'}{b.diff_percentage}%
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">{b.insight}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
