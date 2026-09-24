import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { useAuth } from './AuthContext';
import { getAuthToken } from '../services/api';

export interface ToastMessage {
  id: string;
  type: 'info' | 'success' | 'warning' | 'order';
  title: string;
  message: string;
}

interface WebSocketContextType {
  isConnected: boolean;
  toasts: ToastMessage[];
  removeToast: (id: string) => void;
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  const addToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);
    setTimeout(() => {
      removeToast(id);
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  useEffect(() => {
    const token = getAuthToken();
    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsHost = 'localhost:8000';
    const wsUrl = `${wsProtocol}//${wsHost}/api/ws/notifications${token ? `?token=${token}` : ''}`;

    let socket: WebSocket;
    try {
      socket = new WebSocket(wsUrl);
      wsRef.current = socket;

      socket.onopen = () => {
        setIsConnected(true);
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'NEW_ORDER') {
            addToast({
              type: 'order',
              title: '⚡ New Order Received!',
              message: data.message || `Order #${data.order_number} for ₹${data.amount}`,
            });
          } else if (data.type === 'ORDER_STATUS_UPDATE') {
            addToast({
              type: 'info',
              title: 'Order Status Update',
              message: data.message,
            });
          }
        } catch {
          // ignore non-json messages like pong
        }
      };

      socket.onclose = () => {
        setIsConnected(false);
      };

      socket.onerror = () => {
        setIsConnected(false);
      };
    } catch {
      setIsConnected(false);
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [user]);

  return (
    <WebSocketContext.Provider value={{ isConnected, toasts, removeToast, addToast }}>
      {children}
      {/* Toast Render Center */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-3 max-w-sm pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto p-4 rounded-xl shadow-xl border glass-panel animate-bounce-short flex items-start space-x-3 text-sm bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-brand-500 mt-1.5 animate-pulse" />
            <div className="flex-1">
              <h4 className="font-semibold text-slate-900 dark:text-white">{toast.title}</h4>
              <p className="text-slate-600 dark:text-slate-300 mt-0.5">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-xs font-bold px-1"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) throw new Error('useWebSocket must be used within a WebSocketProvider');
  return context;
};
