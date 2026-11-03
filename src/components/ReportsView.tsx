import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext.js';
import { formatRupiah, formatNumber, formatMargin } from '../utils/money.js';
import { exportToCSV } from '../utils/export.js';
import {
  FileBarChart,
  Calendar,
  Download,
  Printer,
  DollarSign,
  TrendingUp,
  Boxes,
  Truck,
  Sparkles,
  Receipt,
} from 'lucide-react';

interface ReportsViewProps {
  openReceiptModal: (saleId: string) => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({ openReceiptModal }) => {
  const { sales, products, purchases, settings } = useStore();

  const [period, setPeriod] = useState<
    'today' | 'yesterday' | 'week' | 'month' | 'year' | 'custom'
  >('month');
  const [reportType, setReportType] = useState<
    'sales' | 'profit' | 'stock' | 'top' | 'purchases'
  >('sales');

  const [customStartDate, setCustomStartDate] = useState<string>(
    new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  );
  const [customEndDate, setCustomEndDate] = useState<string>(
    new Date().toISOString().slice(0, 10)
  );

  // Filter range evaluation
  const { startDate, endDate } = useMemo(() => {
    const now = new Date();
    let start = new Date();
    let end = new Date();

    if (period === 'today') {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    } else if (period === 'yesterday') {
      start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
      end = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1, 23, 59, 59);
    } else if (period === 'week') {
      start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      end = now;
    } else if (period === 'month') {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
      end = now;
    } else if (period === 'year') {
      start = new Date(now.getFullYear(), 0, 1);
      end = now;
    } else {
      start = new Date(customStartDate);
      end = new Date(`${customEndDate}T23:59:59`);
    }

    return { startDate: start, endDate: end };
  }, [period, customStartDate, customEndDate]);

  // Filtered sales
  const filteredSales = useMemo(() => {
    return sales.filter((s) => {
      if (s.status === 'CANCELLED') return false;
      const sDate = new Date(s.date);
      return sDate >= startDate && sDate <= endDate;
    });
  }, [sales, startDate, endDate]);

  // Filtered purchases
  const filteredPurchases = useMemo(() => {
    return purchases.filter((p) => {
      const pDate = new Date(p.date);
      return pDate >= startDate && pDate <= endDate;
    });
  }, [purchases, startDate, endDate]);

  // Financial Summary calculations
  const totalOmset = filteredSales.reduce((acc, s) => acc + s.grandTotal, 0);
  const totalHPP = filteredSales.reduce((acc, s) => acc + s.totalCost, 0);
  const totalDiskon = filteredSales.reduce((acc, s) => acc + s.discountAmount, 0);
  const totalLabaKotor = filteredSales.reduce((acc, s) => acc + s.profit, 0);
  const totalPurchasesAmount = filteredPurchases.reduce((acc, p) => acc + p.totalAmount, 0);

  // Top Products in selected period
  const topProducts = useMemo(() => {
    const map: Record<
      string,
      { id: string; name: string; code: string; unit: string; qty: number; revenue: number; profit: number }
    > = {};

    filteredSales.forEach((sale) => {
      sale.items.forEach((item) => {
        if (!map[item.itemId]) {
          map[item.itemId] = {
            id: item.itemId,
            name: item.name,
            code: item.code,
            unit: item.unit,
            qty: 0,
            revenue: 0,
            profit: 0,
          };
        }
        map[item.itemId].qty += item.qty;
        map[item.itemId].revenue += item.subtotal;
        map[item.itemId].profit += item.profit;
      });
    });

    return Object.values(map).sort((a, b) => b.qty - a.qty);
  }, [filteredSales]);

  // Export CSV handler
  const handleExport = () => {
    const dateTag = `${startDate.toISOString().slice(0, 10)}_sd_${endDate.toISOString().slice(0, 10)}`;

    if (reportType === 'sales') {
      const headers = ['No. Invoice', 'Tanggal', 'Pelanggan', 'Metode Bayar', 'Subtotal', 'Diskon', 'Grand Total', 'Keuntungan'];
      const rows = filteredSales.map((s) => [
        s.invoiceNo,
        new Date(s.date).toLocaleString('id-ID'),
        s.customerName,
        s.paymentMethod,
        s.subtotal,
        s.discountAmount,
        s.grandTotal,
        s.profit,
      ]);
      exportToCSV(`laporan_penjualan_${dateTag}`, headers, rows);
    } else if (reportType === 'profit') {
      const headers = ['No. Invoice', 'Tanggal', 'Omset Penjualan', 'HPP Modal', 'Diskon', 'Laba Bersih', 'Margin %'];
      const rows = filteredSales.map((s) => [
        s.invoiceNo,
        new Date(s.date).toLocaleString('id-ID'),
        s.grandTotal,
        s.totalCost,
        s.discountAmount,
        s.profit,
        s.grandTotal > 0 ? ((s.profit / s.grandTotal) * 100).toFixed(1) : '0',
      ]);
      exportToCSV(`laporan_laba_rugi_${dateTag}`, headers, rows);
    } else if (reportType === 'stock') {
      const headers = ['Kode SKU', 'Nama Barang', 'Kategori', 'Stok', 'Satuan', 'Harga Modal', 'Nilai Persediaan Total'];
      const rows = products.map((p) => [
        p.code,
        p.name,
        p.categoryName || '-',
        p.stock,
        p.unit,
        p.buyPrice,
        p.stock * p.buyPrice,
      ]);
      exportToCSV(`laporan_nilai_persediaan_${new Date().toISOString().slice(0, 10)}`, headers, rows);
    } else if (reportType === 'top') {
      const headers = ['Peringkat', 'Kode', 'Nama Barang', 'Jumlah Terjual', 'Total Omset', 'Keuntungan'];
      const rows = topProducts.map((p, idx) => [
        idx + 1,
        p.code,
        p.name,
        `${p.qty} ${p.unit}`,
        p.revenue,
        p.profit,
      ]);
      exportToCSV(`laporan_barang_terlaris_${dateTag}`, headers, rows);
    } else if (reportType === 'purchases') {
      const headers = ['No. PO', 'Tanggal', 'Supplier', 'Status Pembayaran', 'Total Pembelian', 'Catatan'];
      const rows = filteredPurchases.map((p) => [
        p.purchaseNo,
        new Date(p.date).toLocaleString('id-ID'),
        p.supplierName,
        p.paymentStatus,
        p.totalAmount,
        p.notes || '-',
      ]);
      exportToCSV(`laporan_pembelian_supplier_${dateTag}`, headers, rows);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Laporan Keuangan &amp; Analitik Toko
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Laporan penjualan kasir, HPP, laba kotor, aset persediaan, barang terlaris, dan pembelian.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Cetak Laporan</span>
          </button>
          <button
            onClick={handleExport}
            className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Ekspor Excel / CSV</span>
          </button>
        </div>
      </div>

      {/* Filter Period Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-3 no-print">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Preset Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs font-semibold">
            <span className="text-slate-500 mr-1 text-xs">Periode:</span>
            {[
              { id: 'today', label: 'Hari Ini' },
              { id: 'yesterday', label: 'Kemarin' },
              { id: 'week', label: '7 Hari Terakhir' },
              { id: 'month', label: 'Bulan Ini' },
              { id: 'year', label: 'Tahun Ini' },
              { id: 'custom', label: 'Rentang Kustom' },
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setPeriod(p.id as any)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                  period === p.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Custom Date Pickers */}
          {period === 'custom' && (
            <div className="flex items-center gap-2 text-xs">
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
              />
              <span className="text-slate-400">s/d</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                className="px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white"
              />
            </div>
          )}
        </div>

        {/* Report Sub-Tabs */}
        <div className="pt-3 border-t border-slate-100 flex items-center gap-2 overflow-x-auto text-xs font-semibold">
          {[
            { id: 'sales', label: 'Laporan Penjualan', count: filteredSales.length },
            { id: 'profit', label: 'Laporan Laba Rugi', count: null },
            { id: 'stock', label: 'Laporan Nilai Stok', count: products.length },
            { id: 'top', label: 'Barang Terlaris', count: topProducts.length },
            { id: 'purchases', label: 'Laporan Pembelian', count: filteredPurchases.length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setReportType(tab.id as any)}
              className={`px-3.5 py-2 rounded-lg whitespace-nowrap transition-all ${
                reportType === tab.id
                  ? 'bg-slate-900 text-white font-bold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== null && (
                <span className="ml-1.5 opacity-60 font-mono text-[11px]">({tab.count})</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Printable Report Header */}
      <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs print-container">
        <div className="pb-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight">
              {settings.storeName}
            </h2>
            <p className="text-xs text-slate-500">{settings.address} | Telp: {settings.phone}</p>
          </div>
          <div className="text-left sm:text-right">
            <span className="inline-block text-xs font-bold uppercase px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
              Laporan: {reportType.toUpperCase()}
            </span>
            <p className="text-[11px] text-slate-500 font-mono mt-0.5">
              Periode: {startDate.toLocaleDateString('id-ID')} s/d {endDate.toLocaleDateString('id-ID')}
            </p>
          </div>
        </div>

        {/* Financial KPI Summary Header Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-5">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[11px] font-medium text-slate-500 block">Total Omset Penjualan</span>
            <span className="text-base font-extrabold text-slate-900 font-mono block mt-0.5">
              {formatRupiah(totalOmset)}
            </span>
            <span className="text-[10px] text-slate-400">{filteredSales.length} transaksi</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[11px] font-medium text-slate-500 block">Harga Pokok (HPP)</span>
            <span className="text-base font-bold text-slate-700 font-mono block mt-0.5">
              {formatRupiah(totalHPP)}
            </span>
            <span className="text-[10px] text-slate-400">Total modal terjual</span>
          </div>

          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
            <span className="text-[11px] font-semibold text-emerald-800 block">Laba Kotor Bersih</span>
            <span className="text-base font-black text-emerald-700 font-mono block mt-0.5">
              {formatRupiah(totalLabaKotor)}
            </span>
            <span className="text-[10px] text-emerald-600 font-bold">
              Margin {totalOmset > 0 ? ((totalLabaKotor / totalOmset) * 100).toFixed(1) : 0}%
            </span>
          </div>

          <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
            <span className="text-[11px] font-semibold text-blue-800 block">Pembelian ke Supplier</span>
            <span className="text-base font-bold text-blue-700 font-mono block mt-0.5">
              {formatRupiah(totalPurchasesAmount)}
            </span>
            <span className="text-[10px] text-blue-600">{filteredPurchases.length} Order Pembelian</span>
          </div>
        </div>

        {/* REPORT CONTENT TABLES */}

        {/* 1. Laporan Penjualan */}
        {reportType === 'sales' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">No. Invoice</th>
                  <th className="py-2.5 px-3">Waktu</th>
                  <th className="py-2.5 px-3">Pelanggan</th>
                  <th className="py-2.5 px-3">Metode</th>
                  <th className="py-2.5 px-3">Subtotal</th>
                  <th className="py-2.5 px-3">Diskon</th>
                  <th className="py-2.5 px-3">Total Bayar</th>
                  <th className="py-2.5 px-3">Keuntungan</th>
                  <th className="py-2.5 px-3 text-right no-print">Struk</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {filteredSales.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-8 text-center text-slate-400 font-sans">
                      Tidak ada transaksi penjualan pada rentang periode ini.
                    </td>
                  </tr>
                ) : (
                  filteredSales.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/80">
                      <td className="py-2.5 px-3 font-bold text-blue-600">{s.invoiceNo}</td>
                      <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap text-[11px]">
                        {new Date(s.date).toLocaleString('id-ID')}
                      </td>
                      <td className="py-2.5 px-3 font-sans font-medium text-slate-800">
                        {s.customerName}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-sans font-semibold">
                          {s.paymentMethod}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">{formatRupiah(s.subtotal)}</td>
                      <td className="py-2.5 px-3 text-red-600">
                        {s.discountAmount > 0 ? `-${formatRupiah(s.discountAmount)}` : '-'}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">{formatRupiah(s.grandTotal)}</td>
                      <td className="py-2.5 px-3 font-semibold text-emerald-600">+{formatRupiah(s.profit)}</td>
                      <td className="py-2.5 px-3 text-right no-print font-sans">
                        <button
                          onClick={() => openReceiptModal(s.id)}
                          className="p-1 text-slate-400 hover:text-blue-600 rounded"
                          title="Cetak Struk"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* 2. Laporan Laba Rugi */}
        {reportType === 'profit' && (
          <div className="space-y-6">
            <div className="max-w-xl mx-auto bg-slate-50 p-6 rounded-2xl border border-slate-200">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-200 pb-2">
                Ringkasan Laba Rugi Komprehensif
              </h3>
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center text-slate-700">
                  <span className="font-medium">1. Pendapatan Kotor (Subtotal Penjualan)</span>
                  <span className="font-mono font-bold text-slate-900">
                    {formatRupiah(filteredSales.reduce((a, b) => a + b.subtotal, 0))}
                  </span>
                </div>
                <div className="flex justify-between items-center text-red-600">
                  <span>2. Total Potongan Diskon</span>
                  <span className="font-mono font-semibold">-{formatRupiah(totalDiskon)}</span>
                </div>
                <div className="flex justify-between items-center font-bold text-slate-900 pt-2 border-t border-slate-200">
                  <span>PENDAPATAN BERSIH (NET REVENUE)</span>
                  <span className="font-mono text-sm text-blue-600">{formatRupiah(totalOmset)}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600 pt-2">
                  <span>3. Harga Pokok Penjualan (HPP Modal Barang Terjual)</span>
                  <span className="font-mono font-semibold">-{formatRupiah(totalHPP)}</span>
                </div>
                <div className="flex justify-between items-center font-black text-slate-900 pt-3 border-t-2 border-slate-300 text-sm">
                  <span className="text-emerald-700">LABA KOTOR USAHA TOKO</span>
                  <span className="font-mono text-emerald-700 text-base">{formatRupiah(totalLabaKotor)}</span>
                </div>
                <div className="flex justify-between items-center text-[11px] text-slate-500 pt-1">
                  <span>Persentase Margin Laba Bersih</span>
                  <span className="font-mono font-bold text-slate-800">
                    {totalOmset > 0 ? ((totalLabaKotor / totalOmset) * 100).toFixed(2) : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. Laporan Nilai Stok */}
        {reportType === 'stock' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Kode SKU</th>
                  <th className="py-2.5 px-3">Nama Barang</th>
                  <th className="py-2.5 px-3">Kategori</th>
                  <th className="py-2.5 px-3">Stok Tersedia</th>
                  <th className="py-2.5 px-3">Harga Modal</th>
                  <th className="py-2.5 px-3">Total Nilai Aset Stok</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80">
                    <td className="py-2.5 px-3 font-bold text-blue-600">{p.code}</td>
                    <td className="py-2.5 px-3 font-sans font-semibold text-slate-800">{p.name}</td>
                    <td className="py-2.5 px-3 font-sans text-slate-600">{p.categoryName}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{p.stock} {p.unit}</td>
                    <td className="py-2.5 px-3 text-slate-600">{formatRupiah(p.buyPrice)}</td>
                    <td className="py-2.5 px-3 font-bold text-slate-900">
                      {formatRupiah(p.stock * p.buyPrice)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 4. Top Selling Products */}
        {reportType === 'top' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">Ranking</th>
                  <th className="py-2.5 px-3">Kode &amp; Nama Barang</th>
                  <th className="py-2.5 px-3">Total Terjual</th>
                  <th className="py-2.5 px-3">Omset Penjualan</th>
                  <th className="py-2.5 px-3">Kontribusi Laba</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {topProducts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 font-sans">
                      Belum ada penjualan dalam rentang periode ini.
                    </td>
                  </tr>
                ) : (
                  topProducts.map((p, idx) => (
                    <tr key={p.id} className="hover:bg-slate-50/80">
                      <td className="py-2.5 px-3 font-bold text-slate-500">#{idx + 1}</td>
                      <td className="py-2.5 px-3 font-sans">
                        <div className="font-bold text-slate-800">{p.name}</div>
                        <span className="font-mono text-[10px] text-blue-600">{p.code}</span>
                      </td>
                      <td className="py-2.5 px-3 font-bold text-blue-600 text-sm">
                        {p.qty} {p.unit}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">{formatRupiah(p.revenue)}</td>
                      <td className="py-2.5 px-3 font-bold text-emerald-600">+{formatRupiah(p.profit)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* 5. Laporan Pembelian */}
        {reportType === 'purchases' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[11px]">
                <tr>
                  <th className="py-2.5 px-3">No. PO</th>
                  <th className="py-2.5 px-3">Tanggal</th>
                  <th className="py-2.5 px-3">Supplier</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Total Pembelian</th>
                  <th className="py-2.5 px-3">Catatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {filteredPurchases.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400 font-sans">
                      Tidak ada pembelian supplier pada rentang periode ini.
                    </td>
                  </tr>
                ) : (
                  filteredPurchases.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/80">
                      <td className="py-2.5 px-3 font-bold text-blue-600">{p.purchaseNo}</td>
                      <td className="py-2.5 px-3 text-slate-500 whitespace-nowrap text-[11px]">
                        {new Date(p.date).toLocaleString('id-ID')}
                      </td>
                      <td className="py-2.5 px-3 font-sans font-semibold text-slate-800">
                        {p.supplierName}
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-sans font-semibold">
                          {p.paymentStatus}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-bold text-slate-900">{formatRupiah(p.totalAmount)}</td>
                      <td className="py-2.5 px-3 font-sans text-slate-500 text-[11px]">{p.notes || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
