import React, { useState } from 'react';
import { ShoppingBag, CreditCard, CheckCircle2, ShieldCheck, ArrowRight, Truck } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';

interface CheckoutPageProps {
  onNavigateOrders: () => void;
  onNavigateStore: () => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onNavigateOrders, onNavigateStore }) => {
  const { items, subtotal, tax, total, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();

  const [fullName, setFullName] = useState(user?.full_name || 'Aditi Sharma');
  const [phone, setPhone] = useState('9876543210');
  const [address, setAddress] = useState('Flat 402, Skyline Towers, Indiranagar');
  const [city, setCity] = useState('Bengaluru');
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<any>(null);

  if (items.length === 0 && !orderSuccess) {
    return (
      <div className="max-w-xl mx-auto text-center py-20 space-y-4">
        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mx-auto flex items-center justify-center text-slate-400">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Your Cart is Empty</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Add some high-performance products before proceeding to checkout.
        </p>
        <button
          onClick={onNavigateStore}
          className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-md"
        >
          Explore Catalog
        </button>
      </div>
    );
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderPayload = {
        items: items.map((i) => ({
          product_id: i.product.id,
          quantity: i.quantity,
        })),
        shipping_address: {
          full_name: fullName,
          phone,
          address,
          city,
          country: 'India',
        },
        payment_method: paymentMethod,
        notes: 'Simulated ShopSense checkout transaction',
      };

      const result = await api.createOrder(orderPayload);
      clearCart();
      setOrderSuccess(result);
    } catch (err) {
      alert('Checkout failed: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="max-w-xl mx-auto py-16 text-center space-y-6 animate-scale-up">
        <div className="w-20 h-20 rounded-3xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-xl">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
            Payment Confirmed
          </span>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white">Thank You For Your Order!</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Order Reference: <strong className="text-slate-900 dark:text-white">{orderSuccess.order_number}</strong>
          </p>
        </div>

        <div className="p-6 rounded-2xl glass-card text-left text-xs space-y-2">
          <div className="flex justify-between text-slate-600 dark:text-slate-400">
            <span>Total Paid</span>
            <span className="font-bold text-slate-900 dark:text-white">₹{orderSuccess.total_amount?.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between text-slate-600 dark:text-slate-400">
            <span>Delivery Address</span>
            <span>{city}, India</span>
          </div>
          <div className="flex justify-between text-slate-600 dark:text-slate-400">
            <span>Estimated Delivery</span>
            <span className="text-emerald-500 font-semibold">2-3 Business Days</span>
          </div>
        </div>

        <div className="flex justify-center space-x-3 pt-4">
          <button
            onClick={onNavigateOrders}
            className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-md flex items-center space-x-2"
          >
            <span>View Order History</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={onNavigateStore}
            className="px-6 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-20">
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">Checkout Simulation</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Review your items, provide shipping information, and confirm your transaction
        </p>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Shipping & Payment Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Shipping Address */}
          <div className="p-6 rounded-3xl glass-panel space-y-4 border border-slate-200 dark:border-slate-800">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Truck className="w-4 h-4 text-brand-500" />
              <span>Shipping Information</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Contact Phone</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Street Address</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">City</label>
                <input
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Country</label>
                <input
                  type="text"
                  disabled
                  value="India"
                  className="w-full px-3 py-2 rounded-xl bg-slate-200 dark:bg-slate-800/50 border border-slate-300 dark:border-slate-700 text-xs cursor-not-allowed opacity-75"
                />
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="p-6 rounded-3xl glass-panel space-y-4 border border-slate-200 dark:border-slate-800">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-brand-500" />
              <span>Payment Gateway Simulation</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { name: 'Credit Card', desc: 'Visa / Mastercard / Amex' },
                { name: 'UPI', desc: 'GooglePay / PhonePe / Paytm' },
                { name: 'Net Banking', desc: 'All Major Indian Banks' },
              ].map((p) => (
                <div
                  key={p.name}
                  onClick={() => setPaymentMethod(p.name)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    paymentMethod === p.name
                      ? 'border-brand-500 bg-brand-50/70 dark:bg-brand-950/50 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                  }`}
                >
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{p.name}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{p.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl glass-panel space-y-4 border border-slate-200 dark:border-slate-800">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Order Summary</h2>

            {/* Item list */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {items.map(({ product, quantity }) => (
                <div key={product.id} className="flex justify-between items-center text-xs">
                  <div className="flex-1 pr-2 truncate">
                    <p className="font-semibold text-slate-900 dark:text-white truncate">{product.name}</p>
                    <span className="text-slate-400">Qty: {quantity}</span>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white shrink-0">
                    ₹{(product.price * quantity).toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (5% GST)</span>
                <span>₹{tax.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="text-emerald-500 font-semibold">Free Express</span>
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between text-base font-black text-slate-900 dark:text-white">
                <span>Total</span>
                <span>₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-sm shadow-xl shadow-brand-500/25 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              {loading ? 'Processing Order...' : `Pay ₹${total.toLocaleString('en-IN')}`}
            </button>

            <div className="flex items-center justify-center space-x-1.5 text-[11px] text-slate-400 pt-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>256-Bit Encrypted Secure Checkout</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
