import React, { useEffect, useState } from 'react';
import { Store, ShieldCheck, ShieldAlert, Star } from 'lucide-react';
import { api } from '../../services/api';

export const AdminVendorsPage: React.FC = () => {
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVendors = async () => {
    setLoading(true);
    try {
      const res = await api.getVendors();
      setVendors(res || []);
    } catch (err) {
      console.error('Failed to load vendors', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleToggleVerify = async (id: number) => {
    try {
      await api.toggleVendorVerify(id);
      fetchVendors();
    } catch (err) {
      alert('Verification update failed: ' + (err as Error).message);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">Vendor Directory & Moderation</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Approve, audit, and toggle verification trust badges for marketplace merchants
        </p>
      </div>

      <div className="rounded-3xl glass-panel border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Merchant Store</th>
                <th className="py-3 px-4">Rating</th>
                <th className="py-3 px-4">Catalog Size</th>
                <th className="py-3 px-4">Platform Fee</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Moderation Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {vendors.map((v) => (
                <tr key={v.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="py-3 px-4">
                    <p className="font-bold text-slate-900 dark:text-white">{v.store_name}</p>
                    <span className="text-[10px] text-slate-400 truncate block max-w-xs">{v.description}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                    ⭐ {v.rating}
                  </td>
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300 font-semibold">
                    {v.product_count} products
                  </td>
                  <td className="py-3 px-4 text-slate-700 dark:text-slate-300">
                    {Math.round(v.commission_rate * 100)}%
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      v.is_verified
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    }`}>
                      {v.is_verified ? 'Verified Active' : 'Pending Review'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleToggleVerify(v.id)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                        v.is_verified
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                          : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs'
                      }`}
                    >
                      {v.is_verified ? 'Revoke Badge' : 'Grant Verified'}
                    </button>
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
