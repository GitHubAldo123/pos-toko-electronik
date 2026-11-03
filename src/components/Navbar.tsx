import React, { useState, useEffect } from 'react';
import { useStore } from '../context/StoreContext.js';
import { filterLowStockProducts, filterOutOfStockProducts } from '../utils/stock.js';
import {
  Bell,
  ShoppingCart,
  AlertTriangle,
  Store,
  Clock,
  Printer,
  ChevronRight,
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  openReceiptModal?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const { settings, products, sales } = useStore();
  const [currentTime, setCurrentTime] = useState<string>('');

  const lowStock = filterLowStockProducts(products);
  const outOfStock = filterOutOfStockProducts(products);
  const totalAlerts = lowStock.length + outOfStock.length;

  useEffect(() => {
    const update = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      };
      setCurrentTime(now.toLocaleDateString('id-ID', options));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Brand & Tagline */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-sm shadow-blue-500/20 font-bold text-lg">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-slate-900 tracking-tight text-base sm:text-lg">
                  {settings.storeName}
                </span>
                <span className="hidden sm:inline-block text-[11px] font-semibold uppercase px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  v1.2 Pro
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden md:block">
                {settings.tagline}
              </p>
            </div>
          </div>

          {/* Right: Actions, Live Clock, Alerts, User */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Live Clock */}
            <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200/60 font-mono">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{currentTime || 'Memuat waktu...'}</span>
            </div>

            {/* Quick POS Button */}
            <button
              onClick={() => setActiveTab('pos')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg font-medium text-xs sm:text-sm transition-all shadow-xs ${
                activeTab === 'pos'
                  ? 'bg-blue-700 text-white ring-2 ring-blue-500'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Kasir POS</span>
            </button>

            {/* Low stock alert badge */}
            <button
              onClick={() => setActiveTab('stock')}
              className="relative p-2 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors border border-slate-200"
              title="Notifikasi Stok Kritis"
              aria-label="Peringatan Stok"
            >
              <Bell className="w-4 h-4" />
              {totalAlerts > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full border-2 border-white animate-pulse">
                  {totalAlerts}
                </span>
              )}
            </button>

            {/* Operator Profile */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
                OP
              </div>
              <div className="hidden xl:block text-left text-xs">
                <p className="font-semibold text-slate-800 leading-tight">Admin Toko</p>
                <p className="text-[10px] text-emerald-600 font-medium">Aktif Shift Pagi</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
