import React, { useState } from 'react';
import { Sparkles, Lock, Mail, User, Store, ArrowRight } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types';

interface RegisterPageProps {
  onNavigateLogin: () => void;
  onSuccess: () => void;
}

export const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigateLogin, onSuccess }) => {
  const { register } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('CUSTOMER');
  const [storeName, setStoreName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register({
        full_name: fullName,
        email,
        password,
        role,
        store_name: role === 'VENDOR' ? storeName : undefined,
      });
      onSuccess();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-cyan-400 flex items-center justify-center text-white mx-auto shadow-xl shadow-brand-500/25">
          <Sparkles className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Create ShopSense Account</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Join the next-generation multi-vendor intelligence platform
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 rounded-3xl glass-panel space-y-4 border border-slate-200 dark:border-slate-800 shadow-xl text-xs">
        {error && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 font-medium">
            {error}
          </div>
        )}

        {/* Role Selection */}
        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Select Account Role:</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setRole('CUSTOMER')}
              className={`p-2.5 rounded-xl border font-bold flex items-center justify-center space-x-2 transition-all ${
                role === 'CUSTOMER'
                  ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400'
                  : 'border-slate-200 dark:border-slate-700 text-slate-500'
              }`}
            >
              <User className="w-4 h-4" />
              <span>Customer</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('VENDOR')}
              className={`p-2.5 rounded-xl border font-bold flex items-center justify-center space-x-2 transition-all ${
                role === 'VENDOR'
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400'
                  : 'border-slate-200 dark:border-slate-700 text-slate-500'
              }`}
            >
              <Store className="w-4 h-4" />
              <span>Merchant Vendor</span>
            </button>
          </div>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="e.g. Aditi Sharma"
            className="w-full px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
          />
        </div>

        {role === 'VENDOR' && (
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Store / Merchant Name *</label>
            <input
              type="text"
              required
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              placeholder="e.g. Apex Audio Labs"
              className="w-full px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
          </div>
        )}

        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            className="w-full px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
          />
        </div>

        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min 8 characters"
            className="w-full px-3 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs shadow-lg shadow-brand-500/25 flex items-center justify-center space-x-1.5 active:scale-95 transition-all"
        >
          <span>{loading ? 'Registering...' : 'Create Account'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <div className="pt-2 text-center text-slate-500">
          <span>Already registered? </span>
          <button
            type="button"
            onClick={onNavigateLogin}
            className="text-brand-600 dark:text-brand-400 font-semibold hover:underline"
          >
            Sign in here
          </button>
        </div>
      </form>
    </div>
  );
};
