import React, { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { Product } from '../../types';
import { api } from '../../services/api';
import { ProductCard } from '../../components/customer/ProductCard';
import { CardSkeleton } from '../../components/common/LoadingSkeleton';

interface RecommendationsPageProps {
  onSelectProduct: (id: number) => void;
}

export const RecommendationsPage: React.FC<RecommendationsPageProps> = ({ onSelectProduct }) => {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getPersonalizedRecommendations(12)
      .then((res) => setRecommendations(res || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8 pb-16">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/25">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">Recommended For You</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Personalized catalog matches based on category affinity, co-purchasing history, and customer sentiment
          </p>
        </div>
      </div>

      {loading ? (
        <CardSkeleton count={8} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {recommendations.map((item) => (
            <div key={item.id} className="relative flex flex-col">
              <span className="absolute top-2 right-2 z-20 px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-600/90 backdrop-blur-xs text-white shadow-md">
                {item.recommendation_reason || 'Personal Pick'}
              </span>
              <ProductCard
                product={item as Product}
                onSelectProduct={onSelectProduct}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
