import React, { useEffect, useState } from 'react';
import { Boxes, AlertTriangle, Plus, RefreshCw, CheckCircle2, TrendingUp } from 'lucide-react';
import { InventoryItem } from '../../types';
import { api } from '../../services/api';

export const VendorInventoryPage: React.FC = () => {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Restock modal
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [restockQty, setRestockQty] = useState(25);
  const [restockNotes, setRestockNotes] = useState('Supplier batch restock');

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const [inv, alt] = await Promise.all([
        api.getInventory(),
        api.getLowStockAlerts(),
      ]);
      setItems(inv || []);
      setAlerts(alt || []);
    } catch (err) {
      console.error('Failed to load inventory', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleRestock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem || restockQty <= 0) return;

    try {
      await api.updateStock({
        product_id: selectedItem.product_id,
        quantity_change: Number(restockQty),
        change_type: 'RESTOCK',
        notes: restockNotes,
      });
      setSelectedItem(null);
      fetchInventory();
    } catch (err) {
      alert('Failed to update stock: ' + (err as Error).message);
    }
  };

  const totalUnits = items.reduce((sum, i) => sum + i.current_stock, 0);
  const totalValuation = items.reduce((sum, i) => sum + i.stock_value, 0);
  const lowStockCount = items.filter((i) => i.is_low_stock).length;

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          Inventory Intelligence & Health
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Monitor safety thresholds, warehouse turnover ratios, and prevent stockouts
        </p>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl glass-card space-y-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Units in Stock</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{totalUnits.toLocaleString('en-IN')}</p>
        </div>
        <div className="p-5 rounded-2xl glass-card space-y-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Inventory Valuation</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white">₹{totalValuation.toLocaleString('en-IN')}</p>
        </div>
        <div className="p-5 rounded-2xl glass-card space-y-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Low Stock SKUs</span>
          <p className={`text-2xl font-black ${lowStockCount > 0 ? 'text-amber-500' : 'text-emerald-500'}`}>
            {lowStockCount}
          </p>
        </div>
        <div className="p-5 rounded-2xl glass-card space-y-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Average Turnover Velocity</span>
          <p className="text-2xl font-black text-indigo-500">2.8x / quarter</p>
        </div>
      </div>

      {/* Low Stock Alerts Banner */}
      {alerts.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 space-y-2">
          <div className="flex items-center space-x-2 text-xs font-bold text-amber-600 dark:text-amber-400">
            <AlertTriangle className="w-4 h-4" />
            <span>Active Low Stock Warnings ({alerts.length})</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {alerts.map((alt, idx) => (
              <div key={idx} className="p-2.5 rounded-xl bg-white/60 dark:bg-slate-900/60 border border-amber-500/20 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-slate-800 dark:text-slate-200">{alt.product_name}</p>
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">{alt.message}</span>
                </div>
                <button
                  onClick={() => {
                    const item = items.find((i) => i.product_id === alt.product_id);
                    if (item) setSelectedItem(item);
                  }}
                  className="px-2.5 py-1 text-[11px] font-bold bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors shadow-2xs shrink-0"
                >
                  Restock
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inventory Table */}
      <div className="rounded-3xl glass-panel border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Product Name</th>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">Current Stock</th>
                <th className="py-3 px-4">Threshold</th>
                <th className="py-3 px-4">Turnover Rate</th>
                <th className="py-3 px-4">Valuation</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {items.map((item) => (
                <tr key={item.product_id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-white max-w-xs truncate">
                    {item.product_name}
                  </td>
                  <td className="py-3 px-4 text-slate-500 dark:text-slate-400">{item.sku}</td>
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{item.current_stock}</td>
                  <td className="py-3 px-4 text-slate-500">{item.low_stock_threshold} units</td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{item.turnover_rate}x</td>
                  <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                    ₹{item.stock_value.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      item.status === 'Out of Stock'
                        ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300'
                        : item.status === 'Low Stock'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setSelectedItem(item)}
                      className="px-3 py-1 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-semibold shadow-2xs"
                    >
                      + Restock
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Restock Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md p-6 rounded-3xl glass-panel shadow-2xl space-y-4 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Restock {selectedItem.product_name}
            </h3>
            <p className="text-xs text-slate-400">
              Current Stock: <strong>{selectedItem.current_stock} units</strong>
            </p>

            <form onSubmit={handleRestock} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Add Quantity Units:
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={restockQty}
                  onChange={(e) => setRestockQty(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Log Notes / Supplier PO:
                </label>
                <input
                  type="text"
                  value={restockNotes}
                  onChange={(e) => setRestockNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold shadow-md"
                >
                  Confirm Restock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
