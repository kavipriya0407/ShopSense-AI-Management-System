import React, { useEffect, useState } from 'react';
import { Layers, ArrowRight } from 'lucide-react';
import { Category } from '../../types';
import { api } from '../../services/api';

interface CategoriesPageProps {
  onSelectCategory: (id: number) => void;
}

export const CategoriesPage: React.FC<CategoriesPageProps> = ({ onSelectCategory }) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getCategories()
      .then((res) => setCategories(res || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8 pb-16">
      <div>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white">Shop By Category</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Explore specialized departments from verified consumer electronics and hardware vendors
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-64 rounded-3xl bg-slate-200 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((cat) => (
            <div
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className="group relative rounded-3xl overflow-hidden glass-card cursor-pointer hover:shadow-xl hover:border-brand-500/40 hover:-translate-y-1 transition-all duration-300 flex flex-col h-72"
            >
              <img
                src={cat.image_url || 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600'}
                alt={cat.name}
                className="w-full h-44 object-cover object-center group-hover:scale-105 transition-transform duration-500"
              />
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                    {cat.description || 'Explore products in this category'}
                  </p>
                </div>
                <div className="flex items-center justify-between text-xs font-semibold text-brand-600 dark:text-brand-400 pt-2">
                  <span>Browse Department</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
