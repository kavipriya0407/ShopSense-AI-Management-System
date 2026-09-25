import React, { useState } from 'react';
import { Sparkles, Lock, Mail, ArrowRight, Shield, Store, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface LoginPageProps {
  onNavigateRegister: () => void;
  onSuccess: (role?: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigateRegister, onSuccess }) => {
  const { login, quickDemoLogin } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      const isAdm = email.toLowerCase().includes('admin');
      const isVen = email.toLowerCase().includes('vendor');
      onSuccess(isAdm ? 'ADMIN' : isVen ? 'VENDOR' : 'CUSTOMER');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role: string) => {
    setError('');
    setLoading(true);
    try {
      await quickDemoLogin(role);
      onSuccess(role.toUpperCase());
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="max-w-md mx-auto py-12 px-4 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-cyan-400 flex items-center justify-center text-white mx-auto shadow-xl shadow-brand-500/25">
          <Sparkles className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Sign In to ShopSense</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Access your customer cart, vendor dashboard, or admin control hub
        </p>
      </div>

      {/* 1-Click Quick Demo Switcher Buttons */}
      <div className="p-4 rounded-2xl glass-panel border border-slate-200 dark:border-slate-800 space-y-2.5">
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block text-center">
          ⚡ 1-Click Instant Demo Portals
        </span>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            disabled={loading}
            onClick={() => handleDemoLogin('customer')}
            className="p-2.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/50 hover:bg-cyan-100 dark:hover:bg-cyan-900/60 border border-cyan-200 dark:border-cyan-800 text-cyan-800 dark:text-cyan-200 text-xs font-bold flex flex-col items-center gap-1 transition-all active:scale-95 disabled:opacity-50"
          >
            <UserIcon className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span>Customer</span>
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => handleDemoLogin('vendor')}
            className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 text-indigo-800 dark:text-indigo-200 text-xs font-bold flex flex-col items-center gap-1 transition-all active:scale-95 disabled:opacity-50"
          >
            <Store className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Vendor</span>
          </button>
          <button
            type="button"
            disabled={loading}
            onClick={() => handleDemoLogin('admin')}
            className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 dark:hover:bg-purple-900/60 border border-purple-200 dark:border-purple-800 text-purple-800 dark:text-purple-200 text-xs font-bold flex flex-col items-center gap-1 transition-all active:scale-95 disabled:opacity-50 ring-2 ring-purple-500/20 shadow-md shadow-purple-500/10"
          >
            <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span className="flex items-center gap-1">Admin</span>
          </button>
        </div>
      </div>

      {/* Main Login Form */}
      <form onSubmit={handleSubmit} className="p-6 rounded-3xl glass-panel space-y-4 border border-slate-200 dark:border-slate-800 shadow-xl">
        {error && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 text-xs font-medium">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Email Address</label>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. admin@shopsense.com"
              className="w-full pl-10 pr-3 py-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Password</label>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full pl-10 pr-3 py-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white"
            />
          </div>
        </div>

        {/* Demo Credentials Auto-Fill Pill Helpers */}
        <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-1.5 text-[11px]">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Click to Autofill Credentials:</span>
          <div className="flex flex-wrap gap-1.5">
            <button
              type="button"
              onClick={() => fillCredentials('admin@shopsense.com', 'ShopSense@123')}
              className="px-2 py-1 rounded-lg bg-purple-100 dark:bg-purple-950/70 text-purple-700 dark:text-purple-300 hover:bg-purple-200 font-medium transition-colors"
            >
              👑 Admin (admin@shopsense.com)
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('vendor@shopsense.com', 'ShopSense@123')}
              className="px-2 py-1 rounded-lg bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 font-medium transition-colors"
            >
              🏪 Vendor (vendor@shopsense.com)
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('customer@shopsense.com', 'ShopSense@123')}
              className="px-2 py-1 rounded-lg bg-cyan-100 dark:bg-cyan-950/70 text-cyan-700 dark:text-cyan-300 hover:bg-cyan-200 font-medium transition-colors"
            >
              🛒 Customer (customer@shopsense.com)
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-2xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-bold text-xs shadow-lg shadow-brand-500/25 flex items-center justify-center space-x-1.5 active:scale-95 transition-all"
        >
          <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>

        <div className="pt-2 text-center text-xs text-slate-500">
          <span>Don't have an account? </span>
          <button
            type="button"
            onClick={onNavigateRegister}
            className="text-brand-600 dark:text-brand-400 font-semibold hover:underline"
          >
            Create one now
          </button>
        </div>
      </form>
    </div>
  );
};
