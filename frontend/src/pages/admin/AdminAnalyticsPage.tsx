import React, { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Shield } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '../../services/api';

export const AdminAnalyticsPage: React.FC = () => {
  const [trend, setTrend] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAdminTrend(30)
      .then((res) => setTrend(res || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 pb-16">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">Platform Marketplace BI Analytics</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Global macroeconomic performance, aggregate merchant sales velocity, and network take-rates
        </p>
      </div>

      <div className="p-6 rounded-3xl glass-panel space-y-4 border border-slate-200 dark:border-slate-800">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">Platform Turnover (30 Days)</h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="adminBi" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#A855F7" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#A855F7" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
              <XAxis dataKey="display_date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', fontSize: '11px', color: '#fff' }}
                formatter={(v: any) => [`₹${Number(v).toLocaleString('en-IN')}`, 'Platform GMV']}
              />
              <Area type="monotone" dataKey="revenue" stroke="#A855F7" strokeWidth={2.5} fill="url(#adminBi)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
