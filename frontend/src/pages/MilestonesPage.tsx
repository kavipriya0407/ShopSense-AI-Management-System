import React from 'react';
import { CheckCircle2, Sparkles, Layers, Cpu, Database, Server, Terminal, Shield } from 'lucide-react';

export const MilestonesPage: React.FC = () => {
  const milestones = [
    {
      id: 1,
      title: 'Milestone 1: Marketplace Foundation & Vendor Analytics',
      status: '100% Completed',
      objective: 'Establish multi-vendor architecture, JWT role-based access control, product catalogs, and vendor BI dashboard.',
      features: [
        'JWT Auth with PBKDF2 HMAC SHA-256 secure password hashing and 1-click demo login switchers',
        'Multi-Vendor product management with price, compare-at, SKU, inventory threshold, and category hierarchy',
        'Customer storefront with search, category filtering, cart, and simulated payment checkout',
        'Vendor Dashboard featuring revenue trend area charts, sales by category, top products, and AOV velocity',
        'Dynamic Marketplace Benchmarking comparing merchant revenue and volume against active platform averages',
      ],
      technologies: 'React 19, TypeScript, Tailwind CSS, FastAPI, SQLAlchemy, Recharts, SQLite/PostgreSQL',
      advanced: 'Real-time WebSocket connection broadcasting instant order event toasts to active vendor portals.',
    },
    {
      id: 2,
      title: 'Milestone 2: Inventory Intelligence & Customer Analytics',
      status: '100% Completed',
      objective: 'Implement warehouse stockout intelligence, RFM customer segmentation, aspect review sentiment, and ML forecasting.',
      features: [
        'Inventory turnover rates, available/reserved stock tracking, and critical safety threshold alerts',
        'Customer RFM Segmentation scoring buyers into VIP, High Value, Regular, Occasional, New, and At Risk cohorts',
        'Aspect-based review sentiment NLP extracting customer praise (battery, build) and complaints (transit delays)',
        'Machine Learning demand forecasting using Holt-Winters triple exponential smoothing with 95% confidence intervals',
        'Similar products and personalized "Recommended For You" recommendation engine',
      ],
      technologies: 'NumPy, Pandas, Holt-Winters Statistical Modeling, Cosine Jaccard Recommender, Sentiment Lexicon',
      advanced: 'Automatic inventory replenishment directives based on predicted horizon slope and seasonal damping.',
    },
    {
      id: 3,
      title: 'Milestone 3: Advanced Generative AI & Reporting',
      status: '100% Completed',
      objective: 'Integrate conversational RAG product discovery, safe Text-to-SQL data analyst, AI copywriting, and automated CSV reports.',
      features: [
        'RAG Shopping Assistant answering customer questions with embedded interactive product cards',
        'Text-to-SQL AI Data Analyst translating natural language questions into safe SQL with auto-generated charts',
        'Strict AST SQL validation blocking DROP, DELETE, UPDATE, and ensuring read-only execution',
        'AI Product generator crafting SEO titles, compelling descriptions, keywords, and category suggestions',
        'Automated reporting hub with 1-click CSV download for sales, revenue, inventory, and customers',
      ],
      technologies: 'Google Gemini 1.5 Flash / OpenAI API fallback, SQLParse AST Parser, CSV Streaming',
      advanced: 'Dual AI mode ensuring seamless operation whether API keys are supplied or operating in offline fallback mode.',
    },
    {
      id: 4,
      title: 'Milestone 4: Optimization, Testing & Deployment',
      status: '100% Completed',
      objective: 'Automated backend testing, containerization, system health telemetry, and documentation.',
      features: [
        'Comprehensive backend automated test runner verifying auth, catalog, orders, SQL safety, and recommendations',
        'Superadmin command center auditing vendors, transactions, platform commission, and database latency',
        'Multi-container Docker Compose configuration for backend, frontend, PostgreSQL, and Redis',
        'GitHub Actions CI pipeline running lint, tests, and production frontend bundling',
        'Zero-error production build verified across all responsive breakpoints and theme modes',
      ],
      technologies: 'Docker, Docker Compose, GitHub Actions, Pytest, Uvicorn, Vite',
      advanced: 'Full out-of-the-box demo readiness with 108 products, 11 vendors, 105 customers, and 540 orders pre-seeded.',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20">
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300">
          Architecture & Progress Roadmap
        </span>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
          Project Milestone Execution
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl mx-auto">
          ShopSense final-year engineering architecture roadmap demonstrating complete full-stack, machine learning, and generative AI execution across all four milestones.
        </p>
      </div>

      {/* Milestones Cards List */}
      <div className="space-y-6">
        {milestones.map((m) => (
          <div
            key={m.id}
            className="p-8 rounded-3xl glass-panel border border-slate-200/80 dark:border-slate-800/80 space-y-5 shadow-sm relative overflow-hidden"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-xl bg-brand-600 text-white font-black text-sm flex items-center justify-center">
                  {m.id}
                </div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">{m.title}</h2>
              </div>
              <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 self-start sm:self-auto">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                <span>{m.status}</span>
              </span>
            </div>

            {/* Objective */}
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Objective</span>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{m.objective}</p>
            </div>

            {/* Feature List */}
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Delivered Features</span>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-300">
                {m.features.map((f, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-500 shrink-0 mt-1.5" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Tech Stack & Advanced Highlights */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div className="p-3.5 rounded-2xl glass-card space-y-1">
                <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Technology Stack</span>
                <p className="font-semibold text-slate-800 dark:text-slate-200">{m.technologies}</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-brand-50/50 dark:bg-brand-950/40 border border-brand-200/60 dark:border-brand-800/60 space-y-1">
                <span className="text-brand-600 dark:text-brand-400 font-bold uppercase tracking-wider text-[10px] flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-brand-500" /> Advanced Engineering Highlight
                </span>
                <p className="font-semibold text-slate-800 dark:text-slate-200">{m.advanced}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
