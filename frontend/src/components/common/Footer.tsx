import React from 'react';
import { Sparkles, Shield, Cpu, BarChart3, Heart } from 'lucide-react';

export const Footer: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  return (
    <footer className="border-t border-slate-200/80 dark:border-slate-800/80 bg-white/60 dark:bg-slate-900/60 transition-colors pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          
          {/* Col 1: Brand & Tagline */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-cyan-400 flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
                Shop<span className="text-brand-600 dark:text-brand-400">Sense</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              AI-Powered Multi-Vendor E-Commerce Analytics Platform combining commerce, machine learning forecasting, aspect review sentiment, and RAG conversational search.
            </p>
            <div className="flex items-center space-x-2 pt-2">
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                ● System Online
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-brand-100 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300">
                v1.0.0 Production
              </span>
            </div>
          </div>

          {/* Col 2: Marketplace Explorer */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
              Explore Store
            </h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <button onClick={() => onNavigate('/products')} className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  Product Catalog
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/categories')} className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  Category Hub
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/recommendations')} className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  AI Recommended For You
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/assistant')} className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors flex items-center">
                  <span>RAG Shopping Assistant</span>
                  <span className="ml-1.5 px-1 py-0.2 bg-brand-500 text-white rounded text-[9px] font-bold">AI</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Vendor & Business Intelligence */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
              Intelligence Portals
            </h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <button onClick={() => onNavigate('/vendor/dashboard')} className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  Vendor BI Dashboard
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/vendor/ai-analyst')} className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  Text-to-SQL AI Analyst
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/vendor/forecasting')} className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  Demand Forecasting (Holt-Winters)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigate('/admin/dashboard')} className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  Admin Platform Hub
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Platform Milestones & Tech */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
              Architecture & Project
            </h4>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li>
                <button onClick={() => onNavigate('/milestones')} className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors font-semibold text-brand-600 dark:text-brand-400">
                  Project Milestones (1 to 4) →
                </button>
              </li>
              <li className="text-xs text-slate-500 dark:text-slate-400 pt-1">
                FastAPI • SQLAlchemy • Pydantic • React 19 • TypeScript • Tailwind CSS • Recharts • Scikit/Holt • Gemini AI
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-200/60 dark:border-slate-800/60 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <p>© 2026 ShopSense AI Platform. All rights reserved.</p>
          <p className="mt-2 sm:mt-0 flex items-center">
            Engineered for Multi-Vendor E-Commerce & Machine Learning Analytics
          </p>
        </div>
      </div>
    </footer>
  );
};
