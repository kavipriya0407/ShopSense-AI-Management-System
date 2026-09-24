import React, { useEffect, useState } from 'react';
import { Sparkles, TrendingUp, AlertTriangle, Lightbulb, CheckCircle2, ArrowRight } from 'lucide-react';
import { api } from '../../services/api';
import { AIInsight } from '../../types';

export const VendorAIRecommendationsPage: React.FC = () => {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getBusinessInsights()
      .then(setInsights)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const getInsightStyle = (type: string) => {
    switch (type) {
      case 'POSITIVE':
        return {
          badge: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
          border: 'border-emerald-500/30',
          icon: TrendingUp,
          iconColor: 'text-emerald-500',
        };
      case 'ALERT':
      case 'WARNING':
        return {
          badge: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
          border: 'border-amber-500/30',
          icon: AlertTriangle,
          iconColor: 'text-amber-500',
        };
      case 'OPPORTUNITY':
        return {
          badge: 'bg-brand-100 text-brand-800 dark:bg-brand-950 dark:text-brand-300',
          border: 'border-brand-500/30',
          icon: Lightbulb,
          iconColor: 'text-brand-500',
        };
      default:
        return {
          badge: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300',
          border: 'border-slate-300 dark:border-slate-800',
          icon: Sparkles,
          iconColor: 'text-brand-400',
        };
    }
  };

  return (
    <div className="space-y-8 pb-16 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <span>AI Automated Business Insights</span>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300">
            Autonomous Diagnosis
          </span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Algorithmic anomaly detection analyzing turnover, margin velocity, customer cohort retention, and stockout hazards
        </p>
      </div>

      {loading ? (
        <div className="space-y-4 animate-pulse">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-44 rounded-3xl bg-slate-200 dark:bg-slate-800" />
          ))}
        </div>
      ) : insights.length === 0 ? (
        <div className="p-12 text-center text-slate-400">No active alerts at this time.</div>
      ) : (
        <div className="space-y-4">
          {insights.map((item) => {
            const style = getInsightStyle(item.type);
            const Icon = style.icon;
            return (
              <div
                key={item.id}
                className={`p-6 rounded-3xl glass-panel border ${style.border} space-y-4 shadow-sm hover:shadow-md transition-all`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      <Icon className={`w-5 h-5 ${style.iconColor}`} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 dark:text-white">{item.title}</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{item.description}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${style.badge}`}>
                    {item.type}
                  </span>
                </div>

                {/* Supporting Data Callout */}
                <div className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 text-xs">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Data Evidence: </span>
                  <span className="text-slate-600 dark:text-slate-400">{item.data_support}</span>
                </div>

                {/* Prescribed Action */}
                <div className="flex items-center justify-between pt-1 text-xs">
                  <div className="flex items-center space-x-2 text-brand-600 dark:text-brand-400 font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>Prescribed Action: {item.action}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
