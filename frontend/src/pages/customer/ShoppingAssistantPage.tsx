import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, Trash2, Bot, User as UserIcon, ArrowRight, ShoppingCart } from 'lucide-react';
import { api } from '../../services/api';
import { useCart } from '../../contexts/CartContext';
import { Product } from '../../types';

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  products?: any[];
  mode?: string;
}

const DEFAULT_PROMPTS = [
  "What is the best laptop for video editing?",
  "Show me products under ₹50,000.",
  "Which headphones have the best rating?",
  "Which product is good for students?"
];

export const ShoppingAssistantPage: React.FC<{ onSelectProduct: (id: number) => void }> = ({
  onSelectProduct,
}) => {
  const { addToCart } = useCart();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: "Hello! I am the **ShopSense AI Shopping Assistant**. I have complete knowledge of all products in our catalog. How can I assist you today? You can ask about specifications, budget constraints, or top-rated gear!",
    },
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (queryText: string) => {
    const q = queryText.trim();
    if (!q || loading) return;

    const userMsg: Message = {
      id: Math.random().toString(),
      sender: 'user',
      text: q,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    try {
      const res = await api.chatShoppingAssistant(q);
      const assistantMsg: Message = {
        id: Math.random().toString(),
        sender: 'assistant',
        text: res.answer,
        products: res.products || [],
        mode: res.mode,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          sender: 'assistant',
          text: "I experienced a temporary network issue connecting to the AI service. Please try again or rephrase your question.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([
      {
        id: 'welcome',
        sender: 'assistant',
        text: "Conversation cleared. Feel free to ask another shopping or hardware question!",
      },
    ]);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-cyan-400 flex items-center justify-center text-white shadow-lg shadow-brand-500/25">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <span>AI Shopping Assistant</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300">
                RAG Pipeline
              </span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Grounded strictly on our active multi-vendor catalog. No hallucinated products.
            </p>
          </div>
        </div>

        <button
          onClick={handleClear}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs flex items-center space-x-1"
          title="Clear Conversation"
        >
          <Trash2 className="w-4 h-4" />
          <span className="hidden sm:inline">Clear Chat</span>
        </button>
      </div>

      {/* Suggested Prompt Chips */}
      <div className="flex flex-wrap gap-2">
        {DEFAULT_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            onClick={() => handleSend(prompt)}
            className="px-3 py-1.5 rounded-full text-xs font-medium bg-slate-100 hover:bg-brand-50 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 border border-slate-200/60 dark:border-slate-700/60 transition-colors shadow-2xs"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Chat Messages Container */}
      <div className="h-[520px] overflow-y-auto p-6 rounded-3xl glass-panel border border-slate-200/80 dark:border-slate-800/80 space-y-6 shadow-inner">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start space-x-3 ${
              msg.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
            }`}
          >
            {/* Avatar */}
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                msg.sender === 'user'
                  ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20'
                  : 'bg-indigo-100 dark:bg-indigo-950 text-brand-600 dark:text-brand-300'
              }`}
            >
              {msg.sender === 'user' ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            {/* Bubble */}
            <div
              className={`max-w-2xl rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-brand-600 text-white shadow-md'
                  : 'bg-white/80 dark:bg-slate-900/80 text-slate-800 dark:text-slate-200 border border-slate-200/60 dark:border-slate-800/60 shadow-sm'
              }`}
            >
              <div className="whitespace-pre-line">{msg.text}</div>

              {/* Embedded Product Cards inside Assistant response */}
              {msg.products && msg.products.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-800/60 space-y-2">
                  <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Recommended Catalog Products:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {msg.products.map((p) => (
                      <div
                        key={p.id}
                        className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 flex items-center space-x-3 hover:border-brand-500/50 transition-all"
                      >
                        <img
                          src={p.image_url || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100'}
                          alt={p.name}
                          className="w-14 h-14 object-cover rounded-lg bg-white shrink-0 cursor-pointer"
                          onClick={() => onSelectProduct(p.id)}
                        />
                        <div className="flex-1 min-w-0">
                          <h4
                            onClick={() => onSelectProduct(p.id)}
                            className="font-bold text-xs text-slate-900 dark:text-white truncate hover:text-brand-600 dark:hover:text-brand-400 cursor-pointer"
                          >
                            {p.name}
                          </h4>
                          <p className="text-[11px] font-extrabold text-brand-600 dark:text-brand-400">
                            ₹{p.price?.toLocaleString('en-IN')}
                          </p>
                          <span className="text-[10px] text-slate-400">
                            ⭐ {p.rating} ({p.review_count})
                          </span>
                        </div>
                        <button
                          onClick={() => addToCart(p as Product, 1)}
                          className="p-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white shadow-sm"
                          title="Add to Cart"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 dark:bg-indigo-950 text-brand-600 dark:text-brand-300 flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div className="px-4 py-3 rounded-2xl bg-white/80 dark:bg-slate-900/80 border border-slate-200/60 dark:border-slate-800/60 flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-brand-500 animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-brand-500 animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-brand-500 animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Query Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(inputQuery);
        }}
        className="flex space-x-2"
      >
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder="Ask about products, compare specs, or find deals..."
          className="flex-1 px-4 py-3.5 rounded-2xl glass-panel border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
        <button
          type="submit"
          disabled={!inputQuery.trim() || loading}
          className="px-6 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-semibold text-sm shadow-lg shadow-brand-500/25 flex items-center justify-center space-x-1.5 active:scale-95 transition-all"
        >
          <span>Send</span>
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
