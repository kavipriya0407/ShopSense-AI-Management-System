import React, { useState } from 'react';
import { Sparkles, Lock, Mail, ArrowRight, Shield, Store, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface LoginPageProps {
  onNavigateRegister: () => void;
  onSuccess: () => void;
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
      onSuccess();
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
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Sign In to ShopSense</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Access your customer cart, vendor dashboard, or admin control hub
        </p>
      </div>

      {/* 1-Click Quick Demo Switcher Buttons */}
      <div className="p-4 rounded-2xl glass-panel border border-slate-200 dark:border-slate-800 space-y-2.5">
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block text-center">
          ⚡ 1-Click Quick Demo Sign In
        </span>
        <div className="grid grid-cols-3 gap-2">
          <button
            type="button"
            onClick={() => handleDemoLogin('customer')}
            className="p-2.5 rounded-xl bg-cyan-50 dark:bg-cyan-950/50 hover:bg-cyan-100 dark:hover:bg-cyan-900/60 border border-cyan-200 dark:border-cyan-800 text-cyan-800 dark:text-cyan-200 text-xs font-bold flex flex-col items-center gap-1 transition-all active:scale-95"
          >
            <UserIcon className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span>Customer</span>
          </button>
          <button
            type="button"
            onClick={() => handleDemoLogin('vendor')}
            className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 text-indigo-800 dark:text-indigo-200 text-xs font-bold flex flex-col items-center gap-1 transition-all active:scale-95"
          >
            <Store className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span>Vendor</span>
          </button>
          <button
            type="button"
            onClick={() => handleDemoLogin('admin')}
            className="p-2.5 rounded-xl bg-purple-50 dark:bg-purple-950/50 hover:bg-purple-100 dark:hover:bg-purple-900/60 border border-purple-200 dark:border-purple-800 text-purple-800 dark:text-purple-200 text-xs font-bold flex flex-col items-center gap-1 transition-all active:scale-95"
          >
            <Shield className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>Admin</span>
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
              placeholder="e.g. customer@shopsense.com"
              className="w-full pl-10 pr-3 py-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
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
              className="w-full pl-10 pr-3 py-2.5 text-xs rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
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
