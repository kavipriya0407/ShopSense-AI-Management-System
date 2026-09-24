import React from 'react';
import { Star, ShoppingCart, Check, AlertCircle } from 'lucide-react';
import { Product } from '../../types';
import { useCart } from '../../contexts/CartContext';

interface ProductCardProps {
  product: Product;
  onSelectProduct: (productId: number) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onSelectProduct }) => {
  const { addToCart, items } = useCart();
  const inCart = items.some((item) => item.product.id === product.id);

  const discount = product.compare_at_price && product.compare_at_price > product.price
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
    : null;

  const isLowStock = product.stock > 0 && product.stock <= product.low_stock_threshold;
  const isOutOfStock = product.stock <= 0;

  return (
    <div className="group relative rounded-2xl glass-card overflow-hidden flex flex-col h-full hover:border-brand-500/50 hover:shadow-glow transition-all duration-300">
      {/* Discount & Stock Badges */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
        {discount && (
          <span className="px-2.5 py-1 text-[11px] font-black rounded-lg bg-red-600 text-white shadow-sm">
            {discount}% OFF
          </span>
        )}
        {isLowStock && (
          <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-amber-500/90 text-white shadow-sm backdrop-blur-xs flex items-center gap-1">
            <AlertCircle className="w-3 h-3" /> Only {product.stock} left
          </span>
        )}
        {isOutOfStock && (
          <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-slate-800 text-slate-300 shadow-sm">
            Out of Stock
          </span>
        )}
      </div>

      {/* Product Image */}
      <div
        onClick={() => onSelectProduct(product.id)}
        className="w-full h-52 overflow-hidden bg-slate-100 dark:bg-slate-800/50 cursor-pointer relative"
      >
        <img
          src={product.image_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600'}
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Vendor */}
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
            <span className="font-medium text-brand-600 dark:text-brand-400 truncate max-w-[120px]">
              {product.category_name || 'Electronics'}
            </span>
            <span className="truncate max-w-[100px] text-slate-400">
              {product.vendor_name || 'Verified Vendor'}
            </span>
          </div>

          {/* Product Title */}
          <h3
            onClick={() => onSelectProduct(product.id)}
            className="text-sm font-bold text-slate-900 dark:text-white line-clamp-2 hover:text-brand-600 dark:hover:text-brand-400 cursor-pointer transition-colors"
          >
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center space-x-1.5 mt-2">
            <div className="flex items-center text-amber-400">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
              <span className="text-xs font-bold ml-1 text-slate-800 dark:text-slate-200">
                {product.rating.toFixed(1)}
              </span>
            </div>
            <span className="text-[11px] text-slate-400">
              ({product.review_count})
            </span>
          </div>
        </div>

        {/* Pricing & Add to Cart */}
        <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
          <div>
            <div className="text-base font-extrabold text-slate-900 dark:text-white">
              ₹{product.price.toLocaleString('en-IN')}
            </div>
            {product.compare_at_price && (
              <div className="text-xs text-slate-400 line-through">
                ₹{product.compare_at_price.toLocaleString('en-IN')}
              </div>
            )}
          </div>

          <button
            onClick={() => addToCart(product, 1)}
            disabled={isOutOfStock}
            className={`p-2.5 rounded-xl flex items-center justify-center transition-all ${
              isOutOfStock
                ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                : inCart
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                : 'bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-500/20 active:scale-95'
            }`}
            title={isOutOfStock ? 'Out of Stock' : inCart ? 'Added to Cart' : 'Add to Cart'}
          >
            {inCart ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
};
