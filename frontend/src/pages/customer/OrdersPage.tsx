import React, { useEffect, useState } from 'react';
import { Package, Clock, CheckCircle2, ChevronRight, AlertCircle } from 'lucide-react';
import { Order } from '../../types';
import { api } from '../../services/api';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';

export const OrdersPage: React.FC<{ onNavigateStore: () => void }> = ({ onNavigateStore }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getMyOrders()
      .then((res) => setOrders(res || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'DELIVERED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">Delivered</span>;
      case 'SHIPPED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">Shipped</span>;
      case 'PROCESSING':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300">Processing</span>;
      case 'CONFIRMED':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300">Confirmed</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300">{status}</span>;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">Your Order History</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Track packages, view item receipts, and monitor delivery fulfillment
        </p>
      </div>

      {loading ? (
        <LoadingSkeleton count={4} height="h-32" />
      ) : orders.length === 0 ? (
        <EmptyState
          title="No Orders Placed Yet"
          description="You haven't made any purchases yet. Browse the catalog and find something exceptional!"
          actionText="Browse Catalog"
          onAction={onNavigateStore}
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="p-6 rounded-3xl glass-card space-y-4 border border-slate-200 dark:border-slate-800 shadow-sm"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-black text-slate-900 dark:text-white">
                      #{order.order_number}
                    </span>
                    {getStatusBadge(order.status)}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Placed on {new Date(order.created_at).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                  </p>
                </div>
                <div className="text-right sm:text-right">
                  <p className="text-base font-extrabold text-slate-900 dark:text-white">
                    ₹{order.total_amount?.toLocaleString('en-IN')}
                  </p>
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">
                    ● {order.payment_status} via {order.payment_method}
                  </span>
                </div>
              </div>

              {/* Items in this order */}
              <div className="space-y-2">
                {order.items.map((item) => (
                  <div key={item.id} className="flex justify-between items-center text-xs py-1">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 rounded-full bg-brand-500" />
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {item.product_name}
                      </span>
                      <span className="text-slate-400">× {item.quantity}</span>
                    </div>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      ₹{item.subtotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
