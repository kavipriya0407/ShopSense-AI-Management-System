import React, { useState } from 'react';
import { Database, Sparkles, Send, ShieldCheck, Code, BarChart3, Table as TableIcon, CheckCircle2 } from 'lucide-react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import { api } from '../../services/api';
import { TextToSQLResponse } from '../../types';

const SAMPLE_QUESTIONS = [
  "What are my best-selling products?",
  "Which category generates the most revenue?",
  "Which products should I restock right now?",
  "What was my revenue and order volume trend?",
  "What is the customer distribution by segment?",
  "Why did sales decrease in certain categories?"
];

const COLORS = ['#6366F1', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4'];

export const VendorAIAnalystPage: React.FC = () => {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TextToSQLResponse | null>(null);

  const handleAsk = async (queryText: string) => {
    const q = queryText.trim();
    if (!q || loading) return;

    setQuestion(q);
    setLoading(true);
    try {
      const res = await api.analyzeDataSQL(q);
      setResult(res);
    } catch (err) {
      alert('AI Query notice: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-20 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-cyan-400 flex items-center justify-center text-white shadow-xl shadow-brand-500/25">
          <Database className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span>AI Data Analyst</span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300">
              Safe Text-to-SQL
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Ask complex business questions in natural language. AST parser strictly enforces read-only execution with zero destructive commands.
          </p>
        </div>
      </div>

      {/* Query Bar */}
      <div className="p-6 rounded-3xl glass-panel space-y-4 border border-slate-200 dark:border-slate-800 shadow-sm">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAsk(question);
          }}
          className="flex space-x-2"
        >
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask anything: e.g. What are my best-selling products by revenue?"
            className="flex-1 px-4 py-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
          <button
            type="submit"
            disabled={!question.trim() || loading}
            className="px-6 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-brand-500/20 flex items-center space-x-2 active:scale-95 transition-all"
          >
            <span>{loading ? 'Analyzing...' : 'Run Query'}</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Quick Question Chips */}
        <div>
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
            Suggested Business Queries:
          </span>
          <div className="flex flex-wrap gap-2">
            {SAMPLE_QUESTIONS.map((sq) => (
              <button
                key={sq}
                onClick={() => handleAsk(sq)}
                className="px-3 py-1.5 rounded-xl text-xs font-medium bg-slate-100 hover:bg-brand-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
              >
                {sq}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="p-12 rounded-3xl glass-panel text-center space-y-3 animate-pulse">
          <div className="w-12 h-12 rounded-2xl bg-brand-500/20 text-brand-500 flex items-center justify-center mx-auto animate-spin">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Synthesizing SQL & Querying Database...</h3>
          <p className="text-xs text-slate-400">Parsing AST security tokens and compiling data visualizations</p>
        </div>
      )}

      {/* Query Results */}
      {!loading && result && (
        <div className="space-y-6 animate-scale-up">
          {/* AI Explanation Banner */}
          <div className="p-6 rounded-3xl bg-gradient-to-r from-brand-50 to-indigo-50/60 dark:from-brand-950/60 dark:to-indigo-950/40 border border-brand-200/80 dark:border-brand-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-brand-700 dark:text-brand-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-brand-500" />
                <span>AI Data Findings</span>
              </span>
              <span className="inline-flex items-center text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 rounded-md">
                <ShieldCheck className="w-3 h-3 mr-1" /> Verified Safe SELECT Only
              </span>
            </div>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
              {result.explanation}
            </p>
          </div>

          {/* Generated SQL Code Viewer */}
          <div className="rounded-3xl glass-panel overflow-hidden border border-slate-200 dark:border-slate-800">
            <div className="px-5 py-3 bg-slate-100 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700/60 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5 font-mono">
                <Code className="w-3.5 h-3.5 text-brand-500" />
                <span>Generated SQL Query</span>
              </span>
              <span className="text-[10px] text-slate-400 font-mono">READ-ONLY EXECUTION</span>
            </div>
            <pre className="p-4 text-xs font-mono text-emerald-600 dark:text-emerald-400 bg-slate-950 overflow-x-auto">
              <code>{result.generated_sql}</code>
            </pre>
          </div>

          {/* Interactive Chart Visualizer */}
          {result.rows.length > 0 && result.chart_type !== 'table' && (
            <div className="p-6 rounded-3xl glass-panel space-y-4 border border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-brand-500" />
                <span>Data Visualization</span>
              </h3>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  {result.chart_type === 'pie' ? (
                    <PieChart>
                      <Pie
                        data={result.rows}
                        dataKey={result.chart_config?.y_key || result.columns[1]}
                        nameKey={result.chart_config?.x_key || result.columns[0]}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={3}
                      >
                        {result.rows.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', fontSize: '11px', color: '#fff' }}
                      />
                    </PieChart>
                  ) : result.chart_type === 'line' ? (
                    <LineChart data={result.rows} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                      <XAxis dataKey={result.chart_config?.x_key || result.columns[0]} tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', fontSize: '11px', color: '#fff' }} />
                      <Line type="monotone" dataKey={result.chart_config?.y_key || result.columns[1]} stroke="#6366F1" strokeWidth={2.5} />
                    </LineChart>
                  ) : (
                    <BarChart data={result.rows} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                      <XAxis dataKey={result.chart_config?.x_key || result.columns[0]} tick={{ fontSize: 10 }} />
                      <YAxis tick={{ fontSize: 10 }} />
                      <Tooltip contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', fontSize: '11px', color: '#fff' }} />
                      <Bar dataKey={result.chart_config?.y_key || result.columns[1]} fill="#6366F1" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Data Table */}
          <div className="p-6 rounded-3xl glass-panel space-y-3 border border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <TableIcon className="w-4 h-4 text-brand-500" />
              <span>Result Records ({result.rows.length} rows)</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                    {result.columns.map((col, idx) => (
                      <th key={idx} className="pb-2.5 px-3">{col}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                  {result.rows.map((row, rIdx) => (
                    <tr key={rIdx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      {result.columns.map((col, cIdx) => (
                        <td key={cIdx} className="py-2.5 px-3 text-slate-800 dark:text-slate-200">
                          {String(row[col])}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
