import React from 'react';
import {
  LayoutDashboard,
  ShoppingCart,
  Boxes,
  BadgeDollarSign,
  ArrowLeftRight,
  Printer,
  Truck,
  Users,
  FileBarChart,
  Settings,
  Code2,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpenMobile: boolean;
  setIsOpenMobile: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpenMobile,
  setIsOpenMobile,
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard Utama', icon: LayoutDashboard },
    { id: 'pos', label: 'Kasir POS Penjualan', icon: ShoppingCart, highlight: true },
    { id: 'products', label: 'Data Barang / Produk', icon: Boxes },
    { id: 'pricing', label: 'Manajemen Harga & Margin', icon: BadgeDollarSign },
    { id: 'stock', label: 'Manajemen Stok & Mutasi', icon: ArrowLeftRight },
    { id: 'services', label: 'Jasa Percetakan', icon: Printer },
    { id: 'purchases', label: 'Pembelian dari Supplier', icon: Truck },
    { id: 'partners', label: 'Supplier & Pelanggan', icon: Users },
    { id: 'reports', label: 'Laporan & Keuangan', icon: FileBarChart },
    { id: 'settings', label: 'Pengaturan Toko', icon: Settings },
    { id: 'python-guide', label: 'Panduan Python & VS Code', icon: Code2, badge: 'Code' },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs md:hidden"
          onClick={() => setIsOpenMobile(false)}
        />
      )}

      <aside
        className={`fixed md:sticky top-0 md:top-16 z-40 md:z-20 h-screen md:h-[calc(100vh-4rem)] w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-200 ease-in-out no-print ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Navigation list */}
        <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            Menu Utama Toko
          </div>

          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsOpenMobile(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs font-semibold'
                    : item.highlight
                    ? 'text-white hover:bg-slate-800 bg-slate-800/60'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.highlight ? 'text-blue-400' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.5 rounded font-mono">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Footer info in sidebar */}
        <div className="p-4 border-t border-slate-800 text-xs text-slate-400">
          <div className="flex items-center justify-between">
            <span>Sistem Operasi</span>
            <span className="font-mono text-emerald-400 font-semibold text-[11px]">Online</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Database SQLite Ready
          </div>
        </div>
      </aside>
    </>
  );
};
