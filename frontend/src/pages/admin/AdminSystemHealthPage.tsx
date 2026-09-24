import React, { useEffect, useState } from 'react';
import { Activity, Database, Cpu, CheckCircle2, RefreshCw, Layers, ShieldCheck } from 'lucide-react';
import { api } from '../../services/api';

export const AdminSystemHealthPage: React.FC = () => {
  const [health, setHealth] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchHealth = () => {
    setLoading(true);
    api.getSystemHealth()
      .then(setHealth)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  if (loading || !health) {
    return <div className="h-96 rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse" />;
  }

  return (
    <div className="space-y-8 pb-16 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span>System Health & Architectural Telemetry</span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
              {health.status}
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time verification of database ping latency, dialect bindings, and AI engine status
          </p>
        </div>

        <button
          onClick={fetchHealth}
          className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Ping Telemetry</span>
        </button>
      </div>

      {/* Services Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Core App */}
        <div className="p-6 rounded-3xl glass-panel space-y-3 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">FastAPI Backend</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-xl font-black text-slate-900 dark:text-white">{health.app_name} v{health.version}</p>
          <span className="inline-block text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-md">
            ● High-Throughput Async
          </span>
        </div>

        {/* Database */}
        <div className="p-6 rounded-3xl glass-panel space-y-3 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Database Layer</span>
            <Database className="w-5 h-5 text-brand-500" />
          </div>
          <p className="text-xl font-black text-slate-900 dark:text-white">
            {health.database.dialect} ({health.database.latency_ms} ms)
          </p>
          <span className="inline-block text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-md">
            ● Connection Pool Active
          </span>
        </div>

        {/* AI Engine */}
        <div className="p-6 rounded-3xl glass-panel space-y-3 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">AI & ML Engine</span>
            <Cpu className="w-5 h-5 text-purple-500" />
          </div>
          <p className="text-xl font-black text-slate-900 dark:text-white">{health.ai_engine.mode}</p>
          <span className="inline-block text-[11px] text-brand-600 dark:text-brand-400 font-semibold bg-brand-50 dark:bg-brand-950 px-2 py-0.5 rounded-md truncate max-w-full">
            {health.ai_engine.provider}
          </span>
        </div>
      </div>

      {/* Row Counts Table */}
      <div className="p-6 rounded-3xl glass-panel space-y-4 border border-slate-200 dark:border-slate-800">
        <h3 className="text-base font-bold text-slate-900 dark:text-white">Database Entities & Seed Health</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-center">
          <div className="p-4 rounded-2xl glass-card">
            <p className="text-2xl font-black text-slate-900 dark:text-white">{health.metrics.total_users}</p>
            <span className="text-[11px] text-slate-400">Total Users</span>
          </div>
          <div className="p-4 rounded-2xl glass-card">
            <p className="text-2xl font-black text-slate-900 dark:text-white">{health.metrics.total_vendors}</p>
            <span className="text-[11px] text-slate-400">Vendors</span>
          </div>
          <div className="p-4 rounded-2xl glass-card">
            <p className="text-2xl font-black text-slate-900 dark:text-white">{health.metrics.total_products}</p>
            <span className="text-[11px] text-slate-400">Products</span>
          </div>
          <div className="p-4 rounded-2xl glass-card">
            <p className="text-2xl font-black text-slate-900 dark:text-white">{health.metrics.total_orders}</p>
            <span className="text-[11px] text-slate-400">Orders</span>
          </div>
          <div className="p-4 rounded-2xl glass-card">
            <p className="text-2xl font-black text-slate-900 dark:text-white">{health.metrics.total_transactions}</p>
            <span className="text-[11px] text-slate-400">Transactions</span>
          </div>
        </div>
      </div>
    </div>
  );
};
