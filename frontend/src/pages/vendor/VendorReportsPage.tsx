import React, { useEffect, useState } from 'react';
import { FileText, Download, Filter, Calendar } from 'lucide-react';
import { api } from '../../services/api';

export const VendorReportsPage: React.FC = () => {
  const [reportType, setReportType] = useState('sales');
  const [dateRange, setDateRange] = useState('30d');
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReport = async () => {
      setLoading(true);
      try {
        const res = await api.getReportSummary(reportType, dateRange);
        setReportData(res);
      } catch (err) {
        console.error('Failed to load report', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [reportType, dateRange]);

  const handleDownloadCsv = () => {
    const url = api.getExportCsvUrl(reportType, dateRange);
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header & Export Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span>Automated Reports & Data Export</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Audit sales, stock valuations, and financial summaries with instant CSV exports
          </p>
        </div>

        <button
          onClick={handleDownloadCsv}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center space-x-2 active:scale-95 transition-all self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV Report</span>
        </button>
      </div>

      {/* Toolbar Filters */}
      <div className="p-4 rounded-2xl glass-panel flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Report Type Selector */}
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-slate-500">Report Type:</span>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-semibold text-slate-800 dark:text-slate-200"
          >
            <option value="sales">Sales & Fulfillment Report</option>
            <option value="revenue">Gross Revenue & Margin Report</option>
            <option value="inventory">Warehouse Inventory Valuation</option>
            <option value="customers">Customer Cohorts & Lifetime Value</option>
          </select>
        </div>

        {/* Date Range Selector */}
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-slate-500">Period:</span>
          <div className="p-1 rounded-xl bg-slate-100 dark:bg-slate-800 flex space-x-1">
            {[
              { id: 'today', label: 'Today' },
              { id: '7d', label: '7D' },
              { id: '30d', label: '30D' },
              { id: '90d', label: '90D' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setDateRange(t.id)}
                className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                  dateRange === t.id
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Report Summary Cards */}
      {reportData?.summary && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          {Object.entries(reportData.summary).map(([key, val]) => (
            <div key={key} className="p-5 rounded-2xl glass-card space-y-1">
              <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">
                {key.replace(/_/g, ' ')}
              </span>
              <p className="text-xl font-black text-slate-900 dark:text-white">
                {typeof val === 'number' && key.includes('revenue') || key.includes('profit') || key.includes('valuation') || key.includes('clv')
                  ? `₹${Number(val).toLocaleString('en-IN')}`
                  : String(val)}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Report Data Table Preview */}
      <div className="rounded-3xl glass-panel border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-xs text-slate-400">Loading records...</div>
          ) : !reportData?.data || reportData.data.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">No records found for this period.</div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-slate-400 uppercase tracking-wider font-semibold">
                  {Object.keys(reportData.data[0]).slice(0, 6).map((col) => (
                    <th key={col} className="py-3 px-4">{col.replace(/_/g, ' ')}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
                {reportData.data.slice(0, 25).map((row: any, i: number) => (
                  <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    {Object.keys(reportData.data[0]).slice(0, 6).map((col) => (
                      <td key={col} className="py-2.5 px-4 text-slate-800 dark:text-slate-200">
                        {typeof row[col] === 'number' && (col.includes('price') || col.includes('revenue') || col.includes('profit') || col.includes('valuation') || col.includes('spend'))
                          ? `₹${row[col].toLocaleString('en-IN')}`
                          : String(row[col])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
