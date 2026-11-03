import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext.js';
import { Product } from '../types/index.js';
import { formatRupiah, calculateProfit, calculateMargin, formatMargin } from '../utils/money.js';
import {
  Search,
  BadgeDollarSign,
  History,
  TrendingUp,
  Percent,
  Check,
  X,
  Layers,
  ArrowRight,
  Filter,
} from 'lucide-react';

export const PriceManagementView: React.FC = () => {
  const { products, priceHistories, updateProductPrice, batchUpdatePrices } = useStore();

  const [activeTab, setActiveTab] = useState<'prices' | 'history'>('prices');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);

  // Edit single product price modal
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [singleBuyPrice, setSingleBuyPrice] = useState<number>(0);
  const [singleSellPrice, setSingleSellPrice] = useState<number>(0);
  const [singleReason, setSingleReason] = useState<string>('');

  // Batch update modal
  const [isBatchModalOpen, setIsBatchModalOpen] = useState<boolean>(false);
  const [batchActionType, setBatchActionType] = useState<'percent_sell' | 'nominal_sell'>('percent_sell');
  const [batchValue, setBatchValue] = useState<number>(5);
  const [batchReason, setBatchReason] = useState<string>('Penyesuaian inflasi & harga pasar');

  const filteredProducts = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q)
    );
  }, [products, searchTerm]);

  // Handle single price edit
  const openSingleEdit = (p: Product) => {
    setEditingProduct(p);
    setSingleBuyPrice(p.buyPrice);
    setSingleSellPrice(p.sellPrice);
    setSingleReason('Penyesuaian harga supplier');
  };

  const handleSaveSinglePrice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    updateProductPrice(
      editingProduct.id,
      Number(singleBuyPrice),
      Number(singleSellPrice),
      singleReason
    );
    setEditingProduct(null);
  };

  // Toggle select all
  const handleSelectAll = () => {
    if (selectedProductIds.length === filteredProducts.length) {
      setSelectedProductIds([]);
    } else {
      setSelectedProductIds(filteredProducts.map((p) => p.id));
    }
  };

  const toggleSelectProduct = (id: string) => {
    setSelectedProductIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Execute batch update
  const handleApplyBatchUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    const targets = products.filter((p) => selectedProductIds.includes(p.id));
    if (targets.length === 0) return;

    const updates = targets.map((p) => {
      let newSell = p.sellPrice;
      if (batchActionType === 'percent_sell') {
        const factor = 1 + batchValue / 100;
        newSell = Math.round((p.sellPrice * factor) / 500) * 500; // Round to nearest 500 Rp
      } else {
        newSell = Math.max(0, p.sellPrice + batchValue);
      }
      return {
        id: p.id,
        newBuyPrice: p.buyPrice,
        newSellPrice: newSell,
      };
    });

    batchUpdatePrices(updates, batchReason);
    setIsBatchModalOpen(false);
    setSelectedProductIds([]);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Manajemen Harga &amp; Margin
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Kendalikan harga modal, harga jual, kalkulasi margin otomatis, dan audit riwayat perubahan harga.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Tabs */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setActiveTab('prices')}
              className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
                activeTab === 'prices'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BadgeDollarSign className="w-3.5 h-3.5" />
              <span>Daftar Harga ({products.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-3 py-1.5 rounded-md transition-colors flex items-center gap-1.5 ${
                activeTab === 'history'
                  ? 'bg-white text-blue-600 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>Riwayat Perubahan ({priceHistories.length})</span>
            </button>
          </div>
        </div>
      </div>

      {activeTab === 'prices' && (
        <>
          {/* Action and Search Bar */}
          <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Cari produk untuk disesuaikan harganya..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-200 bg-slate-50/50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsBatchModalOpen(true)}
                disabled={selectedProductIds.length === 0}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  selectedProductIds.length === 0
                    ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Ubah Harga Massal ({selectedProductIds.length})</span>
              </button>
            </div>
          </div>

          {/* Pricing Table */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3 px-4 w-10">
                      <input
                        type="checkbox"
                        checked={
                          selectedProductIds.length > 0 &&
                          selectedProductIds.length === filteredProducts.length
                        }
                        onChange={handleSelectAll}
                        className="rounded text-blue-600"
                      />
                    </th>
                    <th className="py-3 px-3">Kode &amp; Nama Produk</th>
                    <th className="py-3 px-3">Harga Modal (Beli)</th>
                    <th className="py-3 px-3">Harga Jual</th>
                    <th className="py-3 px-3">Keuntungan per Unit</th>
                    <th className="py-3 px-3">Margin Laba</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.map((p) => {
                    const profit = calculateProfit(p.sellPrice, p.buyPrice);
                    const margin = calculateMargin(p.sellPrice, p.buyPrice);
                    const isSelected = selectedProductIds.includes(p.id);

                    return (
                      <tr
                        key={p.id}
                        className={`hover:bg-slate-50/80 transition-colors ${
                          isSelected ? 'bg-blue-50/40' : ''
                        }`}
                      >
                        <td className="py-3 px-4">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectProduct(p.id)}
                            className="rounded text-blue-600"
                          />
                        </td>
                        <td className="py-3 px-3 max-w-xs">
                          <div className="font-bold text-slate-800 leading-tight">
                            {p.name}
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="font-mono text-[11px] text-blue-600 font-semibold">
                              {p.code}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              • {p.categoryName}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-3 font-mono font-semibold text-slate-700">
                          {formatRupiah(p.buyPrice)}
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-blue-600">
                          {formatRupiah(p.sellPrice)}
                        </td>
                        <td className="py-3 px-3 font-mono font-semibold text-emerald-600">
                          +{formatRupiah(profit)}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                              margin >= 25
                                ? 'bg-emerald-100 text-emerald-800'
                                : margin >= 15
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {formatMargin(margin)}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => openSingleEdit(p)}
                            className="px-2.5 py-1 rounded bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 font-semibold transition-colors text-[11px]"
                          >
                            Ubah Harga
                          </button>
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

      {/* Price History Tab */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-800">
              Riwayat Perubahan Harga (Audit Trail)
            </h2>
            <p className="text-xs text-slate-500">
              Setiap pembaruan harga modal atau jual tersimpan lengkap dengan waktu, harga sebelum &amp; sesudah, serta alasannya.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Waktu</th>
                  <th className="py-3 px-3">Produk</th>
                  <th className="py-3 px-3">Harga Modal (Sebelum &rarr; Sesudah)</th>
                  <th className="py-3 px-3">Harga Jual (Sebelum &rarr; Sesudah)</th>
                  <th className="py-3 px-3">Alasan Perubahan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {priceHistories.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400 font-sans">
                      Belum ada riwayat perubahan harga.
                    </td>
                  </tr>
                ) : (
                  priceHistories.map((h) => (
                    <tr key={h.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 text-slate-500 whitespace-nowrap text-[11px]">
                        {new Date(h.timestamp).toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 px-3 font-sans">
                        <div className="font-semibold text-slate-800">{h.productName}</div>
                        <div className="text-[10px] text-blue-600 font-mono">{h.productCode}</div>
                      </td>
                      <td className="py-3 px-3 text-slate-700">
                        <span>{formatRupiah(h.oldBuyPrice)}</span>
                        <span className="mx-1.5 text-slate-400">&rarr;</span>
                        <span className="font-bold text-slate-900">{formatRupiah(h.newBuyPrice)}</span>
                      </td>
                      <td className="py-3 px-3 text-slate-700">
                        <span>{formatRupiah(h.oldSellPrice)}</span>
                        <span className="mx-1.5 text-slate-400">&rarr;</span>
                        <span className="font-bold text-blue-600">{formatRupiah(h.newSellPrice)}</span>
                      </td>
                      <td className="py-3 px-3 font-sans text-slate-600 max-w-xs">
                        {h.reason}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Single Price Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Ubah Harga Produk</h3>
              <button onClick={() => setEditingProduct(null)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSaveSinglePrice} className="mt-4 space-y-4">
              <div>
                <p className="text-xs font-bold text-slate-800">{editingProduct.name}</p>
                <p className="text-[11px] font-mono text-slate-400">{editingProduct.code}</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Harga Modal (Beli) Baru Rp
                </label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  required
                  value={singleBuyPrice}
                  onChange={(e) => setSingleBuyPrice(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-xs font-mono font-bold rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Harga Jual Baru Rp
                </label>
                <input
                  type="number"
                  min="0"
                  step="500"
                  required
                  value={singleSellPrice}
                  onChange={(e) => setSingleSellPrice(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-xs font-mono font-bold text-blue-600 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              {/* Instant Margin Preview */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs flex justify-between">
                <span>Laba: <strong>{formatRupiah(singleSellPrice - singleBuyPrice)}</strong></span>
                <span>Margin: <strong>{formatMargin(calculateMargin(singleSellPrice, singleBuyPrice))}</strong></span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Alasan Perubahan Harga
                </label>
                <input
                  type="text"
                  required
                  value={singleReason}
                  onChange={(e) => setSingleReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Batch Price Update Modal */}
      {isBatchModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                Ubah Harga Massal ({selectedProductIds.length} Produk Terpilih)
              </h3>
              <button onClick={() => setIsBatchModalOpen(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleApplyBatchUpdate} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Metode Penyesuaian Harga Jual
                </label>
                <select
                  value={batchActionType}
                  onChange={(e) => setBatchActionType(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="percent_sell">Kenaikan / Penurunan Persentase (%)</option>
                  <option value="nominal_sell">Tambah / Kurang Nominal Tetap (Rp)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nilai Penyesuaian {batchActionType === 'percent_sell' ? '(%)' : '(Rp)'}
                </label>
                <input
                  type="number"
                  step={batchActionType === 'percent_sell' ? '1' : '1000'}
                  required
                  value={batchValue}
                  onChange={(e) => setBatchValue(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-xs font-mono font-bold rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Gunakan angka positif untuk kenaikan (contoh: 5 atau 5000), atau negatif untuk diskon.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Alasan Perubahan Massal
                </label>
                <input
                  type="text"
                  required
                  value={batchReason}
                  onChange={(e) => setBatchReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsBatchModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
                >
                  Terapkan Update Massal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
