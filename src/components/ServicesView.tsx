import React, { useState } from 'react';
import { useStore } from '../context/StoreContext.js';
import { ServiceItem, ServiceUnit } from '../types/index.js';
import { formatRupiah, calculateProfit, calculateMargin, formatMargin } from '../utils/money.js';
import {
  Printer,
  Plus,
  Edit2,
  Trash2,
  Calculator,
  CheckCircle,
  X,
  FileText,
  Layers,
  ArrowRight,
  ShoppingCart,
} from 'lucide-react';

interface ServicesViewProps {
  setActiveTab: (tab: string) => void;
}

export const ServicesView: React.FC<ServicesViewProps> = ({ setActiveTab }) => {
  const { services, categories, products, addService, updateService, deleteService } = useStore();

  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);

  // Quick Calculator state
  const [calcServiceId, setCalcServiceId] = useState<string>(services[0]?.id || '');
  const [calcQuantity, setCalcQuantity] = useState<number>(50);
  const [calcFinishingId, setCalcFinishingId] = useState<string>(''); // e.g. jilid or laminasi

  // Form State
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    categoryId: 'cat-srv-print',
    unit: 'lembar' as ServiceUnit,
    costPrice: 0,
    sellPrice: 0,
    isActive: true,
    notes: '',
    linkedSupplyProductId: '',
    supplyUsagePerUnit: 1,
  });

  const handleOpenAdd = () => {
    setEditingService(null);
    setFormData({
      code: `JSA-${Date.now().toString().slice(-4)}`,
      name: '',
      categoryId: 'cat-srv-print',
      unit: 'lembar',
      costPrice: 0,
      sellPrice: 0,
      isActive: true,
      notes: '',
      linkedSupplyProductId: '',
      supplyUsagePerUnit: 1,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (s: ServiceItem) => {
    setEditingService(s);
    setFormData({
      code: s.code,
      name: s.name,
      categoryId: s.categoryId,
      unit: s.unit,
      costPrice: s.costPrice,
      sellPrice: s.sellPrice,
      isActive: s.isActive,
      notes: s.notes || '',
      linkedSupplyProductId: s.linkedSupplyProductId || '',
      supplyUsagePerUnit: s.supplyUsagePerUnit || 1,
    });
    setIsModalOpen(true);
  };

  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.code) return;

    const cat = categories.find((c) => c.id === formData.categoryId);

    if (editingService) {
      updateService(editingService.id, {
        code: formData.code,
        name: formData.name,
        categoryId: formData.categoryId,
        categoryName: cat?.name || 'Jasa Percetakan',
        unit: formData.unit,
        costPrice: Number(formData.costPrice),
        sellPrice: Number(formData.sellPrice),
        isActive: formData.isActive,
        notes: formData.notes,
        linkedSupplyProductId: formData.linkedSupplyProductId || undefined,
        supplyUsagePerUnit: formData.linkedSupplyProductId ? Number(formData.supplyUsagePerUnit) : undefined,
      });
    } else {
      addService({
        code: formData.code,
        name: formData.name,
        categoryId: formData.categoryId,
        categoryName: cat?.name || 'Jasa Percetakan',
        unit: formData.unit,
        costPrice: Number(formData.costPrice),
        sellPrice: Number(formData.sellPrice),
        isActive: formData.isActive,
        notes: formData.notes,
        linkedSupplyProductId: formData.linkedSupplyProductId || undefined,
        supplyUsagePerUnit: formData.linkedSupplyProductId ? Number(formData.supplyUsagePerUnit) : undefined,
      });
    }

    setIsModalOpen(false);
  };

  // Calculator computation
  const selectedCalcService = services.find((s) => s.id === calcServiceId);
  const selectedFinishing = services.find((s) => s.id === calcFinishingId);

  const calcMainCost = selectedCalcService ? selectedCalcService.sellPrice * calcQuantity : 0;
  const calcFinishingCost = selectedFinishing ? selectedFinishing.sellPrice : 0;
  const calcTotalEstimate = calcMainCost + calcFinishingCost;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Manajemen Jasa Percetakan
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Daftar tarif layanan print dokumen, fotokopi, jilid, laminasi, cetak foto, banner, dan kalkulator order cepat.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Layanan Jasa</span>
          </button>
        </div>
      </div>

      {/* Quick Calculator Card */}
      <div className="bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-5 sm:p-6 text-white shadow-md">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 rounded-lg bg-indigo-500/30 text-indigo-300 flex items-center justify-center">
            <Calculator className="w-4 h-4" />
          </div>
          <h2 className="text-sm sm:text-base font-bold">
            Kalkulator Cepat Biaya Cetak &amp; Finishing
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
          {/* Main Service */}
          <div className="sm:col-span-4">
            <label className="block text-xs text-indigo-200 mb-1 font-medium">
              Pilih Layanan Utama
            </label>
            <select
              value={calcServiceId}
              onChange={(e) => setCalcServiceId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg bg-slate-800 text-white border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({formatRupiah(s.sellPrice)}/{s.unit})
                </option>
              ))}
            </select>
          </div>

          {/* Quantity */}
          <div className="sm:col-span-2">
            <label className="block text-xs text-indigo-200 mb-1 font-medium">
              Jumlah ({selectedCalcService?.unit || 'Lembar'})
            </label>
            <input
              type="number"
              min="1"
              value={calcQuantity}
              onChange={(e) => setCalcQuantity(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 text-xs rounded-lg bg-slate-800 text-white border border-slate-700 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>

          {/* Finishing (Optional) */}
          <div className="sm:col-span-3">
            <label className="block text-xs text-indigo-200 mb-1 font-medium">
              Tambahan Jilid / Finishing (Opsional)
            </label>
            <select
              value={calcFinishingId}
              onChange={(e) => setCalcFinishingId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg bg-slate-800 text-white border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            >
              <option value="">Tanpa Tambahan Jilid</option>
              {services
                .filter((s) => s.categoryId === 'cat-srv-finish')
                .map((s) => (
                  <option key={s.id} value={s.id}>
                    + {s.name} ({formatRupiah(s.sellPrice)})
                  </option>
                ))}
            </select>
          </div>

          {/* Total Calculation Output */}
          <div className="sm:col-span-3 bg-slate-800/80 p-3 rounded-xl border border-indigo-500/30 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-indigo-200 uppercase tracking-wider font-semibold">
                Estimasi Total
              </p>
              <p className="text-base sm:text-lg font-black text-emerald-400 font-mono">
                {formatRupiah(calcTotalEstimate)}
              </p>
            </div>
            <button
              onClick={() => setActiveTab('pos')}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Ke Kasir</span>
            </button>
          </div>
        </div>
      </div>

      {/* Services Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Kode &amp; Nama Layanan</th>
                <th className="py-3 px-3">Kategori</th>
                <th className="py-3 px-3">Satuan</th>
                <th className="py-3 px-3">Harga Modal Bahan</th>
                <th className="py-3 px-3">Tarif Harga Jual</th>
                <th className="py-3 px-3">Margin Laba</th>
                <th className="py-3 px-3">Pemakaian Bahan Stok</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {services.map((s) => {
                const profit = calculateProfit(s.sellPrice, s.costPrice);
                const margin = calculateMargin(s.sellPrice, s.costPrice);
                const linkedProduct = products.find((p) => p.id === s.linkedSupplyProductId);

                return (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 max-w-xs">
                      <div className="font-bold text-slate-800">{s.name}</div>
                      <div className="text-[11px] font-mono text-blue-600 font-semibold mt-0.5">
                        {s.code}
                      </div>
                      {s.notes && (
                        <p className="text-[11px] text-slate-400 mt-0.5">{s.notes}</p>
                      )}
                    </td>

                    <td className="py-3 px-3">
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {s.categoryName}
                      </span>
                    </td>

                    <td className="py-3 px-3 font-semibold text-slate-700">
                      Per {s.unit}
                    </td>

                    <td className="py-3 px-3 font-mono text-slate-600">
                      {formatRupiah(s.costPrice)}
                    </td>

                    <td className="py-3 px-3 font-mono font-bold text-blue-600">
                      {formatRupiah(s.sellPrice)}
                    </td>

                    <td className="py-3 px-3">
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-50 text-emerald-700">
                        {formatMargin(margin)}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-slate-600">
                      {linkedProduct ? (
                        <div className="text-[11px]">
                          <span className="font-semibold text-slate-800">
                            {linkedProduct.name}
                          </span>
                          <p className="text-[10px] text-slate-400">
                            {s.supplyUsagePerUnit} {linkedProduct.unit} per {s.unit}
                          </p>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Tidak dikonfigurasi</span>
                      )}
                    </td>

                    <td className="py-3 px-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          s.isActive
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {s.isActive ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(s)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Edit Layanan"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteService(s.id)}
                          className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Hapus Layanan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* Add / Edit Service Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                {editingService ? 'Edit Layanan Jasa Percetakan' : 'Tambah Layanan Percetakan'}
              </h3>
              <button onClick={() => setIsModalOpen(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSaveService} className="mt-4 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kode Layanan
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Satuan Hitungan
                  </label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none"
                  >
                    <option value="lembar">Lembar</option>
                    <option value="halaman">Halaman</option>
                    <option value="buku">Buku</option>
                    <option value="set">Set</option>
                    <option value="paket">Paket</option>
                    <option value="meter">Meter (Banner)</option>
                    <option value="unit">Unit (Desain/File)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Layanan
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Print HVS A4 Hitam Putih"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Harga Modal / Bahan (Rp)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.costPrice}
                    onChange={(e) => setFormData({ ...formData, costPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Harga Jual ke Pelanggan (Rp)
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.sellPrice}
                    onChange={(e) => setFormData({ ...formData, sellPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-xs font-mono font-bold text-blue-600 rounded-lg border border-slate-300 focus:outline-none"
                  />
                </div>
              </div>

              {/* Material linkage */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Kaitkan Bahan Stok (Opsional)
                </label>
                <select
                  value={formData.linkedSupplyProductId}
                  onChange={(e) => setFormData({ ...formData, linkedSupplyProductId: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none"
                >
                  <option value="">Tidak mengaitkan stok bahan otomatis</option>
                  {products
                    .filter((p) => p.categoryType === 'printing_supply')
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (Stok: {p.stock} {p.unit})
                      </option>
                    ))}
                </select>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Jika dipilih, sistem akan memotong bahan ini saat kasir memproses jasa tersebut.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Catatan Keterangan
                </label>
                <input
                  type="text"
                  placeholder="Keterangan spesifikasi jenis kertas / mesin cetak"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
                >
                  Simpan Layanan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
