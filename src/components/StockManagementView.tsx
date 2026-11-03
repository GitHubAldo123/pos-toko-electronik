import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext.js';
import { Product } from '../types/index.js';
import { formatNumber, formatRupiah } from '../utils/money.js';
import {
  getStockStatus,
  getStockStatusLabel,
  calculateStockAdjustment,
  filterLowStockProducts,
  filterOutOfStockProducts,
} from '../utils/stock.js';
import {
  ArrowLeftRight,
  PlusCircle,
  MinusCircle,
  ClipboardCheck,
  AlertTriangle,
  History,
  Search,
  Filter,
  CheckCircle,
  X,
  FileText,
} from 'lucide-react';

export const StockManagementView: React.FC = () => {
  const { products, stockMovements, adjustStock } = useStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'movements' | 'opname'>('overview');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [movementFilter, setMovementFilter] = useState<string>('ALL');

  // Modal State for Manual In / Out
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState<boolean>(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [adjustType, setAdjustType] = useState<'IN' | 'OUT'>('IN');
  const [adjustQty, setAdjustQty] = useState<number>(1);
  const [adjustReason, setAdjustReason] = useState<string>('');
  const [adjustUser, setAdjustUser] = useState<string>('Petugas Gudang');

  // Opname Modal
  const [isOpnameModalOpen, setIsOpnameModalOpen] = useState<boolean>(false);
  const [opnamePhysicalCount, setOpnamePhysicalCount] = useState<number>(0);
  const [opnameReason, setOpnameReason] = useState<string>('Stok Opname Rutin Bulanan');

  const lowStock = filterLowStockProducts(products);
  const outOfStock = filterOutOfStockProducts(products);

  const filteredProducts = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q)
    );
  }, [products, searchTerm]);

  const filteredMovements = useMemo(() => {
    return stockMovements.filter((m) => {
      if (movementFilter !== 'ALL' && m.type !== movementFilter) return false;
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        return (
          m.productName.toLowerCase().includes(q) ||
          m.productCode.toLowerCase().includes(q) ||
          m.reason.toLowerCase().includes(q) ||
          (m.referenceNo && m.referenceNo.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [stockMovements, movementFilter, searchTerm]);

  // Handle open quick stock adjust
  const openAdjust = (p: Product, type: 'IN' | 'OUT') => {
    setSelectedProduct(p);
    setAdjustType(type);
    setAdjustQty(1);
    setAdjustReason(type === 'IN' ? 'Restock barang masuk tambahan' : 'Barang rusak / uji coba toko');
    setIsAdjustModalOpen(true);
  };

  const handleSaveAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || adjustQty <= 0) return;

    adjustStock(
      selectedProduct.id,
      adjustType,
      adjustQty,
      adjustReason,
      adjustUser
    );

    setIsAdjustModalOpen(false);
  };

  // Handle Opname
  const openOpname = (p: Product) => {
    setSelectedProduct(p);
    setOpnamePhysicalCount(p.stock);
    setOpnameReason('Stok Opname Rutin Fisik');
    setIsOpnameModalOpen(true);
  };

  const handleSaveOpname = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    adjustStock(
      selectedProduct.id,
      'ADJUST',
      opnamePhysicalCount,
      `${opnameReason} (Fisik: ${opnamePhysicalCount}, Sistem: ${selectedProduct.stock})`,
      adjustUser
    );

    setIsOpnameModalOpen(false);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Manajemen Stok &amp; Mutasi Persediaan
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Penambahan stok, pengurangan pemakaian internal, audit stok opname, dan riwayat mutasi lengkap.
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs font-semibold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'overview'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>Kondisi Stok</span>
          </button>
          <button
            onClick={() => setActiveTab('movements')}
            className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'movements'
                ? 'bg-white text-blue-600 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Riwayat Mutasi ({stockMovements.length})</span>
          </button>
        </div>
      </div>

      {/* Stock Health Banners if any low or out */}
      {(outOfStock.length > 0 || lowStock.length > 0) && activeTab === 'overview' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {outOfStock.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-red-100 text-red-600">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h2 className="text-xs font-bold text-red-800">
                  {outOfStock.length} Produk Habis Total (Stok 0)
                </h2>
                <p className="text-[11px] text-red-600 mt-0.5 truncate">
                  {outOfStock.map((p) => p.name).join(', ')}
                </p>
              </div>
            </div>
          )}

          {lowStock.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-start gap-3">
              <div className="p-2 rounded-lg bg-amber-100 text-amber-600">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <h2 className="text-xs font-bold text-amber-800">
                  {lowStock.length} Produk Mendekati Stok Minimum
                </h2>
                <p className="text-[11px] text-amber-600 mt-0.5 truncate">
                  {lowStock.map((p) => `${p.name} (sisa ${p.stock})`).join(', ')}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 1: Stock Overview */}
      {activeTab === 'overview' && (
        <>
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari barang untuk penyesuaian stok atau opname..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50/50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <p className="text-xs text-slate-500">
              Total {products.length} SKU terdaftar di database
            </p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4">Kode &amp; Nama Barang</th>
                    <th className="py-3 px-3">Kategori</th>
                    <th className="py-3 px-3">Lokasi Rak</th>
                    <th className="py-3 px-3">Stok Saat Ini</th>
                    <th className="py-3 px-3">Stok Min</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-4 text-right">Aksi Cepat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.map((p) => {
                    const status = getStockStatus(p.stock, p.minStock);
                    const statusBadge = getStockStatusLabel(status);

                    return (
                      <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 max-w-xs">
                          <div className="font-bold text-slate-800">{p.name}</div>
                          <span className="font-mono text-[11px] text-blue-600 font-semibold">
                            {p.code}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                            {p.categoryName}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-slate-500">
                          {p.location || '-'}
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-slate-900 text-sm">
                          {p.stock} <span className="text-xs font-normal text-slate-500">{p.unit}</span>
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-500">
                          {p.minStock} {p.unit}
                        </td>
                        <td className="py-3 px-3">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${statusBadge.badgeClass}`}>
                            {statusBadge.label}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => openAdjust(p, 'IN')}
                              className="px-2 py-1 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold text-[11px] flex items-center gap-1 transition-colors"
                              title="Tambah Stok Masuk"
                            >
                              <PlusCircle className="w-3 h-3" />
                              <span>Masuk</span>
                            </button>
                            <button
                              onClick={() => openAdjust(p, 'OUT')}
                              className="px-2 py-1 rounded bg-red-50 hover:bg-red-100 text-red-700 font-semibold text-[11px] flex items-center gap-1 transition-colors"
                              title="Catat Stok Keluar / Rusak"
                            >
                              <MinusCircle className="w-3 h-3" />
                              <span>Keluar</span>
                            </button>
                            <button
                              onClick={() => openOpname(p)}
                              className="px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-[11px] flex items-center gap-1 transition-colors"
                              title="Stok Opname Fisik"
                            >
                              <ClipboardCheck className="w-3 h-3" />
                              <span>Opname</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* TAB 2: Movements Audit Log */}
      {activeTab === 'movements' && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari mutasi barang, no invoice, PO..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 bg-slate-50/50 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={movementFilter}
                onChange={(e) => setMovementFilter(e.target.value)}
                className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white"
              >
                <option value="ALL">Semua Jenis Mutasi</option>
                <option value="SALE">Penjualan Kasir (SALE)</option>
                <option value="PURCHASE">Pembelian Supplier (PURCHASE)</option>
                <option value="IN">Stok Masuk Manual (IN)</option>
                <option value="OUT">Stok Keluar Manual (OUT)</option>
                <option value="ADJUST">Stok Opname (ADJUST)</option>
                <option value="RETURN">Retur Penjualan (RETURN)</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Waktu</th>
                  <th className="py-3 px-3">Produk</th>
                  <th className="py-3 px-3">Jenis Mutasi</th>
                  <th className="py-3 px-3">Perubahan</th>
                  <th className="py-3 px-3">Sebelum &rarr; Sesudah</th>
                  <th className="py-3 px-3">Keterangan &amp; Ref</th>
                  <th className="py-3 px-4 text-right">Petugas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {filteredMovements.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400 font-sans">
                      Tidak ada mutasi stok yang sesuai.
                    </td>
                  </tr>
                ) : (
                  filteredMovements.map((m) => (
                    <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap text-[11px]">
                        {new Date(m.timestamp).toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 px-3 font-sans">
                        <div className="font-semibold text-slate-800">{m.productName}</div>
                        <div className="text-[10px] text-blue-600 font-mono">{m.productCode}</div>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            m.type === 'SALE'
                              ? 'bg-blue-100 text-blue-700'
                              : m.type === 'PURCHASE'
                              ? 'bg-emerald-100 text-emerald-700'
                              : m.type === 'IN'
                              ? 'bg-teal-100 text-teal-700'
                              : m.type === 'OUT'
                              ? 'bg-red-100 text-red-700'
                              : m.type === 'RETURN'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {m.type}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-bold">
                        <span className={m.quantity > 0 ? 'text-emerald-600' : 'text-red-600'}>
                          {m.quantity > 0 ? `+${m.quantity}` : m.quantity}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-600">
                        <span>{m.beforeStock}</span>
                        <span className="mx-1 text-slate-400">&rarr;</span>
                        <span className="font-bold text-slate-900">{m.afterStock}</span>
                      </td>
                      <td className="py-3 px-3 font-sans text-slate-600 max-w-xs">
                        {m.reason}
                      </td>
                      <td className="py-3 px-4 text-right font-sans text-slate-500">
                        {m.user}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Manual In/Out Modal */}
      {isAdjustModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                {adjustType === 'IN' ? 'Catat Stok Masuk' : 'Catat Stok Keluar'}
              </h3>
              <button onClick={() => setIsAdjustModalOpen(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSaveAdjust} className="mt-4 space-y-4">
              <div>
                <p className="text-xs font-bold text-slate-800">{selectedProduct.name}</p>
                <p className="text-[11px] font-mono text-slate-400">
                  Stok saat ini: <strong className="text-slate-700">{selectedProduct.stock} {selectedProduct.unit}</strong>
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Jumlah {adjustType === 'IN' ? 'Penambahan' : 'Pengurangan'} ({selectedProduct.unit})
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 text-xs font-mono font-bold rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Alasan Perubahan
                </label>
                <input
                  type="text"
                  required
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Petugas Gudang / Pengguna
                </label>
                <input
                  type="text"
                  required
                  value={adjustUser}
                  onChange={(e) => setAdjustUser(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAdjustModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className={`px-4 py-1.5 text-xs font-semibold text-white rounded-lg shadow-xs ${
                    adjustType === 'IN'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  Simpan Mutasi Stok
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stok Opname Modal */}
      {isOpnameModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                Stok Opname Fisik
              </h3>
              <button onClick={() => setIsOpnameModalOpen(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSaveOpname} className="mt-4 space-y-4">
              <div>
                <p className="text-xs font-bold text-slate-800">{selectedProduct.name}</p>
                <p className="text-[11px] font-mono text-slate-500">
                  Stok di Sistem: <span className="font-bold text-slate-800">{selectedProduct.stock} {selectedProduct.unit}</span>
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Hasil Perhitungan Fisik Riil ({selectedProduct.unit})
                </label>
                <input
                  type="number"
                  min="0"
                  required
                  value={opnamePhysicalCount}
                  onChange={(e) => setOpnamePhysicalCount(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-xs font-mono font-bold rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Discrepancy Preview */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs flex justify-between items-center">
                <span>Selisih Fisik vs Sistem:</span>
                <span
                  className={`font-mono font-bold ${
                    opnamePhysicalCount - selectedProduct.stock === 0
                      ? 'text-emerald-600'
                      : opnamePhysicalCount - selectedProduct.stock > 0
                      ? 'text-blue-600'
                      : 'text-red-600'
                  }`}
                >
                  {opnamePhysicalCount - selectedProduct.stock > 0 ? '+' : ''}
                  {opnamePhysicalCount - selectedProduct.stock} {selectedProduct.unit}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Keterangan / Alasan Penyesuaian
                </label>
                <input
                  type="text"
                  required
                  value={opnameReason}
                  onChange={(e) => setOpnameReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsOpnameModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
                >
                  Terapkan Hasil Opname
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
