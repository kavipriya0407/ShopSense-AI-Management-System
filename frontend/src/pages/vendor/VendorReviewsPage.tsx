import React, { useEffect, useState } from 'react';
import { MessageSquare, ThumbsUp, ThumbsDown, Smile, Meh, Frown, Sparkles } from 'lucide-react';
import { api } from '../../services/api';
import { SentimentVoice } from '../../types';

export const VendorReviewsPage: React.FC = () => {
  const [voice, setVoice] = useState<SentimentVoice | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getVendorCustomerVoice()
      .then(setVoice)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading || !voice) {
    return <div className="h-96 rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse" />;
  }

  return (
    <div className="space-y-8 pb-16">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <span>Customer Voice & Sentiment Intelligence</span>
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
            NLP Aspect Analysis
          </span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Automated semantic classification across customer reviews detecting key satisfaction drivers and complaints
        </p>
      </div>

      {/* Sentiment Distribution Gauges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-6 rounded-3xl glass-card border border-emerald-500/30 space-y-3 bg-emerald-50/20 dark:bg-emerald-950/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
              Positive Sentiment
            </span>
            <Smile className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
            {voice.positive_percentage}%
          </p>
          <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${voice.positive_percentage}%` }} />
          </div>
        </div>

        <div className="p-6 rounded-3xl glass-card border border-amber-500/30 space-y-3 bg-amber-50/20 dark:bg-amber-950/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
              Neutral Sentiment
            </span>
            <Meh className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-3xl font-black text-amber-600 dark:text-amber-400">
            {voice.neutral_percentage}%
          </p>
          <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="bg-amber-500 h-full rounded-full" style={{ width: `${voice.neutral_percentage}%` }} />
          </div>
        </div>

        <div className="p-6 rounded-3xl glass-card border border-rose-500/30 space-y-3 bg-rose-50/20 dark:bg-rose-950/20">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
              Negative / Issues
            </span>
            <Frown className="w-5 h-5 text-rose-500" />
          </div>
          <p className="text-3xl font-black text-rose-600 dark:text-rose-400">
            {voice.negative_percentage}%
          </p>
          <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
            <div className="bg-rose-500 h-full rounded-full" style={{ width: `${voice.negative_percentage}%` }} />
          </div>
        </div>
      </div>

      {/* Customer Voice: What Customers Like vs Complain About */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pros */}
        <div className="p-6 rounded-3xl glass-panel space-y-4 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400">
            <ThumbsUp className="w-5 h-5" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">What Customers Praise</h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            High frequency positive attributes identified across verified purchase reviews
          </p>

          <div className="space-y-2.5">
            {voice.common_positives.map((point, idx) => (
              <div
                key={idx}
                className="p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/60 dark:border-emerald-800/40 text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center space-x-2"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                <span>{point}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Cons / Complaints */}
        <div className="p-6 rounded-3xl glass-panel space-y-4 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center space-x-2 text-rose-600 dark:text-rose-400">
            <ThumbsDown className="w-5 h-5" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Common Feedback & Complaints</h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Actionable friction points detected in feedback requiring supplier optimization
          </p>

          <div className="space-y-2.5">
            {voice.common_complaints.map((point, idx) => (
              <div
                key={idx}
                className="p-3 rounded-2xl bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200/60 dark:border-rose-800/40 text-xs font-semibold text-slate-800 dark:text-slate-200 flex items-center space-x-2"
              >
                <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                <span>{point}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
