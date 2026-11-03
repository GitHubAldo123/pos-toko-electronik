import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext.js';
import { formatRupiah, formatNumber } from '../utils/money.js';
import {
  calculateTotalInventoryValue,
  calculateTotalStockCount,
  filterLowStockProducts,
  filterOutOfStockProducts,
} from '../utils/stock.js';
import {
  DollarSign,
  TrendingUp,
  Package,
  Boxes,
  AlertTriangle,
  XCircle,
  Receipt,
  ArrowUpRight,
  ShoppingCart,
  Calendar,
  Layers,
  Sparkles,
  ChevronRight,
} from 'lucide-react';

interface DashboardViewProps {
  setActiveTab: (tab: string) => void;
  openReceiptModal: (saleId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  setActiveTab,
  openReceiptModal,
}) => {
  const { products, sales, services } = useStore();
  const [chartPeriod, setChartPeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  // Compute live today metrics
  const todayDateStr = new Date().toISOString().slice(0, 10);

  const {
    todaySalesTotal,
    todayProfitTotal,
    todayTransactionCount,
    totalInventoryValue,
    totalStockCount,
    lowStockProducts,
    outOfStockProducts,
    topSellingProducts,
    recentSales,
  } = useMemo(() => {
    // Filter sales for today (active non-cancelled)
    const activeSales = sales.filter((s) => s.status !== 'CANCELLED');
    const todaySales = activeSales.filter((s) => s.date.slice(0, 10) === todayDateStr);

    const todaySalesTotal = todaySales.reduce((acc, s) => acc + s.grandTotal, 0);
    const todayProfitTotal = todaySales.reduce((acc, s) => acc + s.profit, 0);
    const todayTransactionCount = todaySales.length;

    const totalInventoryValue = calculateTotalInventoryValue(products);
    const totalStockCount = calculateTotalStockCount(products);

    const lowStockProducts = filterLowStockProducts(products);
    const outOfStockProducts = filterOutOfStockProducts(products);

    // Calculate top selling products from active sales
    const productSalesMap: Record<
      string,
      { id: string; name: string; code: string; qty: number; revenue: number; profit: number }
    > = {};

    activeSales.forEach((sale) => {
      sale.items.forEach((item) => {
        if (!productSalesMap[item.itemId]) {
          productSalesMap[item.itemId] = {
            id: item.itemId,
            name: item.name,
            code: item.code,
            qty: 0,
            revenue: 0,
            profit: 0,
          };
        }
        productSalesMap[item.itemId].qty += item.qty;
        productSalesMap[item.itemId].revenue += item.subtotal;
        productSalesMap[item.itemId].profit += item.profit;
      });
    });

    const topSellingProducts = Object.values(productSalesMap)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);

    const recentSales = activeSales.slice(0, 6);

    return {
      todaySalesTotal,
      todayProfitTotal,
      todayTransactionCount,
      totalInventoryValue,
      totalStockCount,
      lowStockProducts,
      outOfStockProducts,
      topSellingProducts,
      recentSales,
    };
  }, [products, sales, todayDateStr]);

  // Generate chart data based on real sales
  const chartData = useMemo(() => {
    const activeSales = sales.filter((s) => s.status !== 'CANCELLED');

    if (chartPeriod === 'daily') {
      // Last 7 days
      const days = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const ymd = d.toISOString().slice(0, 10);
        const dayLabel = d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'numeric' });
        const salesOnDay = activeSales.filter((s) => s.date.slice(0, 10) === ymd);
        const revenue = salesOnDay.reduce((sum, s) => sum + s.grandTotal, 0);
        const profit = salesOnDay.reduce((sum, s) => sum + s.profit, 0);
        days.push({ label: dayLabel, revenue, profit, count: salesOnDay.length });
      }
      return days;
    } else if (chartPeriod === 'weekly') {
      // Last 4 weeks
      const weeks = [];
      for (let i = 3; i >= 0; i--) {
        const start = new Date();
        start.setDate(start.getDate() - (i + 1) * 7);
        const end = new Date();
        end.setDate(end.getDate() - i * 7);
        const label = `Mg ${4 - i}`;
        const salesInWeek = activeSales.filter((s) => {
          const sDate = new Date(s.date);
          return sDate >= start && sDate <= end;
        });
        const revenue = salesInWeek.reduce((sum, s) => sum + s.grandTotal, 0);
        const profit = salesInWeek.reduce((sum, s) => sum + s.profit, 0);
        weeks.push({ label, revenue, profit, count: salesInWeek.length });
      }
      return weeks;
    } else {
      // Last 6 months
      const months = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const ym = d.toISOString().slice(0, 7);
        const label = d.toLocaleDateString('id-ID', { month: 'short', year: '2-digit' });
        const salesInMonth = activeSales.filter((s) => s.date.slice(0, 7) === ym);
        const revenue = salesInMonth.reduce((sum, s) => sum + s.grandTotal, 0);
        const profit = salesInMonth.reduce((sum, s) => sum + s.profit, 0);
        months.push({ label, revenue, profit, count: salesInMonth.length });
      }
      return months;
    }
  }, [sales, chartPeriod]);

  // Max value for chart scaling
  const maxChartValue = Math.max(...chartData.map((d) => d.revenue), 100000);

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="bg-linear-to-r from-blue-700 via-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-blue-500/30 text-blue-100 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-blue-400/30">
                Sistem Kasir &amp; Inventaris Aktif
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight">
              Ringkasan Operasional Toko
            </h1>
            <p className="text-blue-100 text-xs sm:text-sm mt-1 max-w-xl">
              Pantau arus penjualan kasir, stok fisik sparepart komputer, pemakaian bahan percetakan, dan laba kotor hari ini secara real-time.
            </p>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => setActiveTab('pos')}
              className="bg-white text-blue-700 hover:bg-blue-50 font-semibold px-4 py-2.5 rounded-xl text-sm shadow-sm transition-colors flex items-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Buka Kasir POS</span>
            </button>
            <button
              onClick={() => setActiveTab('stock')}
              className="bg-blue-800/80 hover:bg-blue-800 text-white font-medium px-3.5 py-2.5 rounded-xl text-sm border border-blue-400/30 transition-colors flex items-center gap-1.5"
            >
              <Boxes className="w-4 h-4" />
              <span>Cek Stok</span>
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Total Penjualan Hari Ini */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Penjualan Hari Ini</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-lg font-bold text-slate-900 mt-2">
            {formatRupiah(todaySalesTotal)}
          </p>
          <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-1">
            <span>{todayTransactionCount} transaksi hari ini</span>
          </div>
        </div>

        {/* Total Keuntungan Hari Ini */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Keuntungan Hari Ini</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-lg font-bold text-blue-600 mt-2">
            {formatRupiah(todayProfitTotal)}
          </p>
          <div className="text-[11px] text-slate-500 mt-1">
            {todaySalesTotal > 0
              ? `Margin: ${((todayProfitTotal / todaySalesTotal) * 100).toFixed(1)}%`
              : 'Margin: 0%'}
          </div>
        </div>

        {/* Total Nilai Persediaan Modal */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Nilai Aset Stok (Modal)</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <p className="text-lg font-bold text-slate-900 mt-2">
            {formatRupiah(totalInventoryValue)}
          </p>
          <div className="text-[11px] text-slate-500 mt-1">
            Harga modal semua unit
          </div>
        </div>

        {/* Total Produk & Stok */}
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs hover:shadow-sm transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Katalog Produk</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <p className="text-lg font-bold text-slate-900 mt-2">
            {products.length} SKU
          </p>
          <div className="text-[11px] text-slate-500 mt-1">
            Total {formatNumber(totalStockCount)} fisik unit
          </div>
        </div>

        {/* Stok Menipis Alert */}
        <div
          onClick={() => setActiveTab('stock')}
          className="bg-white p-4 rounded-xl border border-amber-200 shadow-xs hover:bg-amber-50/50 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-amber-700">Stok Menipis</span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-lg font-bold text-amber-700 mt-2">
            {lowStockProducts.length} Produk
          </p>
          <div className="text-[11px] text-amber-600 mt-1 flex items-center gap-1 font-medium">
            <span>Perlu restock segera</span>
            <ArrowUpRight className="w-3 h-3" />
          </div>
        </div>

        {/* Barang Habis Alert */}
        <div
          onClick={() => setActiveTab('stock')}
          className="bg-white p-4 rounded-xl border border-red-200 shadow-xs hover:bg-red-50/50 transition-colors cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-red-700">Stok Kosong / Habis</span>
            <div className="w-8 h-8 rounded-lg bg-red-100 text-red-700 flex items-center justify-center">
              <XCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-lg font-bold text-red-700 mt-2">
            {outOfStockProducts.length} Produk
          </p>
          <div className="text-[11px] text-red-600 mt-1 flex items-center gap-1 font-medium">
            <span>Stok 0 unit</span>
            <ArrowUpRight className="w-3 h-3" />
          </div>
        </div>
      </div>

      {/* Main Analytics: Chart & Top Sellers Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Trend Chart (Span 2) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-800">
                Grafik Penjualan &amp; Laba Kotor
              </h2>
              <p className="text-xs text-slate-500">
                Perbandingan omset penjualan kasir dan keuntungan berdasarkan data transaksi
              </p>
            </div>
            {/* Period Switcher */}
            <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs font-medium self-start sm:self-auto">
              <button
                onClick={() => setChartPeriod('daily')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  chartPeriod === 'daily'
                    ? 'bg-white text-blue-600 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Harian (7 Hari)
              </button>
              <button
                onClick={() => setChartPeriod('weekly')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  chartPeriod === 'weekly'
                    ? 'bg-white text-blue-600 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Mingguan (4 Mg)
              </button>
              <button
                onClick={() => setChartPeriod('monthly')}
                className={`px-3 py-1.5 rounded-md transition-colors ${
                  chartPeriod === 'monthly'
                    ? 'bg-white text-blue-600 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Bulanan (6 Bln)
              </button>
            </div>
          </div>

          {/* Chart Bars Representation */}
          <div className="mt-6">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-xs bg-blue-500 inline-block"></span>
                  <span className="text-slate-600 font-medium">Omset Penjualan</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-xs bg-emerald-500 inline-block"></span>
                  <span className="text-slate-600 font-medium">Laba Kotor</span>
                </span>
              </div>
              <span className="font-mono text-[11px]">Skala Max: {formatRupiah(maxChartValue)}</span>
            </div>

            <div className="h-64 flex items-end gap-2 sm:gap-4 pt-6 pb-2 px-2 border-b border-slate-200">
              {chartData.map((item, idx) => {
                const revenueHeight = Math.max(8, (item.revenue / maxChartValue) * 100);
                const profitHeight = Math.max(4, (item.profit / maxChartValue) * 100);

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                    {/* Tooltip on hover */}
                    <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[10px] rounded-lg py-1 px-2 pointer-events-none whitespace-nowrap z-20 shadow-md">
                      <div>Penjualan: {formatRupiah(item.revenue)}</div>
                      <div className="text-emerald-300">Laba: {formatRupiah(item.profit)}</div>
                    </div>

                    <div className="w-full max-w-[42px] flex items-end justify-center gap-1 h-full">
                      {/* Revenue Bar */}
                      <div
                        style={{ height: `${revenueHeight}%` }}
                        className="w-1/2 bg-blue-500 hover:bg-blue-600 rounded-t transition-all"
                      ></div>
                      {/* Profit Bar */}
                      <div
                        style={{ height: `${profitHeight}%` }}
                        className="w-1/2 bg-emerald-500 hover:bg-emerald-600 rounded-t transition-all"
                      ></div>
                    </div>
                    <span className="text-[10px] text-slate-500 mt-2 truncate max-w-full font-mono text-center">
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Top 5 Best Selling Products */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-base font-bold text-slate-800">Produk Paling Laris</h2>
              <p className="text-xs text-slate-500">Berdasarkan volume penjualan kasir</p>
            </div>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>

          <div className="flex-1 divide-y divide-slate-100 mt-2">
            {topSellingProducts.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Belum ada transaksi penjualan yang tercatat.
              </div>
            ) : (
              topSellingProducts.map((p, idx) => (
                <div key={p.id} className="py-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-800 truncate">
                        {p.name}
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono">{p.code}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="inline-block text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                      {p.qty} terjual
                    </span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {formatRupiah(p.revenue)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

          <button
            onClick={() => setActiveTab('reports')}
            className="mt-4 pt-3 border-t border-slate-100 text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center justify-center gap-1 w-full"
          >
            <span>Lihat Laporan Penjualan Lengkap</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Bottom Grid: Low Stock Warnings & Recent Invoices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Urgent Stock Watchlist */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></div>
              <h2 className="text-base font-bold text-slate-800">
                Peringatan Stok Perlu Diisi
              </h2>
            </div>
            <button
              onClick={() => setActiveTab('stock')}
              className="text-xs text-blue-600 hover:underline font-medium"
            >
              Kelola Stok
            </button>
          </div>

          <div className="divide-y divide-slate-100 mt-2 max-h-72 overflow-y-auto">
            {[...outOfStockProducts, ...lowStockProducts].slice(0, 6).map((item) => (
              <div key={item.id} className="py-2.5 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-800 truncate">
                      {item.name}
                    </span>
                    {item.stock <= 0 ? (
                      <span className="text-[10px] font-bold bg-red-100 text-red-700 px-1.5 py-0.2 rounded">
                        HABIS
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.2 rounded">
                        MENIPIS
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Lokasi: {item.location || '-'} | Min: {item.minStock} {item.unit}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className={`text-xs font-bold ${item.stock <= 0 ? 'text-red-600' : 'text-amber-600'}`}>
                    Sisa {item.stock} {item.unit}
                  </span>
                  <p className="text-[10px] text-slate-400">
                    Beli: {formatRupiah(item.buyPrice)}
                  </p>
                </div>
              </div>
            ))}

            {outOfStockProducts.length === 0 && lowStockProducts.length === 0 && (
              <div className="py-6 text-center text-xs text-slate-400">
                Semua stok barang dalam kondisi aman.
              </div>
            )}
          </div>
        </div>

        {/* Recent Invoices / Struk Penjualan */}
        <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-800">
              Transaksi Penjualan Terbaru
            </h2>
            <button
              onClick={() => setActiveTab('reports')}
              className="text-xs text-blue-600 hover:underline font-medium"
            >
              Semua Transaksi
            </button>
          </div>

          <div className="divide-y divide-slate-100 mt-2 max-h-72 overflow-y-auto">
            {recentSales.map((sale) => (
              <div key={sale.id} className="py-2.5 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-slate-800">
                      {sale.invoiceNo}
                    </span>
                    <span className="text-[10px] uppercase font-semibold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                      {sale.paymentMethod}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate">
                    {sale.customerName} ({sale.items.length} item)
                  </p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <p className="text-xs font-bold text-slate-900">
                      {formatRupiah(sale.grandTotal)}
                    </p>
                    <p className="text-[10px] text-emerald-600 font-medium">
                      +{formatRupiah(sale.profit)}
                    </p>
                  </div>
                  <button
                    onClick={() => openReceiptModal(sale.id)}
                    className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-slate-200"
                    title="Cetak Ulang Struk"
                  >
                    <Receipt className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}

            {recentSales.length === 0 && (
              <div className="py-6 text-center text-xs text-slate-400">
                Belum ada transaksi penjualan kasir hari ini.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
