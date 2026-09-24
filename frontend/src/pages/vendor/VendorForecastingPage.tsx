import React, { useEffect, useState } from 'react';
import { TrendingUp, Calendar, AlertCircle, Sparkles, CheckCircle2 } from 'lucide-react';
import {
  AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { api } from '../../services/api';
import { ForecastResponse } from '../../types';

export const VendorForecastingPage: React.FC = () => {
  const [horizon, setHorizon] = useState<number>(30);
  const [forecastType, setForecastType] = useState<string>('SALES');
  const [forecast, setForecast] = useState<ForecastResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchForecast = async () => {
      setLoading(true);
      try {
        const res = await api.getForecast(horizon, forecastType);
        setForecast(res);
      } catch (err) {
        console.error('Failed to load forecast data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchForecast();
  }, [horizon, forecastType]);

  return (
    <div className="space-y-8 pb-16">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span>Machine Learning Demand Forecasting</span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300">
              Holt-Winters Triple Smoothing
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Statistical projection modeling day-of-week seasonality, trend damping, and 95% confidence bounds
          </p>
        </div>

        {/* Horizon Toggle */}
        <div className="flex items-center space-x-2">
          <div className="p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold flex space-x-1">
            {[7, 30, 90].map((h) => (
              <button
                key={h}
                onClick={() => setHorizon(h)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  horizon === h
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm font-bold'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                {h} Days
              </button>
            ))}
          </div>

          <select
            value={forecastType}
            onChange={(e) => setForecastType(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none"
          >
            <option value="SALES">Sales Revenue (₹)</option>
            <option value="DEMAND">Unit Demand (Qty)</option>
          </select>
        </div>
      </div>

      {loading || !forecast ? (
        <div className="h-96 rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
      ) : (
        <>
          {/* Top Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl glass-card space-y-1">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Projected {horizon}-Day Total
              </span>
              <p className="text-2xl font-black text-brand-600 dark:text-brand-400">
                {forecastType === 'SALES' ? `₹${forecast.total_projected.toLocaleString('en-IN')}` : `${Math.round(forecast.total_projected)} units`}
              </p>
            </div>

            <div className="p-5 rounded-2xl glass-card space-y-1">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Identified Momentum Trend
              </span>
              <p className="text-2xl font-black text-emerald-500 uppercase tracking-wide">
                {forecast.trend}
              </p>
            </div>

            <div className="p-5 rounded-2xl glass-card space-y-1">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Model Confidence Index
              </span>
              <p className="text-2xl font-black text-indigo-500">
                {Math.round(forecast.confidence_score * 100)}%
              </p>
            </div>
          </div>

          {/* Forecasting Chart with Confidence Interval */}
          <div className="p-6 rounded-3xl glass-panel space-y-4 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Trajectory: Historical Data vs {horizon}-Day Projection
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Solid blue indicates actual historical values; dotted violet shows ML predicted horizon with upper/lower uncertainty bands
                </p>
              </div>
            </div>

            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={forecast.points} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorUpper" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#818CF8" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#818CF8" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="display_date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderColor: '#1E293B',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '11px',
                    }}
                    formatter={(val: any) => [val !== null ? (forecastType === 'SALES' ? `₹${Number(val).toLocaleString('en-IN')}` : `${val} units`) : 'N/A', '']}
                  />
                  <Area type="monotone" dataKey="upper_bound" stroke="#A5B4FC" strokeDasharray="3 3" fill="url(#colorUpper)" fillOpacity={1} name="Upper Bound (95% CI)" />
                  <Area type="monotone" dataKey="lower_bound" stroke="#A5B4FC" strokeDasharray="3 3" fill="transparent" name="Lower Bound (95% CI)" />
                  <Line type="monotone" dataKey="actual" stroke="#3B82F6" strokeWidth={2.5} dot={false} name="Actual Recorded" />
                  <Line type="monotone" dataKey="predicted" stroke="#6366F1" strokeWidth={2.5} strokeDasharray="5 5" dot={false} name="ML Predicted Trajectory" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI Restocking Recommendations */}
          <div className="p-6 rounded-3xl glass-panel space-y-3 border border-slate-200 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-500" />
              <span>Inventory & Restocking Directives</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {forecast.recommendations.map((rec, i) => (
                <div key={i} className="p-3.5 rounded-2xl glass-card flex items-start space-x-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{rec}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
