import React, { useEffect, useState } from 'react';
import {
  Star, ShoppingBag, Truck, ShieldCheck, ArrowLeft,
  Sparkles, Check, AlertCircle, MessageSquare, ThumbsUp, ThumbsDown
} from 'lucide-react';
import { Product, Review } from '../../types';
import { api } from '../../services/api';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { ProductCard } from '../../components/customer/ProductCard';

interface ProductDetailPageProps {
  productId: number;
  onBack: () => void;
  onSelectProduct: (id: number) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  productId,
  onBack,
  onSelectProduct,
}) => {
  const { addToCart, items } = useCart();
  const { isAuthenticated } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);

  // Review modal state
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const [prod, revs, similar] = await Promise.all([
          api.getProduct(productId),
          api.getProductReviews(productId),
          api.getSimilarProducts(productId, 4),
        ]);
        setProduct(prod);
        setReviews(revs || []);
        setSimilarProducts(similar || []);
      } catch (err) {
        console.error('Failed to load product detail', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [productId]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-12 space-y-8 animate-pulse">
        <div className="h-8 w-40 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          <div className="space-y-4">
            <div className="h-8 w-3/4 bg-slate-200 dark:bg-slate-800 rounded-lg" />
            <div className="h-6 w-1/4 bg-slate-200 dark:bg-slate-800 rounded-lg" />
            <div className="h-32 bg-slate-200 dark:bg-slate-800 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-600 dark:text-slate-400">Product not found.</p>
        <button onClick={onBack} className="mt-4 text-brand-600 font-semibold hover:underline">
          Return to Catalog
        </button>
      </div>
    );
  }

  const inCart = items.some((item) => item.product.id === product.id);
  const discount = product.compare_at_price && product.compare_at_price > product.price
    ? Math.round(((product.compare_at_price - product.price) / product.compare_at_price) * 100)
    : null;

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;
    setSubmittingReview(true);
    try {
      const newRev = await api.submitReview({
        product_id: product.id,
        rating,
        title: reviewTitle,
        comment: reviewComment,
      });
      setReviews((prev) => [newRev, ...prev]);
      setReviewModalOpen(false);
      setReviewComment('');
      setReviewTitle('');
    } catch (err) {
      alert('Failed to submit review: ' + (err as Error).message);
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="space-y-12 pb-20">
      {/* Back button */}
      <button
        onClick={onBack}
        className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Catalog</span>
      </button>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Left: Product Image */}
        <div className="space-y-4">
          <div className="rounded-3xl overflow-hidden glass-panel border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-slate-900 shadow-xl h-96 sm:h-[460px] flex items-center justify-center relative">
            <img
              src={product.image_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800'}
              alt={product.name}
              className="w-full h-full object-cover object-center"
            />
            {discount && (
              <span className="absolute top-4 left-4 px-3 py-1.5 rounded-xl bg-red-600 text-white font-extrabold text-xs shadow-md">
                {discount}% OFF
              </span>
            )}
          </div>
        </div>

        {/* Right: Product Info & Actions */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider mb-2">
              <span>{product.category_name || 'Electronics'}</span>
              <span>•</span>
              <span className="text-slate-500">SKU: {product.sku}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-tight">
              {product.name}
            </h1>

            {/* Vendor info and rating */}
            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm">
              <div className="flex items-center space-x-1 text-amber-400">
                <Star className="w-4 h-4 fill-amber-400" />
                <span className="font-bold text-slate-900 dark:text-white ml-1">
                  {product.rating.toFixed(1)}
                </span>
                <span className="text-slate-400 text-xs">({product.review_count} reviews)</span>
              </div>
              <span className="text-slate-300 dark:text-slate-700">|</span>
              <span className="text-xs text-slate-600 dark:text-slate-400">
                Sold by <strong className="text-slate-800 dark:text-slate-200 font-semibold">{product.vendor_name || 'ShopSense Store'}</strong>
              </span>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="p-4 rounded-2xl glass-card flex items-baseline space-x-3">
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              ₹{product.price.toLocaleString('en-IN')}
            </span>
            {product.compare_at_price && (
              <span className="text-sm text-slate-400 line-through">
                ₹{product.compare_at_price.toLocaleString('en-IN')}
              </span>
            )}
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 ml-auto bg-emerald-50 dark:bg-emerald-950/60 px-2 py-1 rounded-md">
              Free Express Delivery
            </span>
          </div>

          {/* AI-Generated Summary Callout */}
          {product.ai_description && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-brand-50 to-indigo-50/50 dark:from-brand-950/50 dark:to-indigo-950/30 border border-brand-200/80 dark:border-brand-800/60 space-y-1">
              <div className="flex items-center space-x-2 text-xs font-bold text-brand-700 dark:text-brand-300">
                <Sparkles className="w-3.5 h-3.5 text-brand-500" />
                <span>AI Insight & Recommendation</span>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                {product.ai_description}
              </p>
            </div>
          )}

          {/* Stock & Purchase Actions */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center space-x-4">
              <div className="flex items-center border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 overflow-hidden">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-3 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold"
                >
                  -
                </button>
                <span className="px-4 py-2 text-sm font-semibold text-slate-800 dark:text-slate-200">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  className="px-3 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold"
                >
                  +
                </button>
              </div>

              <button
                onClick={() => addToCart(product, quantity)}
                disabled={product.stock <= 0}
                className={`flex-1 py-3 px-6 rounded-2xl font-bold text-sm shadow-xl flex items-center justify-center space-x-2 transition-all active:scale-[0.98] ${
                  product.stock <= 0
                    ? 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed'
                    : inCart
                    ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-500/25'
                    : 'bg-brand-600 hover:bg-brand-500 text-white shadow-brand-500/25'
                }`}
              >
                {inCart ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
                <span>{product.stock <= 0 ? 'Out of Stock' : inCart ? 'Added to Cart' : 'Add to Cart'}</span>
              </button>
            </div>

            {/* Inventory indicator */}
            <div className="flex items-center space-x-2 text-xs">
              {product.stock > product.low_stock_threshold ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  ● In Stock ({product.stock} units available)
                </span>
              ) : product.stock > 0 ? (
                <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" /> Only {product.stock} units left in stock!
                </span>
              ) : (
                <span className="text-red-500 font-bold">● Out of stock</span>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Product Description</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line">
              {product.description || 'Premium high-grade performance electronics designed to elevate your daily productivity and entertainment.'}
            </p>
          </div>
        </div>
      </div>

      {/* Customer Reviews & Sentiment Analysis Section */}
      <section className="pt-8 border-t border-slate-200 dark:border-slate-800 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-brand-500" />
              <span>Customer Reviews & Aspect Sentiment</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Natural language processing automatically extracts key pros, cons, and sentiment polarity
            </p>
          </div>

          <button
            onClick={() => setReviewModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition-colors"
          >
            Write a Review
          </button>
        </div>

        {reviews.length === 0 ? (
          <p className="text-xs text-slate-500 py-6">No customer reviews yet. Be the first to share your thoughts!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((r) => (
              <div key={r.id} className="p-5 rounded-2xl glass-card space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-full bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300 font-bold text-xs flex items-center justify-center">
                      {r.customer_name?.charAt(0) || 'C'}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{r.customer_name || 'Verified Buyer'}</p>
                      <div className="flex items-center text-amber-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3 h-3 ${i < r.rating ? 'fill-amber-400' : 'text-slate-300 dark:text-slate-700'}`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Sentiment Badge */}
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      r.sentiment === 'POSITIVE'
                        ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'
                        : r.sentiment === 'NEGATIVE'
                        ? 'bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300'
                        : 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300'
                    }`}
                  >
                    {r.sentiment} ({Math.round(r.sentiment_score * 100)}%)
                  </span>
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  "{r.comment}"
                </p>

                {/* Aspect Pros & Cons */}
                {(r.pros?.length || r.cons?.length) && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {r.pros?.map((p, idx) => (
                      <span key={idx} className="inline-flex items-center text-[10px] font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-300 px-2 py-0.5 rounded">
                        <ThumbsUp className="w-2.5 h-2.5 mr-1" /> {p}
                      </span>
                    ))}
                    {r.cons?.map((c, idx) => (
                      <span key={idx} className="inline-flex items-center text-[10px] font-medium bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-300 px-2 py-0.5 rounded">
                        <ThumbsDown className="w-2.5 h-2.5 mr-1" /> {c}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Similar Products Recommendation */}
      {similarProducts.length > 0 && (
        <section className="pt-8 border-t border-slate-200 dark:border-slate-800 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Similar Products You Might Like</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Calculated using TF-IDF feature cosine similarity on specs, category, and price proximity
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {similarProducts.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                onSelectProduct={onSelectProduct}
              />
            ))}
          </div>
        </section>
      )}

      {/* Write a Review Modal */}
      {reviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md p-6 rounded-3xl glass-panel shadow-2xl space-y-4 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Review {product.name}</h3>
            <form onSubmit={handleReviewSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Rating:
                </label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRating(star)}
                      className="p-1"
                    >
                      <Star
                        className={`w-6 h-6 ${star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-700'}`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Review Title:
                </label>
                <input
                  type="text"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  placeholder="e.g. Excellent battery and display"
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Your Review Feedback:
                </label>
                <textarea
                  rows={4}
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share details of build quality, battery life, sound, or delivery..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs"
                  required
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-md shadow-brand-500/20"
                >
                  {submittingReview ? 'Analyzing & Posting...' : 'Post Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
