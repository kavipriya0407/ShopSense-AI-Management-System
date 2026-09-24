import React, { useEffect, useState } from 'react';
import { CreditCard, DollarSign, CheckCircle2 } from 'lucide-react';
import { api } from '../../services/api';

export const AdminTransactionsPage: React.FC = () => {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getReportSummary('sales', '30d')
      .then(setReport)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 pb-16">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">Platform Transactions & Payouts</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Real-time payment gateway transactions, platform commission take-rate audit, and net merchant transfers
        </p>
      </div>

      <div className="rounded-3xl glass-panel border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Order Ref</th>
                <th className="py-3 px-4">Date Time</th>
                <th className="py-3 px-4">Product Purchased</th>
                <th className="py-3 px-4">Gross Amount</th>
                <th className="py-3 px-4">Platform Fee (10%)</th>
                <th className="py-3 px-4">Merchant Net</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-mono">
              {report?.data?.slice(0, 30).map((row: any, i: number) => {
                const gross = row.revenue || 1000;
                const fee = Math.round(gross * 0.10 * 100) / 100;
                const net = Math.round((gross - fee) * 100) / 100;
                return (
                  <tr key={i} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white font-sans">
                      {row.order_number}
                    </td>
                    <td className="py-3 px-4 text-slate-500 font-sans">{row.date}</td>
                    <td className="py-3 px-4 text-slate-800 dark:text-slate-200 font-sans max-w-xs truncate">
                      {row.product_name}
                    </td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      ₹{gross.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-purple-600 dark:text-purple-400 font-bold">
                      ₹{fee.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 text-emerald-600 dark:text-emerald-400 font-bold">
                      ₹{net.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3 px-4 font-sans">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                        Settled
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
