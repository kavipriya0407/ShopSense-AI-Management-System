import React, { useEffect, useState } from 'react';
import {
  Sparkles, ArrowRight, ShieldCheck, Truck, RotateCcw,
  Zap, TrendingUp, Search, Layers, Star
} from 'lucide-react';
import { Product, Category } from '../../types';
import { api } from '../../services/api';
import { ProductCard } from '../../components/customer/ProductCard';
import { CardSkeleton } from '../../components/common/LoadingSkeleton';

interface HomePageProps {
  onNavigate: (path: string) => void;
  onSelectProduct: (id: number) => void;
  onSelectCategory: (id: number) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigate,
  onSelectProduct,
  onSelectCategory,
}) => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes] = await Promise.all([
          api.getProducts({ page_size: 8, sort_by: 'featured' }),
          api.getCategories(),
        ]);
        setFeaturedProducts(prodRes.items || []);
        setCategories(catRes || []);
      } catch (err) {
        console.error('Failed to load home page data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onNavigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      onNavigate('/products');
    }
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-8 sm:p-14 shadow-2xl border border-slate-800">
        <div className="absolute -right-20 -top-20 w-96 h-96 rounded-full bg-brand-500/20 blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-96 h-96 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs font-semibold text-brand-300">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Next-Generation AI Multi-Vendor Commerce</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight">
            Turn E-Commerce Data Into{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-brand-400 via-indigo-300 to-cyan-300">
              Smarter Decisions.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
            ShopSense unites multi-vendor marketplace commerce with real-time business intelligence, Holt-Winters demand forecasting, and conversational RAG product discovery.
          </p>

          {/* Interactive Search Bar */}
          <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3 pt-2 max-w-xl">
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search laptops, headphones, 4K drones..."
                className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-400 transition-all"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-500 text-white font-semibold text-sm shadow-lg shadow-brand-500/30 flex items-center justify-center space-x-2 active:scale-95 transition-all"
            >
              <span>Explore Store</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Value Props */}
          <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-medium text-slate-300 border-t border-white/10">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-brand-400" />
              <span>Verified Vendors</span>
            </div>
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>RAG AI Assistant</span>
            </div>
            <div className="flex items-center space-x-2">
              <Truck className="w-4 h-4 text-emerald-400" />
              <span>Express Delivery</span>
            </div>
            <div className="flex items-center space-x-2">
              <RotateCcw className="w-4 h-4 text-amber-400" />
              <span>7-Day Return Policy</span>
            </div>
          </div>
        </div>
      </section>

      {/* Category Pills Carousel */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Shop by Category</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Curated hardware and gadgets across 8 primary categories</p>
          </div>
          <button
            onClick={() => onNavigate('/categories')}
            className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:underline flex items-center"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className="p-3 rounded-2xl glass-card flex flex-col items-center text-center space-y-2 group hover:border-brand-500/40 hover:-translate-y-1 transition-all"
            >
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 relative">
                <img
                  src={cat.image_url || 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=100'}
                  alt={cat.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 line-clamp-1 group-hover:text-brand-600 dark:group-hover:text-brand-400">
                {cat.name}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Featured Products Grid */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="inline-flex items-center space-x-1 text-xs font-bold text-brand-600 dark:text-brand-400 uppercase tracking-wider mb-1">
              <Zap className="w-3.5 h-3.5 fill-brand-500 text-brand-500" />
              <span>Trending Now</span>
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">Featured Hardware & Flagships</h2>
          </div>
          <button
            onClick={() => onNavigate('/products')}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-300 transition-colors"
          >
            Browse All (108 Products)
          </button>
        </div>

        {loading ? (
          <CardSkeleton count={8} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelectProduct={onSelectProduct}
              />
            ))}
          </div>
        )}
      </section>

      {/* AI Assistant Banner Teaser */}
      <section className="rounded-3xl bg-gradient-to-r from-brand-900 via-indigo-900 to-purple-950 p-8 sm:p-12 text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl border border-brand-800/40">
        <div className="space-y-3 max-w-xl">
          <span className="px-3 py-1 rounded-full bg-brand-500/30 border border-brand-400/30 text-xs font-bold text-brand-300 uppercase tracking-wider">
            RAG Product Intelligence
          </span>
          <h3 className="text-2xl sm:text-3xl font-black tracking-tight">
            Need Help Choosing The Perfect Product?
          </h3>
          <p className="text-sm text-slate-300 leading-relaxed">
            Our conversational AI Shopping Assistant indexes our real database catalog. Ask complex questions like: 
            <em className="text-white"> "What is the best laptop for 4K video editing under ₹1,20,000?"</em> and get grounded recommendations with instant product cards.
          </p>
        </div>
        <button
          onClick={() => onNavigate('/assistant')}
          className="px-6 py-3.5 rounded-2xl bg-white text-slate-950 hover:bg-slate-100 font-bold text-sm shadow-xl shrink-0 flex items-center space-x-2 active:scale-95 transition-all"
        >
          <Sparkles className="w-4 h-4 text-brand-600" />
          <span>Launch AI Assistant</span>
        </button>
      </section>

      {/* Platform Live Marketplace Metrics Counter */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-6 rounded-3xl glass-panel text-center">
        <div>
          <p className="text-3xl font-black text-brand-600 dark:text-brand-400">108+</p>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">Active Products</p>
        </div>
        <div>
          <p className="text-3xl font-black text-indigo-600 dark:text-indigo-400">11</p>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">Verified Tech Vendors</p>
        </div>
        <div>
          <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">540+</p>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">Delivered Orders</p>
        </div>
        <div>
          <p className="text-3xl font-black text-cyan-600 dark:text-cyan-400">99.4%</p>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">Positive Sentiment Score</p>
        </div>
      </section>
    </div>
  );
};
