import React, { useEffect, useState } from 'react';
import { Store, ShieldCheck, Star, Award, Mail, Phone, MapPin } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { api } from '../../services/api';

export const VendorProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [vendor, setVendor] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.vendor_id) {
      api.getVendor(user.vendor_id)
        .then(setVendor)
        .catch(console.error)
        .finally(() => setLoading(false));
    } else {
      // Fallback to first vendor
      api.getVendors().then((res) => {
        if (res && res.length > 0) setVendor(res[0]);
      }).finally(() => setLoading(false));
    }
  }, [user]);

  if (loading) {
    return <div className="h-96 rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse" />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">Store Profile & Settings</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Public merchant presence, platform commission tiers, and verification credentials
        </p>
      </div>

      <div className="p-8 rounded-3xl glass-panel space-y-6 border border-slate-200 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 text-center sm:text-left">
          <div className="w-24 h-24 rounded-3xl overflow-hidden bg-brand-600 flex items-center justify-center text-white shadow-xl">
            <Store className="w-12 h-12" />
          </div>
          <div>
            <div className="flex items-center justify-center sm:justify-start space-x-2">
              <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                {vendor?.store_name || 'Nexus Tech Hub'}
              </h2>
              {vendor?.is_verified && (
                <span className="inline-flex items-center text-xs font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-full">
                  <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Verified Vendor
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-lg">
              {vendor?.description || 'Official authorized flagship distributor for next-gen consumer technology.'}
            </p>
            <div className="flex items-center justify-center sm:justify-start space-x-4 mt-3 text-xs">
              <span className="flex items-center text-amber-500 font-bold">
                <Star className="w-4 h-4 fill-amber-400 mr-1" />
                {vendor?.rating || 4.9} Merchant Score
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-600 dark:text-slate-300 font-semibold">
                {vendor?.product_count || 12} Active Catalog SKUs
              </span>
            </div>
          </div>
        </div>

        {/* Credentials Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-200 dark:border-slate-800 text-xs">
          <div className="p-4 rounded-2xl glass-card space-y-1">
            <span className="text-slate-400 font-semibold">Platform Commission Rate</span>
            <p className="text-base font-extrabold text-slate-900 dark:text-white">
              {Math.round((vendor?.commission_rate || 0.10) * 100)}% Take Rate
            </p>
          </div>
          <div className="p-4 rounded-2xl glass-card space-y-1">
            <span className="text-slate-400 font-semibold">Account Manager</span>
            <p className="text-base font-extrabold text-slate-900 dark:text-white">
              {user?.full_name || 'Vikram Patel'}
            </p>
          </div>
          <div className="p-4 rounded-2xl glass-card space-y-1">
            <span className="text-slate-400 font-semibold">Settlement Schedule</span>
            <p className="text-base font-extrabold text-emerald-500">
              T+2 Rolling Settlement
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
