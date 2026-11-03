import React, { useState } from 'react';
import { useStore } from '../context/StoreContext.js';
import { PurchaseItem } from '../types/index.js';
import { formatRupiah, formatNumber } from '../utils/money.js';
import {
  Truck,
  Plus,
  Trash2,
  Calendar,
  CheckCircle,
  Clock,
  Search,
  FileText,
  Boxes,
  X,
} from 'lucide-react';

export const PurchasesView: React.FC = () => {
  const { purchases, suppliers, products, createPurchase } = useStore();

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>(suppliers[0]?.id || '');
  const [paymentStatus, setPaymentStatus] = useState<'LUNAS' | 'HUTANG'>('LUNAS');
  const [purchaseNotes, setPurchaseNotes] = useState<string>('');
  const [items, setItems] = useState<PurchaseItem[]>([]);

  // Item selector for adding to PO
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [itemQty, setItemQty] = useState<number>(5);
  const [itemBuyPrice, setItemBuyPrice] = useState<number>(0);

  // When selected product changes, pre-fill its buy price
  const handleProductChange = (prodId: string) => {
    setSelectedProductId(prodId);
    const prod = products.find((p) => p.id === prodId);
    if (prod) {
      setItemBuyPrice(prod.buyPrice);
    }
  };

  const handleOpenAdd = () => {
    const firstProd = products[0];
    setSelectedSupplierId(suppliers[0]?.id || '');
    setPaymentStatus('LUNAS');
    setPurchaseNotes('');
    setItems([]);
    if (firstProd) {
      setSelectedProductId(firstProd.id);
      setItemBuyPrice(firstProd.buyPrice);
      setItemQty(5);
    }
    setIsModalOpen(true);
  };

  const handleAddItemToPO = () => {
    const prod = products.find((p) => p.id === selectedProductId);
    if (!prod || itemQty <= 0) return;

    // Check if already in list
    const existingIndex = items.findIndex((i) => i.productId === prod.id);
    if (existingIndex >= 0) {
      setItems((prev) =>
        prev.map((item, idx) =>
          idx === existingIndex
            ? {
                ...item,
                qty: item.qty + itemQty,
                buyPrice: itemBuyPrice,
                subtotal: (item.qty + itemQty) * itemBuyPrice,
              }
            : item
        )
      );
    } else {
      setItems((prev) => [
        ...prev,
        {
          productId: prod.id,
          code: prod.code,
          name: prod.name,
          unit: prod.unit,
          qty: itemQty,
          buyPrice: itemBuyPrice,
          subtotal: itemQty * itemBuyPrice,
        },
      ]);
    }
  };

  const handleRemoveItem = (prodId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== prodId));
  };

  const totalPOAmount = items.reduce((sum, item) => sum + item.subtotal, 0);

  const handleSubmitPO = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    const sup = suppliers.find((s) => s.id === selectedSupplierId);

    createPurchase({
      supplierId: selectedSupplierId,
      supplierName: sup?.name || 'Supplier',
      items,
      totalAmount: totalPOAmount,
      paymentStatus,
      notes: purchaseNotes || undefined,
    });

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Manajemen Pembelian (PO Supplier)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Pencatatan pembelian barang dari suplier. Stok bertambah otomatis dan mutasi tercatat tanpa mengubah harga jual.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Pembelian Baru</span>
        </button>
      </div>

      {/* Purchase List Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">No. Pembelian</th>
                <th className="py-3 px-3">Tanggal</th>
                <th className="py-3 px-3">Supplier</th>
                <th className="py-3 px-3">Daftar Barang Dibeli</th>
                <th className="py-3 px-3">Total Pembelian</th>
                <th className="py-3 px-3">Status Bayar</th>
                <th className="py-3 px-4 text-right">Catatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {purchases.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-400">
                    <Truck className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-sm">Belum ada riwayat pembelian supplier.</p>
                  </td>
                </tr>
              ) : (
                purchases.map((po) => (
                  <tr key={po.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-blue-600">
                      {po.purchaseNo}
                    </td>
                    <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                      {new Date(po.date).toLocaleDateString('id-ID', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-800">
                      {po.supplierName}
                    </td>
                    <td className="py-3 px-3 max-w-sm">
                      <div className="space-y-1">
                        {po.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-[11px] text-slate-600">
                            <span>
                              {item.name} ({item.qty} {item.unit})
                            </span>
                            <span className="font-mono text-slate-900 ml-2">
                              {formatRupiah(item.subtotal)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-slate-900 text-sm">
                      {formatRupiah(po.totalAmount)}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          po.paymentStatus === 'LUNAS'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {po.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-slate-400 text-[11px]">
                      {po.notes || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Purchase Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                Pencatatan Pembelian Barang dari Supplier
              </h3>
              <button onClick={() => setIsModalOpen(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSubmitPO} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Supplier */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Pilih Supplier <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedSupplierId}
                    onChange={(e) => setSelectedSupplierId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none"
                  >
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status Pembayaran */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Status Pembayaran
                  </label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none"
                  >
                    <option value="LUNAS">Lunas (Tunai/Transfer)</option>
                    <option value="HUTANG">Hutang Supplier / Tempo</option>
                  </select>
                </div>
              </div>

              {/* Add item to PO bar */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                <span className="text-xs font-bold text-slate-800">
                  Tambah Item Pembelian
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-end">
                  <div className="sm:col-span-6">
                    <label className="block text-[11px] text-slate-600 mb-1">
                      Pilih Barang
                    </label>
                    <select
                      value={selectedProductId}
                      onChange={(e) => handleProductChange(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-300 bg-white"
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} (Stok: {p.stock} {p.unit})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] text-slate-600 mb-1">
                      Kuantitas
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={itemQty}
                      onChange={(e) => setItemQty(parseInt(e.target.value) || 1)}
                      className="w-full px-2 py-1.5 text-xs font-mono font-bold rounded-lg border border-slate-300"
                    />
                  </div>

                  <div className="sm:col-span-3">
                    <label className="block text-[11px] text-slate-600 mb-1">
                      Harga Beli Satuan (Rp)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="500"
                      value={itemBuyPrice}
                      onChange={(e) => setItemBuyPrice(parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1.5 text-xs font-mono font-bold rounded-lg border border-slate-300"
                    />
                  </div>

                  <div className="sm:col-span-1">
                    <button
                      type="button"
                      onClick={handleAddItemToPO}
                      className="w-full py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Items in PO Table */}
              <div className="border border-slate-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="p-2">Barang</th>
                      <th className="p-2">Qty</th>
                      <th className="p-2">Harga Beli</th>
                      <th className="p-2">Subtotal</th>
                      <th className="p-2 text-right">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {items.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-4 text-center text-slate-400 font-sans text-xs">
                          Belum ada item ditambahkan ke PO.
                        </td>
                      </tr>
                    ) : (
                      items.map((it) => (
                        <tr key={it.productId}>
                          <td className="p-2 font-sans font-semibold text-slate-800">
                            {it.name}
                          </td>
                          <td className="p-2 font-bold">{it.qty} {it.unit}</td>
                          <td className="p-2">{formatRupiah(it.buyPrice)}</td>
                          <td className="p-2 font-bold text-slate-900">{formatRupiah(it.subtotal)}</td>
                          <td className="p-2 text-right font-sans">
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(it.productId)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                  {items.length > 0 && (
                    <tfoot className="bg-slate-50 font-mono font-bold text-slate-900 border-t border-slate-200">
                      <tr>
                        <td colSpan={3} className="p-2 text-right font-sans">
                          TOTAL PEMBELIAN:
                        </td>
                        <td colSpan={2} className="p-2 text-blue-600 text-sm">
                          {formatRupiah(totalPOAmount)}
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Catatan Pembelian / No. Surat Jalan Supplier
                </label>
                <input
                  type="text"
                  placeholder="Contoh: No. Faktur Pajak / Surat Jalan Supplier SJ-8871"
                  value={purchaseNotes}
                  onChange={(e) => setPurchaseNotes(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={items.length === 0}
                  className={`px-4 py-1.5 text-xs font-semibold text-white rounded-lg shadow-xs transition-colors ${
                    items.length === 0
                      ? 'bg-slate-300 cursor-not-allowed'
                      : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  Simpan Pembelian &amp; Tambah Stok
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
