import React, { useState, useMemo } from 'react';
import { useStore } from '../context/StoreContext.js';
import { Product, ProductUnit } from '../types/index.js';
import { formatRupiah, calculateMargin, formatMargin } from '../utils/money.js';
import { getStockStatus, getStockStatusLabel } from '../utils/stock.js';
import { exportToCSV } from '../utils/export.js';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  Filter,
  Download,
  Boxes,
  Barcode,
  Layers,
  MapPin,
  Truck,
  X,
  AlertCircle,
  Tag,
  Check,
} from 'lucide-react';

export const ProductsView: React.FC = () => {
  const { products, categories, suppliers, addProduct, updateProduct, deleteProduct, addCategory } =
    useStore();

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'normal' | 'low' | 'out'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'sellPrice' | 'stock' | 'margin'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState<boolean>(false);
  const [newCategoryName, setNewCategoryName] = useState<string>('');
  const [newCategoryType, setNewCategoryType] = useState<'computer' | 'printing_supply'>('computer');

  // Form State
  const [formData, setFormData] = useState({
    code: '',
    barcode: '',
    name: '',
    categoryId: categories[0]?.id || '',
    brand: '',
    spec: '',
    unit: 'pcs' as ProductUnit,
    buyPrice: 0,
    sellPrice: 0,
    stock: 0,
    minStock: 3,
    location: '',
    supplierId: suppliers[0]?.id || '',
  });

  // Open modal for Create
  const handleOpenAdd = () => {
    setEditingProduct(null);
    setFormData({
      code: `PRD-${Date.now().toString().slice(-5)}`,
      barcode: '',
      name: '',
      categoryId: categories[0]?.id || '',
      brand: '',
      spec: '',
      unit: 'pcs',
      buyPrice: 0,
      sellPrice: 0,
      stock: 0,
      minStock: 3,
      location: 'Rak A-1',
      supplierId: suppliers[0]?.id || '',
    });
    setIsModalOpen(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      code: p.code,
      barcode: p.barcode || '',
      name: p.name,
      categoryId: p.categoryId,
      brand: p.brand,
      spec: p.spec,
      unit: p.unit,
      buyPrice: p.buyPrice,
      sellPrice: p.sellPrice,
      stock: p.stock,
      minStock: p.minStock,
      location: p.location,
      supplierId: p.supplierId,
    });
    setIsModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.code) return;

    const cat = categories.find((c) => c.id === formData.categoryId);
    const sup = suppliers.find((s) => s.id === formData.supplierId);

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        code: formData.code,
        barcode: formData.barcode,
        name: formData.name,
        categoryId: formData.categoryId,
        categoryName: cat?.name || 'Kategori',
        categoryType: cat?.type || 'computer',
        brand: formData.brand,
        spec: formData.spec,
        unit: formData.unit,
        buyPrice: Number(formData.buyPrice),
        sellPrice: Number(formData.sellPrice),
        stock: Number(formData.stock),
        minStock: Number(formData.minStock),
        location: formData.location,
        supplierId: formData.supplierId,
        supplierName: sup?.name || '-',
      });
    } else {
      addProduct({
        code: formData.code,
        barcode: formData.barcode,
        name: formData.name,
        categoryId: formData.categoryId,
        categoryName: cat?.name || 'Kategori',
        categoryType: cat?.type || 'computer',
        brand: formData.brand,
        spec: formData.spec,
        unit: formData.unit,
        buyPrice: Number(formData.buyPrice),
        sellPrice: Number(formData.sellPrice),
        stock: Number(formData.stock),
        minStock: Number(formData.minStock),
        location: formData.location,
        supplierId: formData.supplierId,
        supplierName: sup?.name || '-',
      });
    }

    setIsModalOpen(false);
  };

  const handleSaveNewCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    addCategory({
      name: newCategoryName.trim(),
      type: newCategoryType,
      description: `Kategori kustom ${newCategoryName}`,
    });
    setNewCategoryName('');
    setIsCategoryModalOpen(false);
  };

  // Filtered & sorted products
  const filteredProducts = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();

    return products
      .filter((p) => {
        // Search
        if (q) {
          const matchName = p.name.toLowerCase().includes(q);
          const matchCode = p.code.toLowerCase().includes(q);
          const matchBarcode = p.barcode?.toLowerCase().includes(q);
          const matchBrand = p.brand.toLowerCase().includes(q);
          if (!matchName && !matchCode && !matchBarcode && !matchBrand) return false;
        }

        // Category filter
        if (selectedCategory !== 'all' && p.categoryId !== selectedCategory) {
          return false;
        }

        // Stock condition filter
        const status = getStockStatus(p.stock, p.minStock);
        if (stockFilter === 'out' && status !== 'OUT_OF_STOCK') return false;
        if (stockFilter === 'low' && status !== 'LOW_STOCK') return false;
        if (stockFilter === 'normal' && status !== 'NORMAL') return false;

        return true;
      })
      .sort((a, b) => {
        let valA: string | number = a.name;
        let valB: string | number = b.name;

        if (sortBy === 'sellPrice') {
          valA = a.sellPrice;
          valB = b.sellPrice;
        } else if (sortBy === 'stock') {
          valA = a.stock;
          valB = b.stock;
        } else if (sortBy === 'margin') {
          valA = calculateMargin(a.sellPrice, a.buyPrice);
          valB = calculateMargin(b.sellPrice, b.buyPrice);
        }

        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [products, searchTerm, selectedCategory, stockFilter, sortBy, sortOrder]);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      'Kode SKU',
      'Barcode',
      'Nama Barang',
      'Kategori',
      'Merek',
      'Satuan',
      'Harga Modal (Rp)',
      'Harga Jual (Rp)',
      'Margin (%)',
      'Stok',
      'Min Stok',
      'Lokasi Rak',
      'Supplier',
    ];

    const rows = filteredProducts.map((p) => [
      p.code,
      p.barcode || '-',
      p.name,
      p.categoryName || '-',
      p.brand,
      p.unit,
      p.buyPrice,
      p.sellPrice,
      calculateMargin(p.sellPrice, p.buyPrice).toFixed(1),
      p.stock,
      p.minStock,
      p.location,
      p.supplierName || '-',
    ]);

    exportToCSV(`daftar_barang_${new Date().toISOString().slice(0, 10)}`, headers, rows);
  };

  // Form Margin preview
  const currentFormMargin = calculateMargin(Number(formData.sellPrice), Number(formData.buyPrice));
  const currentFormProfit = Number(formData.sellPrice) - Number(formData.buyPrice);

  return (
    <div className="space-y-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Manajemen Data Barang
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Kelola katalog part komputer, perlengkapan percetakan, harga, dan lokasi penyimpanan.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsCategoryModalOpen(true)}
            className="px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-xs"
          >
            <Tag className="w-3.5 h-3.5 text-slate-500" />
            <span>Kategori</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1.5 shadow-xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Ekspor CSV</span>
          </button>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Barang</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search box (5 cols) */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nama barang, kode SKU, barcode, merek..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-slate-200 text-xs bg-slate-50/50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Category Dropdown (3 cols) */}
          <div className="md:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-slate-50/50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="all">Semua Kategori ({products.length})</option>
              {categories
                .filter((c) => c.type !== 'service')
                .map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name} ({cat.type === 'computer' ? 'Part PC' : 'Percetakan'})
                  </option>
                ))}
            </select>
          </div>

          {/* Stock Filter (2 cols) */}
          <div className="md:col-span-2">
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value as any)}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-slate-50/50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="all">Kondisi Stok: Semua</option>
              <option value="normal">Stok Aman</option>
              <option value="low">Stok Menipis</option>
              <option value="out">Stok Habis (0)</option>
            </select>
          </div>

          {/* Sort By (2 cols) */}
          <div className="md:col-span-2">
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [by, order] = e.target.value.split('-') as any;
                setSortBy(by);
                setSortOrder(order);
              }}
              className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs bg-slate-50/50 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="name-asc">Nama (A - Z)</option>
              <option value="name-desc">Nama (Z - A)</option>
              <option value="sellPrice-asc">Harga Terendah</option>
              <option value="sellPrice-desc">Harga Tertinggi</option>
              <option value="stock-asc">Stok Paling Sedikit</option>
              <option value="stock-desc">Stok Terbanyak</option>
              <option value="margin-desc">Margin Tertinggi</option>
            </select>
          </div>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">Barang &amp; SKU</th>
                <th className="py-3 px-3">Kategori</th>
                <th className="py-3 px-3">Harga Modal</th>
                <th className="py-3 px-3">Harga Jual</th>
                <th className="py-3 px-3">Margin</th>
                <th className="py-3 px-3">Stok Fisik</th>
                <th className="py-3 px-3">Lokasi Rak</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Boxes className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="font-semibold text-sm">Tidak ada barang yang sesuai filter.</p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const status = getStockStatus(p.stock, p.minStock);
                  const statusBadge = getStockStatusLabel(status);
                  const margin = calculateMargin(p.sellPrice, p.buyPrice);

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Name & SKU */}
                      <td className="py-3 px-4 max-w-xs">
                        <div className="font-bold text-slate-800 leading-snug">
                          {p.name}
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-mono text-[11px] text-blue-600 font-semibold">
                            {p.code}
                          </span>
                          {p.barcode && (
                            <span className="text-[10px] text-slate-400 font-mono">
                              [{p.barcode}]
                            </span>
                          )}
                          <span className="text-[11px] text-slate-400">
                            • {p.brand}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                          {p.spec}
                        </p>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-3">
                        <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                          {p.categoryName}
                        </span>
                      </td>

                      {/* Buy Price */}
                      <td className="py-3 px-3 font-mono text-slate-600">
                        {formatRupiah(p.buyPrice)}
                      </td>

                      {/* Sell Price */}
                      <td className="py-3 px-3 font-mono font-bold text-blue-600">
                        {formatRupiah(p.sellPrice)}
                        <span className="text-[10px] font-normal text-slate-400">/{p.unit}</span>
                      </td>

                      {/* Margin % */}
                      <td className="py-3 px-3">
                        <span
                          className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                            margin >= 25
                              ? 'bg-emerald-50 text-emerald-700'
                              : margin >= 15
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {formatMargin(margin)}
                        </span>
                      </td>

                      {/* Stock & Status */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-slate-800">
                            {p.stock} {p.unit}
                          </span>
                          <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${statusBadge.badgeClass}`}>
                            {statusBadge.label}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400">
                          Min: {p.minStock} {p.unit}
                        </span>
                      </td>

                      {/* Storage Location */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1 text-slate-500">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[120px]">{p.location || '-'}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Edit Barang"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(p.id)}
                            className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Hapus Barang"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">
                {editingProduct ? 'Edit Data Barang' : 'Tambah Barang Baru'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-5 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* SKU Code */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kode Barang / SKU <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* Barcode */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Barcode (Opsional)
                  </label>
                  <input
                    type="text"
                    placeholder="Scan atau input barcode EAN/UPC"
                    value={formData.barcode}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* Nama Barang */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nama Barang Lengkap <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: SSD Samsung 980 500GB NVMe M.2"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* Kategori */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Kategori <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {categories
                      .filter((c) => c.type !== 'service')
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.type === 'computer' ? 'Part Komputer' : 'Percetakan'})
                        </option>
                      ))}
                  </select>
                </div>

                {/* Merek */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Merek / Brand
                  </label>
                  <input
                    type="text"
                    placeholder="Intel, Asus, PaperOne, Epson..."
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* Spesifikasi */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Spesifikasi Singkat
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: LGA1700, DDR4, Garansi 3 Tahun"
                    value={formData.spec}
                    onChange={(e) => setFormData({ ...formData, spec: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* Satuan */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Satuan Barang
                  </label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="pcs">Pcs (Satuan unit)</option>
                    <option value="unit">Unit</option>
                    <option value="set">Set (Combo)</option>
                    <option value="box">Box / Kotak</option>
                    <option value="rim">Rim (Kertas)</option>
                    <option value="pak">Pak (Isi pack)</option>
                    <option value="botol">Botol (Tinta)</option>
                    <option value="roll">Roll (Lakban/Kabel)</option>
                    <option value="lembar">Lembar</option>
                  </select>
                </div>

                {/* Supplier */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Supplier Utama
                  </label>
                  <select
                    value={formData.supplierId}
                    onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Harga Modal & Jual */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Harga Modal (Beli) Rp <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    required
                    value={formData.buyPrice || ''}
                    placeholder="0"
                    onChange={(e) => setFormData({ ...formData, buyPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-xs font-mono font-bold rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Harga Jual Rp <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    required
                    value={formData.sellPrice || ''}
                    placeholder="0"
                    onChange={(e) => setFormData({ ...formData, sellPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-xs font-mono font-bold text-blue-600 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* Margin Calculator Badge */}
                <div className="sm:col-span-2 p-3 bg-slate-50 rounded-lg border border-slate-200 flex items-center justify-between">
                  <div className="text-xs text-slate-600">
                    <span>Estimasi Laba per Unit: </span>
                    <strong className="text-slate-900 font-mono">
                      {formatRupiah(currentFormProfit)}
                    </strong>
                  </div>
                  <div className="text-xs">
                    <span className="text-slate-500 mr-1.5">Persentase Margin:</span>
                    <span
                      className={`font-mono font-bold px-2 py-0.5 rounded text-xs ${
                        currentFormMargin >= 20
                          ? 'bg-emerald-100 text-emerald-800'
                          : currentFormMargin > 0
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {formatMargin(currentFormMargin)}
                    </span>
                  </div>
                </div>

                {/* Stok & Min Stok */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Jumlah Stok Fisik <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-xs font-mono font-bold rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Stok Minimum (Alert Peringatan)
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.minStock}
                    onChange={(e) => setFormData({ ...formData, minStock: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-xs font-mono rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>

                {/* Lokasi Rak Penyimpanan */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Lokasi Rak / Penyimpanan
                  </label>
                  <input
                    type="text"
                    placeholder="Contoh: Etalase A1, Rak Kertas B-02, Gudang Belakang"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs transition-colors"
                >
                  {editingProduct ? 'Simpan Perubahan' : 'Tambahkan Barang'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-sm w-full p-5 shadow-2xl border border-slate-200">
            <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-3">
              <AlertCircle className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Konfirmasi Hapus Barang</h3>
            <p className="text-xs text-slate-500 mt-1">
              Apakah Anda yakin ingin menghapus produk ini dari database? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="mt-4 flex items-center justify-end gap-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  deleteProduct(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-xs"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl max-w-md w-full p-5 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Tambah Kategori Baru</h3>
              <button onClick={() => setIsCategoryModalOpen(false)}>
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSaveNewCategory} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nama Kategori
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Sound Card, Thermal Paste, dsb."
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Jenis Divisi
                </label>
                <select
                  value={newCategoryType}
                  onChange={(e) => setNewCategoryType(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="computer">Part &amp; Aksesoris Komputer</option>
                  <option value="printing_supply">Perlengkapan Percetakan</option>
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-xs"
                >
                  Simpan Kategori
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
