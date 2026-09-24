import React, { useEffect, useState } from 'react';
import { Package, Search, ExternalLink } from 'lucide-react';
import { api } from '../../services/api';

export const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.getProducts({ page_size: 50 })
      .then((res) => setProducts(res.items || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      (p.vendor_name && p.vendor_name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6 pb-16">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">Platform Product Catalog Moderation</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Audit product listings, vendor attribution, and catalog pricing across all merchants
          </p>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search catalog..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
          />
        </div>
      </div>

      <div className="rounded-3xl glass-panel border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Item</th>
                <th className="py-3 px-4">Merchant Vendor</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Stock</th>
                <th className="py-3 px-4">Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-white max-w-xs truncate">
                    {p.name}
                  </td>
                  <td className="py-3 px-4 font-semibold text-brand-600 dark:text-brand-400">
                    {p.vendor_name}
                  </td>
                  <td className="py-3 px-4 text-slate-500">{p.category_name}</td>
                  <td className="py-3 px-4 font-black text-slate-900 dark:text-white">
                    ₹{p.price.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4">{p.stock} units</td>
                  <td className="py-3 px-4">⭐ {p.rating}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
