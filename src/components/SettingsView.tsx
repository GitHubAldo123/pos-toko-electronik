import React, { useState } from 'react';
import { useStore } from '../context/StoreContext.js';
import { StoreSettings } from '../types/index.js';
import {
  Settings,
  Save,
  RotateCcw,
  Download,
  Upload,
  Printer,
  Store,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    settings,
    updateSettings,
    resetToDefaultData,
    exportDatabaseJSON,
    importDatabaseJSON,
  } = useStore();

  const [formData, setFormData] = useState<StoreSettings>({ ...settings });
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [confirmReset, setConfirmReset] = useState<boolean>(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleExportBackup = () => {
    const jsonStr = exportDatabaseJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_sitoko_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importDatabaseJSON(content);
      if (success) {
        setImportStatus('Database berhasil di-restore dari file cadangan.');
      } else {
        setImportStatus('Gagal memuat cadangan. Format JSON tidak sesuai.');
      }
      setTimeout(() => setImportStatus(null), 4000);
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
          Pengaturan Toko &amp; Sistem
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Ubah identitas toko untuk struk penjualan, konfigurasi printer thermal, dan kelola cadangan database.
        </p>
      </div>

      {saveSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>Pengaturan toko berhasil diperbarui!</span>
        </div>
      )}

      {importStatus && (
        <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl text-blue-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-blue-600" />
          <span>{importStatus}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        {/* Identitas Toko Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Store className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900">
              Profil &amp; Identitas Toko (Tampil di Struk)
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nama Toko
              </label>
              <input
                type="text"
                required
                value={formData.storeName}
                onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Slogan / Deskripsi Singkat
              </label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Alamat Toko Lengkap
              </label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nomor Telepon / WhatsApp
              </label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Alamat Email Toko
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Pesan Ucapan di Bawah Struk (Footer)
              </label>
              <textarea
                rows={2}
                value={formData.receiptFooter}
                onChange={(e) => setFormData({ ...formData, receiptFooter: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Konfigurasi Printer & Transaksi Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Printer className="w-4 h-4 text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900">
              Konfigurasi Printer Struk &amp; Transaksi
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ukuran Kertas Printer Thermal Default
              </label>
              <select
                value={formData.receiptPaperSize}
                onChange={(e) => setFormData({ ...formData, receiptPaperSize: e.target.value as any })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none"
              >
                <option value="58mm">Thermal 58 mm (Printer Kasir Portabel/Bluetooth)</option>
                <option value="80mm">Thermal 80 mm (Printer Kasir Meja Standar POS)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Awalan Nomor Transaksi (Prefix)
              </label>
              <input
                type="text"
                required
                value={formData.invoicePrefix}
                onChange={(e) => setFormData({ ...formData, invoicePrefix: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 text-xs font-mono font-bold rounded-lg border border-slate-300 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Default Stok Minimum Alert
              </label>
              <input
                type="number"
                min="1"
                required
                value={formData.defaultMinStock}
                onChange={(e) => setFormData({ ...formData, defaultMinStock: parseInt(e.target.value) || 3 })}
                className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-xs transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Simpan Semua Pengaturan</span>
          </button>
        </div>
      </form>

      {/* Cadangan Data & Database Management */}
      <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
          Pemeliharaan &amp; Cadangan Database (SQLite Snapshot)
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Export JSON */}
          <button
            type="button"
            onClick={handleExportBackup}
            className="p-4 rounded-xl border border-slate-200 hover:border-blue-400 bg-slate-50 hover:bg-blue-50/40 text-left transition-colors group"
          >
            <Download className="w-5 h-5 text-blue-600 mb-2" />
            <h3 className="text-xs font-bold text-slate-800">Unduh Cadangan JSON</h3>
            <p className="text-[11px] text-slate-500 mt-1">
              Simpan seluruh data barang, harga, stok, dan penjualan ke file lokal.
            </p>
          </button>

          {/* Import JSON */}
          <label className="p-4 rounded-xl border border-slate-200 hover:border-emerald-400 bg-slate-50 hover:bg-emerald-50/40 text-left transition-colors cursor-pointer group">
            <Upload className="w-5 h-5 text-emerald-600 mb-2" />
            <h3 className="text-xs font-bold text-slate-800">Pulihkan / Import Data</h3>
            <p className="text-[11px] text-slate-500 mt-1">
              Muat file JSON cadangan untuk mengembalikan data sebelumnya.
            </p>
            <input
              type="file"
              accept=".json"
              onChange={handleImportBackup}
              className="hidden"
            />
          </label>

          {/* Reset Demo */}
          <button
            type="button"
            onClick={() => setConfirmReset(true)}
            className="p-4 rounded-xl border border-red-200 hover:border-red-400 bg-red-50/40 hover:bg-red-50 text-left transition-colors group"
          >
            <RotateCcw className="w-5 h-5 text-red-600 mb-2" />
            <h3 className="text-xs font-bold text-red-800">Reset ke Data Demo Awal</h3>
            <p className="text-[11px] text-red-600/80 mt-1">
              Kembalikan ke sampel data part komputer &amp; percetakan bawaan.
            </p>
          </button>
        </div>
      </div>

      {/* Confirm Reset Dialog */}
      {confirmReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-sm w-full p-5 shadow-2xl border border-slate-200">
            <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-3">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Konfirmasi Reset Database</h3>
            <p className="text-xs text-slate-500 mt-1">
              Semua perubahan transaksi dan stok akan dikembalikan ke data simulasi awal. Anda yakin?
            </p>
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                onClick={() => setConfirmReset(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  resetToDefaultData();
                  setConfirmReset(false);
                  window.location.reload();
                }}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-xs"
              >
                Ya, Reset Sekarang
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
