import React, { useState } from 'react';
import {
  ShoppingBag, Sparkles, LayoutDashboard, Shield,
  User as UserIcon, LogOut, ChevronDown, Bell, Search
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { ThemeToggle } from './ThemeToggle';

interface NavbarProps {
  currentPath: string;
  onNavigate: (path: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentPath, onNavigate }) => {
  const { user, isAuthenticated, isAdmin, isVendor, logout, quickDemoLogin } = useAuth();
  const { totalItems, toggleCart } = useCart();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Store', path: '/' },
    { name: 'Catalog', path: '/products' },
    { name: 'Categories', path: '/categories' },
    { name: 'Recommendations', path: '/recommendations' },
    { name: 'AI Assistant', path: '/assistant', highlight: true },
    { name: 'Milestones', path: '/milestones' },
  ];

  return (
    <header className="sticky top-0 z-40 glass-panel border-b border-slate-200/80 dark:border-slate-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Identity */}
        <div className="flex items-center space-x-8">
          <button
            onClick={() => onNavigate('/')}
            className="flex items-center space-x-3 text-left focus:outline-none group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-cyan-400 flex items-center justify-center text-white shadow-md shadow-brand-500/25 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white flex items-center">
                Shop<span className="text-brand-600 dark:text-brand-400">Sense</span>
              </span>
              <span className="text-[10px] block font-semibold text-slate-500 dark:text-slate-400 tracking-wider uppercase">
                AI Commerce & BI
              </span>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => {
              const isActive = currentPath === link.path;
              return (
                <button
                  key={link.path}
                  onClick={() => onNavigate(link.path)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors relative ${
                    isActive
                      ? 'text-brand-600 dark:text-brand-400 bg-brand-50/70 dark:bg-brand-950/50 font-semibold'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/60 dark:hover:bg-slate-800/60'
                  }`}
                >
                  {link.name}
                  {link.highlight && (
                    <span className="ml-1.5 px-1.5 py-0.5 text-[10px] font-bold rounded-full bg-gradient-to-r from-brand-500 to-cyan-500 text-white animate-pulse">
                      AI
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Right Section Controls */}
        <div className="flex items-center space-x-3">
          {/* Direct Portal Switcher Badges */}
          {isAuthenticated && (isVendor || isAdmin) && (
            <button
              onClick={() => onNavigate(isVendor ? '/vendor/dashboard' : '/admin/dashboard')}
              className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/80 text-xs font-semibold hover:bg-indigo-100 transition-colors"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>{isVendor ? 'Vendor Portal' : 'Admin Portal'}</span>
            </button>
          )}

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Cart Trigger */}
          <button
            onClick={() => toggleCart(true)}
            className="p-2 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
            title="Shopping Cart"
          >
            <ShoppingBag className="w-5 h-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-brand-600 text-white text-xs font-bold flex items-center justify-center animate-scale-up">
                {totalItems}
              </span>
            )}
          </button>

          {/* Auth State & Demo Quick Login Dropdown */}
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center space-x-2 p-1.5 pl-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-slate-200 dark:border-slate-800"
              >
                <div className="w-7 h-7 rounded-lg bg-brand-500 text-white flex items-center justify-center font-bold text-xs">
                  {user.full_name?.charAt(0) || 'U'}
                </div>
                <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 hidden md:block max-w-[100px] truncate">
                  {user.full_name}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {userMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-52 rounded-xl glass-panel shadow-xl py-2 border border-slate-200 dark:border-slate-800 text-sm z-50 animate-scale-up"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-800">
                    <p className="font-semibold text-slate-900 dark:text-white">{user.full_name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300">
                      {user.role}
                    </span>
                  </div>

                  <button
                    onClick={() => onNavigate('/orders')}
                    className="w-full text-left px-4 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center space-x-2"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    <span>My Orders</span>
                  </button>

                  {isVendor && (
                    <button
                      onClick={() => onNavigate('/vendor/dashboard')}
                      className="w-full text-left px-4 py-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 flex items-center space-x-2"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      <span>Vendor Dashboard</span>
                    </button>
                  )}

                  {isAdmin && (
                    <button
                      onClick={() => onNavigate('/admin/dashboard')}
                      className="w-full text-left px-4 py-2 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/50 flex items-center space-x-2"
                    >
                      <Shield className="w-4 h-4" />
                      <span>Admin Control Hub</span>
                    </button>
                  )}

                  <div className="border-t border-slate-200 dark:border-slate-800 my-1" />

                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center space-x-2"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onNavigate('/login')}
                className="px-4 py-2 text-sm font-semibold rounded-xl bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-500/20 active:scale-95 transition-all"
              >
                Sign In
              </button>

              {/* Quick 1-Click Demo Login Switcher */}
              <div className="relative">
                <button
                  onClick={() => setDemoMenuOpen(!demoMenuOpen)}
                  className="px-3 py-2 text-xs font-semibold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center space-x-1"
                  title="Test as Demo User"
                >
                  <span>Demo Login</span>
                  <ChevronDown className="w-3 h-3" />
                </button>

                {demoMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-48 rounded-xl glass-panel shadow-xl py-2 border border-slate-200 dark:border-slate-800 text-xs z-50"
                    onClick={() => setDemoMenuOpen(false)}
                  >
                    <p className="px-3 py-1 font-bold text-slate-400 uppercase tracking-wider text-[10px]">
                      Instant Demo Switcher
                    </p>
                    <button
                      onClick={() => quickDemoLogin('customer')}
                      className="w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center space-x-2 text-slate-800 dark:text-slate-200"
                    >
                      <UserIcon className="w-3.5 h-3.5 text-cyan-500" />
                      <span>Customer (Aditi)</span>
                    </button>
                    <button
                      onClick={() => quickDemoLogin('vendor')}
                      className="w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center space-x-2 text-slate-800 dark:text-slate-200"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Vendor (Nexus Tech)</span>
                    </button>
                    <button
                      onClick={() => quickDemoLogin('admin')}
                      className="w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center space-x-2 text-slate-800 dark:text-slate-200"
                    >
                      <Shield className="w-3.5 h-3.5 text-purple-500" />
                      <span>Admin (Platform)</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
