import React, { useEffect, useState } from 'react';
import { Users, Crown, Award, UserCheck, Clock, UserX, Sparkles } from 'lucide-react';
import { api } from '../../services/api';
import { CustomerSegmentItem } from '../../types';

export const VendorCustomersPage: React.FC = () => {
  const [segments, setSegments] = useState<CustomerSegmentItem[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSegment, setSelectedSegment] = useState<string>('ALL');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [segRes, custList] = await Promise.all([
          api.getCustomerSegments(),
          api.getVendorCustomers(),
        ]);
        setSegments(segRes || []);
        setCustomers(custList || []);
      } catch (err) {
        console.error('Failed to load customer analytics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredCustomers = selectedSegment === 'ALL'
    ? customers
    : customers.filter((c) => c.segment === selectedSegment);

  return (
    <div className="space-y-8 pb-16">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">Customer Analytics & RFM Segments</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Recency, Frequency, and Monetary scoring algorithms segmenting buyer behaviors and predicted lifetime value
        </p>
      </div>

      {/* Segment Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {segments.map((seg) => (
          <div
            key={seg.segment}
            onClick={() => setSelectedSegment(selectedSegment === seg.segment ? 'ALL' : seg.segment)}
            className={`p-5 rounded-2xl glass-card cursor-pointer border transition-all ${
              selectedSegment === seg.segment
                ? 'border-brand-500 ring-2 ring-brand-500/20 shadow-md'
                : 'border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider" style={{ color: seg.color }}>
                {seg.label}
              </span>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: seg.color }} />
            </div>

            <div className="mt-3 flex items-baseline justify-between">
              <p className="text-2xl font-black text-slate-900 dark:text-white">{seg.count} buyers</p>
              <span className="text-xs font-bold text-slate-500">₹{seg.total_spend.toLocaleString('en-IN')} total</span>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 line-clamp-2">
              {seg.description}
            </p>
          </div>
        ))}
      </div>

      {/* Customer Directory Table */}
      <div className="p-6 rounded-3xl glass-panel space-y-4 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Customer Directory</h3>
            <p className="text-xs text-slate-400">
              Showing {filteredCustomers.length} customers {selectedSegment !== 'ALL' ? `in ${selectedSegment}` : ''}
            </p>
          </div>
          {selectedSegment !== 'ALL' && (
            <button
              onClick={() => setSelectedSegment('ALL')}
              className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline"
            >
              Clear Filter
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="pb-3 px-3">Customer</th>
                <th className="pb-3 px-3">City</th>
                <th className="pb-3 px-3 text-center">Orders</th>
                <th className="pb-3 px-3 text-right">Total Spend</th>
                <th className="pb-3 px-3">Segment</th>
                <th className="pb-3 px-3 text-right">Estimated CLV</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredCustomers.slice(0, 30).map((c) => (
                <tr key={c.customer_id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="py-3 px-3">
                    <p className="font-bold text-slate-900 dark:text-white">{c.name}</p>
                    <span className="text-[10px] text-slate-400">{c.email}</span>
                  </td>
                  <td className="py-3 px-3 text-slate-600 dark:text-slate-400">{c.city}</td>
                  <td className="py-3 px-3 text-center font-bold text-slate-900 dark:text-white">
                    {c.frequency}
                  </td>
                  <td className="py-3 px-3 text-right font-extrabold text-slate-900 dark:text-white">
                    ₹{c.monetary.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {c.segment}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-black text-emerald-600 dark:text-emerald-400">
                    ₹{c.clv?.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
